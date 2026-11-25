package com.bitcoin.overlay;

import android.content.Context;
import android.content.SharedPreferences;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

final class PriceAlert {
    static final String CONNECTING = "connecting";
    static final String WATCHING = "watching";
    static final String CHECKING = "checking";
    static final String RECONNECTING = "reconnecting";
    static final String TRIGGERED = "triggered";
    static final String OFF = "off";
    static final String SAVE_FAILED = "save_failed";

    final BigDecimal target;
    final boolean above;
    final boolean swedish;
    final long armedAt;

    PriceAlert(BigDecimal target, boolean above, boolean swedish, long armedAt) {
        this.target = target;
        this.above = above;
        this.swedish = swedish;
        this.armedAt = armedAt;
    }

    static BigDecimal parseTarget(String input) {
        String normalized = input.trim().replace(",", ".");
        if (!normalized.matches("[0-9]{1,15}(?:\\.[0-9]{1,2})?")) return null;
        BigDecimal value = new BigDecimal(normalized);
        return value.signum() > 0 ? value : null;
    }

    boolean matches(BigDecimal trade) {
        int comparison = trade.compareTo(target);
        return above ? comparison >= 0 : comparison <= 0;
    }

    static SharedPreferences store(Context context) {
        return context.getSharedPreferences("price_alert", Context.MODE_PRIVATE);
    }

    static PriceAlert read(SharedPreferences store) {
        BigDecimal target = parseTarget(store.getString("target", ""));
        if (target == null) return null;
        return new PriceAlert(target, store.getBoolean("above", false),
            store.getBoolean("swedish", false), store.getLong("armedAt", 0));
    }

    static boolean isArmed(String phase) {
        return CONNECTING.equals(phase) || WATCHING.equals(phase) || CHECKING.equals(phase) || RECONNECTING.equals(phase);
    }

    boolean save(SharedPreferences store) {
        return store.edit().putString("target", target.toPlainString()).putBoolean("above", above)
            .putBoolean("swedish", swedish).putLong("armedAt", armedAt)
            .putString("phase", CONNECTING).remove("hit").remove("hitTime").commit();
    }

    String targetLine(boolean inSwedish) {
        String money = usd(target, inSwedish);
        if (above) return inSwedish ? money + " eller högre" : money + " or above";
        return inSwedish ? money + " eller lägre" : money + " or below";
    }

    static String usd(BigDecimal price, boolean inSwedish) {
        NumberFormat number = NumberFormat.getNumberInstance(inSwedish ? new Locale("sv", "SE") : Locale.US);
        number.setMaximumFractionDigits(2);
        return "$" + number.format(price);
    }
}
