package com.bitcoin.overlay;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.InputType;
import android.text.method.DigitsKeyListener;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TextView;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.util.Date;
import java.util.Locale;

public final class PriceAlertActivity extends Activity {
    private static final int NOTIFICATIONS_PERMISSION = 1;
    private SharedPreferences store;
    private NotificationManager notifications;
    private boolean swedish;
    private EditText amount;
    private RadioButton above;
    private TextView status;
    private TextView batteryNote;
    private Button arm;
    private Button cancel;
    private Button batterySettings;
    private boolean armOnFocus;
    private final SharedPreferences.OnSharedPreferenceChangeListener stateListener =
        (preferences, key) -> status.post(this::renderStatus);

    @Override
    @SuppressWarnings("deprecation")
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        swedish = getIntent().getBooleanExtra("swedish", false);
        store = PriceAlert.store(this);
        notifications = getSystemService(NotificationManager.class);
        PriceAlertService.createChannels(notifications, swedish);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
            | WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);

        ScrollView scroll = new ScrollView(this);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(20), dp(18), dp(20), dp(14));
        content.setFocusableInTouchMode(true);
        scroll.addView(content);

        TextView title = text(content, tr("Bitcoin price alert", "Prislarm för bitcoin"), 23);
        if (Build.VERSION.SDK_INT >= 28) title.setAccessibilityHeading(true);
        text(content, "Bitstamp BTC/USD", 14);

        TextView amountLabel = text(content, tr("Target price (USD)", "Målpris (USD)"), 15);
        amount = new EditText(this);
        amount.setId(View.generateViewId());
        amount.setSingleLine(true);
        amount.setKeyListener(DigitsKeyListener.getInstance("0123456789.,"));
        amount.setRawInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        amount.setHint(swedish ? "60000,50" : "60000.50");
        amountLabel.setLabelFor(amount.getId());
        content.addView(amount);

        RadioGroup directions = new RadioGroup(this);
        RadioButton below = new RadioButton(this);
        below.setId(View.generateViewId());
        below.setText(tr("At or below", "Vid eller under"));
        directions.addView(below);
        above = new RadioButton(this);
        above.setId(View.generateViewId());
        above.setText(tr("At or above", "Vid eller över"));
        directions.addView(above);
        content.addView(directions);

        PriceAlert previous = PriceAlert.read(store);
        String priorAmount = previous == null ? "" : previous.target.toPlainString();
        if (swedish) priorAmount = priorAmount.replace('.', ',');
        amount.setText(saved == null ? priorAmount : saved.getString("amount", priorAmount));
        boolean initialAbove = saved == null ? previous != null && previous.above : saved.getBoolean("above");
        directions.check(initialAbove ? above.getId() : below.getId());

        status = text(content, "", 16);
        status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        arm = button(content, "", view -> armAlert());
        cancel = button(content, tr("Cancel alert", "Avbryt larm"), view -> {
            PriceAlertService.cancel(this);
            renderStatus();
        });
        batteryNote = text(content, tr(
            "For monitoring in deep sleep, allow TradingViewBTC to run without battery optimization.",
            "Tillåt TradingViewBTC att köras utan batterioptimering för bevakning i djup vila."), 14);
        batterySettings = button(content, tr("Battery settings", "Batteriinställningar"),
            view -> openSettings(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)));
        button(content, tr("Notification settings", "Aviseringsinställningar"), view -> {
            String action = notifications.areNotificationsEnabled()
                ? Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS : Settings.ACTION_APP_NOTIFICATION_SETTINGS;
            openSettings(new Intent(action).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())
                .putExtra(Settings.EXTRA_CHANNEL_ID, PriceAlertService.ALERT_CHANNEL));
        });
        button(content, tr("Close", "Stäng"), view -> finish());
        MainActivity.setContentBelowSystemBars(this, scroll);
        content.requestFocus();
    }

    @Override protected void onResume() {
        super.onResume();
        store.registerOnSharedPreferenceChangeListener(stateListener);
        renderStatus();
    }

    @Override protected void onPause() {
        store.unregisterOnSharedPreferenceChangeListener(stateListener);
        super.onPause();
    }

    @Override protected void onSaveInstanceState(Bundle outgoing) {
        outgoing.putString("amount", amount.getText().toString());
        outgoing.putBoolean("above", above.isChecked());
        super.onSaveInstanceState(outgoing);
    }

    private void armAlert() {
        BigDecimal target = PriceAlert.parseTarget(amount.getText().toString());
        if (target == null) {
            amount.setError(tr("Enter a positive price with up to two decimal places.",
                "Ange ett positivt pris med högst två decimaler."));
            return;
        }
        if (Build.VERSION.SDK_INT >= 33
            && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATIONS_PERMISSION);
            return;
        }
        if (!notificationsEnabled()) {
            renderStatus();
            return;
        }
        Intent intent = new Intent(this, PriceAlertService.class).setAction(PriceAlertService.ARM)
            .putExtra("target", target.toPlainString()).putExtra("above", above.isChecked())
            .putExtra("swedish", swedish);
        try {
            startForegroundService(intent);
            getSystemService(InputMethodManager.class).hideSoftInputFromWindow(amount.getWindowToken(), 0);
        } catch (IllegalStateException | SecurityException unavailable) {
            status.setText(tr("Android couldn’t start price monitoring. Try again here.",
                "Android kunde inte starta prisbevakningen. Försök igen här."));
        }
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code != NOTIFICATIONS_PERMISSION) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            if (hasWindowFocus()) armAlert();
            else armOnFocus = true;
        } else renderStatus();
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && armOnFocus) {
            armOnFocus = false;
            armAlert();
        }
    }

    private boolean notificationsEnabled() {
        NotificationChannel channel = notifications.getNotificationChannel(PriceAlertService.ALERT_CHANNEL);
        return notifications.areNotificationsEnabled() && channel != null
            && channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
    }

    private void renderStatus() {
        PriceAlert alert = PriceAlert.read(store);
        String phase = store.getString("phase", PriceAlert.OFF);
        boolean armed = alert != null && PriceAlert.isArmed(phase);
        boolean active = armed && PriceAlertService.running;
        String line = tr("No active alert.", "Inget aktivt prislarm.");
        if (active) {
            String watch = tr("Connecting to Bitstamp", "Ansluter till Bitstamp");
            if (PriceAlert.WATCHING.equals(phase)) watch = tr("Watching", "Bevakar");
            else if (PriceAlert.CHECKING.equals(phase)) {
                watch = tr("Checking recent Bitstamp trades", "Kontrollerar Bitstamps senaste avslut");
            } else if (PriceAlert.RECONNECTING.equals(phase)) {
                watch = tr("Bitstamp disconnected. Reconnecting", "Bitstamp frånkopplad. Återansluter");
            }
            line = watch + " · " + alert.targetLine(swedish);
        } else if (armed) {
            line = tr("Monitoring stopped. Tap Arm alert to resume.",
                "Bevakningen har stoppats. Tryck på Aktivera larm för att fortsätta.");
        } else if (PriceAlert.SAVE_FAILED.equals(phase)) {
            line = tr("Couldn’t save the alert. Try again.", "Kunde inte spara larmet. Försök igen.");
        } else if (alert != null && PriceAlert.TRIGGERED.equals(phase)) {
            String hit = store.getString("hit", "");
            if (!hit.isEmpty()) {
                BigDecimal trade = new BigDecimal(hit);
                Date time = new Date(store.getLong("hitTime", 0));
                DateFormat format = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.MEDIUM,
                    swedish ? new Locale("sv", "SE") : Locale.US);
                line = tr("Target hit", "Målet uppnått") + " · " + PriceAlert.usd(trade, swedish)
                    + "\n" + format.format(time);
            }
        }
        if (!notificationsEnabled()) line += "\n" + tr("Allow price alarm notifications to hear the alert.",
            "Tillåt prisaviseringar för att höra larmet.");
        status.setText(line);
        arm.setText(active ? tr("Update alert", "Uppdatera larm") : tr("Arm alert", "Aktivera larm"));
        cancel.setVisibility(armed ? View.VISIBLE : View.GONE);
        boolean exempt = getSystemService(PowerManager.class).isIgnoringBatteryOptimizations(getPackageName());
        batteryNote.setVisibility(exempt ? View.GONE : View.VISIBLE);
        batterySettings.setVisibility(exempt ? View.GONE : View.VISIBLE);
    }

    private void openSettings(Intent intent) {
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException unavailable) {
            startActivity(new Intent(Settings.ACTION_SETTINGS));
        }
    }

    private String tr(String english, String svenska) {
        return swedish ? svenska : english;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private TextView text(LinearLayout parent, String value, float size) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setPadding(0, dp(6), 0, dp(6));
        parent.addView(view);
        return view;
    }

    private Button button(LinearLayout parent, String label, View.OnClickListener click) {
        Button view = new Button(this);
        view.setText(label);
        view.setOnClickListener(click);
        parent.addView(view);
        return view;
    }
}
