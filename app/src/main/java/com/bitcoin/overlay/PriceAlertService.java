package com.bitcoin.overlay;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import org.json.JSONException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class PriceAlertService extends Service implements BitstampAlertFeed.Listener {
    static final String ARM = "com.bitcoin.overlay.ARM_PRICE";
    static final String CANCEL = "com.bitcoin.overlay.CANCEL_PRICE";
    static final String ALERT_CHANNEL = "price_target_hit";
    private static final String WATCH_CHANNEL = "price_watch";
    private static final int WATCH_ID = 1;
    private static final int HIT_ID = 2;

    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService history = Executors.newSingleThreadExecutor();
    private final Runnable connect = this::connect;
    private final Runnable checkHistory = this::readHistory;
    private final Runnable connectTimeout = () -> retry(this.feed);
    private SharedPreferences store;
    private NotificationManager notifications;
    private PowerManager.WakeLock wakeLock;
    private PriceAlert active;
    private PriceAlert readingHistoryFor;
    private BitstampAlertFeed feed;
    private int failures;
    private boolean lookingUpInitialPrice;
    private boolean subscribed;

    // The alert activity and service both run on the app process's main thread.
    static boolean running;

    static void createChannels(NotificationManager manager, boolean sv) {
        NotificationChannel watch = new NotificationChannel(WATCH_CHANNEL,
            sv ? "Bevakning av bitcoinpriset" : "Bitcoin price monitoring", NotificationManager.IMPORTANCE_LOW);
        manager.createNotificationChannel(watch);
        NotificationChannel hit = new NotificationChannel(ALERT_CHANNEL,
            sv ? "Prislarm för bitcoin" : "Bitcoin price alarms", NotificationManager.IMPORTANCE_HIGH);
        hit.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
            new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build());
        hit.enableVibration(true);
        hit.setVibrationPattern(new long[] {0, 250, 150, 350});
        manager.createNotificationChannel(hit);
    }

    static void cancel(Context context) {
        SharedPreferences store = PriceAlert.store(context);
        if (!PriceAlert.isArmed(store.getString("phase", PriceAlert.OFF))) return;
        store.edit().putString("phase", PriceAlert.OFF).commit();
        context.stopService(new Intent(context, PriceAlertService.class));
    }

    @Override public void onCreate() {
        super.onCreate();
        store = PriceAlert.store(this);
        notifications = getSystemService(NotificationManager.class);
    }

    @Override public IBinder onBind(Intent intent) {
        return null;
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && CANCEL.equals(intent.getAction())) {
            if (PriceAlert.isArmed(store.getString("phase", PriceAlert.OFF))
                && store.getLong("armedAt", 0) == intent.getLongExtra("armedAt", -1)) {
                cancel(this);
                return START_NOT_STICKY;
            }
            if (active == null) stopSelf(startId);
            return active == null ? START_NOT_STICKY : START_STICKY;
        }

        PriceAlert selected;
        if (intent != null && ARM.equals(intent.getAction())) {
            String raw = intent.getStringExtra("target");
            BigDecimal target = raw == null ? null : PriceAlert.parseTarget(raw);
            if (target == null) {
                if (active == null) stopSelf(startId);
                return active == null ? START_NOT_STICKY : START_STICKY;
            }
            selected = new PriceAlert(target, intent.getBooleanExtra("above", false),
                intent.getBooleanExtra("swedish", false), System.currentTimeMillis());
            if (!selected.save(store)) {
                active = null;
                closeFeed();
                store.edit().putString("phase", PriceAlert.SAVE_FAILED).apply();
                stopSelf(startId);
                return START_NOT_STICKY;
            }
        } else {
            selected = PriceAlert.read(store);
            if (selected == null || !PriceAlert.isArmed(store.getString("phase", PriceAlert.OFF))) {
                stopSelf(startId);
                return START_NOT_STICKY;
            }
        }

        closeFeed();
        main.removeCallbacks(connect);
        active = selected;
        failures = 0;
        lookingUpInitialPrice = System.currentTimeMillis() - active.armedAt <= 60_000;
        createChannels(notifications, active.swedish);
        notifications.cancel(HIT_ID);
        Notification watching = monitoringNotification(PriceAlert.CONNECTING);
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(WATCH_ID, watching, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(WATCH_ID, watching);
        }
        running = true;
        store.edit().putString("phase", PriceAlert.CONNECTING).apply();

        if (wakeLock == null) {
            PowerManager power = getSystemService(PowerManager.class);
            wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "TradingViewBTC:PriceAlert");
            wakeLock.acquire();
        }
        readHistory();
        connect();
        return START_STICKY;
    }

    private boolean isMonitoring() {
        return active != null && PriceAlert.isArmed(store.getString("phase", PriceAlert.OFF));
    }

    private void connect() {
        if (!isMonitoring()) return;
        feed = new BitstampAlertFeed(this);
        feed.connect();
        main.postDelayed(connectTimeout, 20_000);
    }

    @Override public void subscribed(BitstampAlertFeed source) {
        main.post(() -> connected(source));
    }

    private void connected(BitstampAlertFeed source) {
        if (feed != source || subscribed || !isMonitoring()) return;
        subscribed = true;
        waitForTrades();
        failures = 0;
        updatePhase(PriceAlert.WATCHING);
        readHistory();
    }

    private void readHistory() {
        main.removeCallbacks(checkHistory);
        if (!isMonitoring() || readingHistoryFor == active) return;
        PriceAlert watched = active;
        readingHistoryFor = watched;
        history.execute(() -> {
            try {
                List<BitstampAlertFeed.Trade> recent = BitstampAlertFeed.recentTrades();
                main.post(() -> onHistory(watched, recent));
            } catch (IOException | JSONException unavailable) {
                main.post(() -> onHistory(watched, null));
            }
        });
    }

    private void onHistory(PriceAlert watched, List<BitstampAlertFeed.Trade> recent) {
        if (readingHistoryFor == watched) readingHistoryFor = null;
        if (active != watched || !isMonitoring()) return;
        if (recent != null && !recent.isEmpty()) {
            BitstampAlertFeed.Trade match =
                BitstampAlertFeed.matchingRecentTrade(recent, watched, lookingUpInitialPrice);
            lookingUpInitialPrice = false;
            if (match != null) {
                fire(match);
                return;
            }
        }
        // Check the recent trade window until the live socket is available again.
        if (!subscribed) {
            updatePhase(recent != null ? PriceAlert.CHECKING : PriceAlert.RECONNECTING);
            main.postDelayed(checkHistory, recent != null ? 5_000 : 10_000);
        }
    }

    @Override public void trade(BitstampAlertFeed source, BitstampAlertFeed.Trade trade) {
        main.post(() -> {
            if (feed != source || !isMonitoring()) return;
            connected(source);
            waitForTrades();
            if (trade.millis >= active.armedAt && active.matches(trade.price)) fire(trade);
        });
    }

    private void waitForTrades() {
        main.removeCallbacks(connectTimeout);
        main.postDelayed(connectTimeout, 45_000);
    }

    @Override public void disconnected(BitstampAlertFeed source) {
        main.post(() -> retry(source));
    }

    private void retry(BitstampAlertFeed source) {
        if (source == null || source != feed || !isMonitoring()) return;
        closeFeed();
        if (!PriceAlert.CHECKING.equals(store.getString("phase", PriceAlert.OFF))) {
            updatePhase(PriceAlert.RECONNECTING);
        }
        readHistory();
        main.postDelayed(connect, Math.min(30_000L, 1000L << Math.min(failures++, 5)));
    }

    private void closeFeed() {
        main.removeCallbacks(connectTimeout);
        BitstampAlertFeed previous = feed;
        feed = null;
        subscribed = false;
        if (previous != null) previous.closeConnection(1000, "Stopped monitoring this connection");
    }

    private void updatePhase(String phase) {
        if (phase.equals(store.getString("phase", PriceAlert.OFF))) return;
        store.edit().putString("phase", phase).apply();
        notifications.notify(WATCH_ID, monitoringNotification(phase));
    }

    private void fire(BitstampAlertFeed.Trade trade) {
        PriceAlert hit = active;
        if (!isMonitoring()) return;
        // Try to save the hit before posting it. The notification still matters
        // if the device is out of storage and the change remains in memory.
        store.edit().putString("phase", PriceAlert.TRIGGERED).putString("hit", trade.price.toPlainString())
            .putLong("hitTime", trade.millis).commit();
        active = null;
        closeFeed();
        main.removeCallbacks(connect);
        main.removeCallbacks(checkHistory);

        String price = PriceAlert.usd(trade.price, hit.swedish);
        String title = hit.swedish ? "Bitcoins prismål uppnått" : "Bitcoin price target hit";
        String detail = "Bitstamp BTC/USD " + price + " · " + hit.targetLine(hit.swedish);
        Notification alarm = new Notification.Builder(this, ALERT_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title).setContentText(detail).setStyle(new Notification.BigTextStyle().bigText(detail))
            .setCategory(Notification.CATEGORY_ALARM).setAutoCancel(true).setWhen(trade.millis).setShowWhen(true)
            .setContentIntent(openAlert(hit.swedish)).build();
        notifications.notify(HIT_ID, alarm);
        stopSelf();
    }

    private PendingIntent openAlert(boolean swedish) {
        Intent open = new Intent(this, PriceAlertActivity.class).putExtra("swedish", swedish);
        return PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private Notification monitoringNotification(String phase) {
        String status;
        if (PriceAlert.RECONNECTING.equals(phase)) status = active.swedish ? "Återansluter" : "Reconnecting";
        else if (PriceAlert.WATCHING.equals(phase)) status = active.swedish ? "Bevakar" : "Watching";
        else if (PriceAlert.CHECKING.equals(phase)) status = active.swedish ? "Kontrollerar avslut" : "Checking recent trades";
        else status = active.swedish ? "Ansluter" : "Connecting";
        Intent cancel = new Intent(this, PriceAlertService.class).setAction(CANCEL).putExtra("armedAt", active.armedAt);
        PendingIntent stop = PendingIntent.getService(this, 0, cancel,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Action cancelAction = new Notification.Action.Builder(null,
            active.swedish ? "Avbryt" : "Cancel", stop).build();
        return new Notification.Builder(this, WATCH_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(status + " · " + active.targetLine(active.swedish))
            .setContentText("Bitstamp BTC/USD")
            .setContentIntent(openAlert(active.swedish)).setOnlyAlertOnce(true).setOngoing(true)
            .setShowWhen(false).addAction(cancelAction).build();
    }

    @Override public void onDestroy() {
        running = false;
        active = null;
        closeFeed();
        main.removeCallbacksAndMessages(null);
        history.shutdownNow();
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        stopForeground(STOP_FOREGROUND_REMOVE);
        super.onDestroy();
    }
}
