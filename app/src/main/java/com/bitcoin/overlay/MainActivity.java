package com.bitcoin.overlay;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.LocaleList;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import javax.net.ssl.HttpsURLConnection;

public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String HOME = "https://" + HOST + "/index.html";
    private static final String PRICE = "https://www.bitstamp.net/api/v2/ohlc/btcusd/";
    private static final String MINING = "https://mempool.space/api/v1/mining/hashrate/all";
    private static final String REPOSITORY = "https://github.com/adlererik/TradingViewBTC";
    private WebView webView;
    private String homeUrl;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 17, 23));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setTextZoom(100);
        webView.setWebViewClient(new LocalClient());

        setContentBelowSystemBars(this, webView);
        LocaleList locales = Resources.getSystem().getConfiguration().getLocales();
        String language = locales.isEmpty() ? "en" : locales.get(0).getLanguage();
        homeUrl = Uri.parse(HOME).buildUpon().appendQueryParameter("lang", language).build().toString();
        webView.loadUrl(homeUrl);
    }

    @SuppressWarnings("deprecation")
    static void setContentBelowSystemBars(Activity activity, View content) {
        int background = Color.rgb(13, 17, 23);
        if (Build.VERSION.SDK_INT >= 35) {
            activity.getWindow().setDecorFitsSystemWindows(false);
            android.view.WindowInsetsController controller = activity.getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(0,
                    android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    | android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            }
            // Inset the WebView's viewport itself rather than padding within it.
            FrameLayout safeArea = new FrameLayout(activity);
            safeArea.setBackgroundColor(background);
            safeArea.addView(content, new FrameLayout.LayoutParams(-1, -1));
            safeArea.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets edges = insets.getInsetsIgnoringVisibility(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                int ime = insets.getInsets(WindowInsets.Type.ime()).bottom;
                view.setPadding(edges.left, edges.top, edges.right, Math.max(edges.bottom, ime));
                return WindowInsets.CONSUMED;
            });
            activity.setContentView(safeArea);
            safeArea.post(safeArea::requestApplyInsets);
        } else {
            activity.getWindow().setStatusBarColor(background);
            activity.getWindow().setNavigationBarColor(background);
            activity.getWindow().getDecorView().setSystemUiVisibility(0);
            activity.setContentView(content);
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            setContentView(new View(this));
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private final class LocalClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (!request.isForMainFrame()) return true;
            if (homeUrl.equals(uri.toString())) return false;
            if (request.hasGesture() && "https".equals(uri.getScheme())) {
                if (HOST.equals(uri.getHost()) && "/price-alert".equals(uri.getPath())) {
                    startActivity(new Intent(MainActivity.this, PriceAlertActivity.class)
                        .putExtra("swedish", "sv".equals(uri.getQueryParameter("lang"))));
                } else if (REPOSITORY.equals(uri.toString())) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(REPOSITORY)));
                    } catch (ActivityNotFoundException unavailable) {
                        Toast.makeText(MainActivity.this, REPOSITORY, Toast.LENGTH_LONG).show();
                    }
                }
            }
            return true;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (!"GET".equals(request.getMethod()) || !"https".equals(uri.getScheme())
                || !HOST.equals(uri.getHost())) {
                return message(403, "Forbidden");
            }
            String path = uri.getPath();
            if (path == null) return message(404, "Not Found");
            try {
                if ("/market/candles".equals(path)) return proxy(priceUrl(uri));
                if ("/market/mining".equals(path)) return proxy(MINING);
                if (path.matches("/(?:index\\.html|[a-z]+\\.(?:mjs|css))")) {
                    return new WebResourceResponse(mime(path), "utf-8",
                        getAssets().open(path.substring(1)));
                }
            } catch (IllegalArgumentException ex) {
                return message(400, "Bad Request");
            } catch (IOException ex) {
                return message(503, "Data Source Unavailable");
            }
            return message(404, "Not Found");
        }
    }

    private static String priceUrl(Uri uri) {
        String step = uri.getQueryParameter("step");
        String limit = uri.getQueryParameter("limit");
        String end = uri.getQueryParameter("end");
        if (step == null || !step.matches("60|300|900|1800|3600|14400|43200|86400|259200")
            || limit == null || !limit.matches("[0-9]{1,4}")
            || Integer.parseInt(limit) < 1 || Integer.parseInt(limit) > 1000
            || (end != null && !end.matches("[0-9]{1,12}"))) {
            throw new IllegalArgumentException("Invalid candle request");
        }
        return PRICE + "?step=" + step + "&limit=" + limit + (end == null ? "" : "&end=" + end);
    }

    private static WebResourceResponse proxy(String url) throws IOException {
        HttpsURLConnection connection = (HttpsURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(8_000);
        connection.setReadTimeout(12_000);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Accept", "application/json");
        try {
            if (connection.getResponseCode() != 200) return message(502, "Data Source Error");
            try (InputStream input = connection.getInputStream();
                 java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    if (output.size() + count > 3_000_000) throw new IOException("Response too large");
                    output.write(buffer, 0, count);
                }
                return new WebResourceResponse("application/json", "utf-8", 200, "OK",
                    Collections.singletonMap("Cache-Control", "no-store"),
                    new ByteArrayInputStream(output.toByteArray()));
            }
        } finally {
            connection.disconnect();
        }
    }

    private static WebResourceResponse message(int status, String reason) {
        return new WebResourceResponse("text/plain", "utf-8", status, reason,
            Collections.singletonMap("Cache-Control", "no-store"),
            new ByteArrayInputStream(reason.getBytes(StandardCharsets.UTF_8)));
    }

    private static String mime(String path) {
        if (path.endsWith(".mjs")) return "text/javascript";
        return path.endsWith(".css") ? "text/css" : "text/html";
    }
}
