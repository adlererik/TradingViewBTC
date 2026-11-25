package com.bitcoin.overlay;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import javax.net.ssl.HttpsURLConnection;

final class BitstampAlertFeed extends WebSocketClient {
    static final String CHANNEL = "live_trades_btcusd";
    private static final URI SOCKET = URI.create("wss://ws.bitstamp.net");
    private static final String RECENT = "https://www.bitstamp.net/api/v2/transactions/btcusd/?time=minute";

    interface Listener {
        void subscribed(BitstampAlertFeed feed);
        void trade(BitstampAlertFeed feed, Trade trade);
        void disconnected(BitstampAlertFeed feed);
    }

    static final class Trade {
        final BigDecimal price;
        final long millis;
        final long id;

        Trade(BigDecimal price, long millis, long id) {
            this.price = price;
            this.millis = millis;
            this.id = id;
        }

        static Trade read(JSONObject json) {
            String raw = json.optString("price");
            if (raw.length() > 32) return null;
            try {
                BigDecimal price = new BigDecimal(raw).stripTrailingZeros();
                if (price.scale() < -14 || price.scale() > 10 || price.precision() - price.scale() > 15) return null;
                long micros = json.optLong("microtimestamp");
                long millis = micros > 0 ? micros / 1000
                    : Math.multiplyExact(json.optLong("timestamp", json.optLong("date")), 1000);
                if (price.signum() <= 0 || millis <= 0) return null;
                return new Trade(price, millis, json.optLong("id", json.optLong("tid")));
            } catch (NumberFormatException | ArithmeticException invalid) {
                return null;
            }
        }
    }

    private final Listener listener;

    BitstampAlertFeed(Listener listener) {
        super(SOCKET, new Draft_6455(Collections.emptyList(), 64 * 1024), Collections.emptyMap(), 8000);
        this.listener = listener;
        setConnectionLostTimeout(20);
        setDaemon(true);
    }

    @Override public void onOpen(ServerHandshake handshake) {
        send("{\"event\":\"bts:subscribe\",\"data\":{\"channel\":\"" + CHANNEL + "\"}}");
    }

    @Override public void onMessage(String message) {
        try {
            JSONObject json = new JSONObject(message);
            String event = json.optString("event");
            if ("bts:request_reconnect".equals(event) || "bts:error".equals(event)) {
                listener.disconnected(this);
                return;
            }
            if (!CHANNEL.equals(json.optString("channel"))) return;
            if ("bts:subscription_succeeded".equals(event)) listener.subscribed(this);
            JSONObject payload = json.optJSONObject("data");
            if (!"trade".equals(event) || payload == null) return;
            Trade trade = Trade.read(payload);
            if (trade != null) listener.trade(this, trade);
        } catch (JSONException invalid) {
            // Ignore malformed frames without changing the armed target.
        }
    }

    @Override public void onClose(int code, String reason, boolean remote) {
        listener.disconnected(this);
    }

    @Override public void onError(Exception error) {
        listener.disconnected(this);
    }

    static List<Trade> recentTrades() throws IOException, JSONException {
        HttpsURLConnection connection = (HttpsURLConnection) new URL(RECENT).openConnection();
        connection.setConnectTimeout(6000);
        connection.setReadTimeout(6000);
        connection.setInstanceFollowRedirects(false);
        connection.setUseCaches(false);
        connection.setRequestProperty("Accept", "application/json");
        try {
            if (connection.getResponseCode() != 200) throw new IOException("Bitstamp trade history unavailable");
            try (InputStream in = connection.getInputStream(); ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
                byte[] chunk = new byte[4096];
                int count;
                while ((count = in.read(chunk)) != -1) {
                    if (bytes.size() + count > 512_000) throw new IOException("Trade history too large");
                    bytes.write(chunk, 0, count);
                }
                JSONArray json = new JSONArray(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
                List<Trade> trades = new ArrayList<>();
                for (int i = 0; i < json.length(); i++) {
                    JSONObject row = json.optJSONObject(i);
                    Trade trade = row == null ? null : Trade.read(row);
                    if (trade != null) trades.add(trade);
                }
                trades.sort(Comparator.comparingLong((Trade t) -> t.millis).thenComparingLong(t -> t.id));
                return trades;
            }
        } finally {
            connection.disconnect();
        }
    }

    static Trade matchingRecentTrade(List<Trade> trades, PriceAlert alert, boolean initialSnapshot) {
        Trade latestAtArm = null;
        for (Trade trade : trades) {
            if (trade.millis < alert.armedAt) {
                latestAtArm = trade;
                continue;
            }
            if (alert.matches(trade.price)) return trade;
        }
        return initialSnapshot && latestAtArm != null && alert.matches(latestAtArm.price)
            && alert.armedAt - latestAtArm.millis <= 60_000 ? latestAtArm : null;
    }
}
