package com.pregroup.app;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Detect widget / shortcut gate-open intent and flag it in SharedPreferences
        // so the JS boot file can pick it up before the router guard fires.
        handleGateOpenIntent(getIntent());

        // Initialize Firebase (similar to iOS FirebaseApp.configure())
        FirebaseApp.initializeApp(this);

        // Enable WebView debugging for better error tracking
        WebView.setWebContentsDebuggingEnabled(true);

        // Enable edge-to-edge display and handle window insets properly
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
            getWindow().setStatusBarColor(0xFF231F20);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Warm start: app already running, widget tapped again
        handleGateOpenIntent(intent);
    }

    private void handleGateOpenIntent(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data == null) return;
        String url = data.toString();
        if (!url.contains("open-gate")) return;

        String source = data.getQueryParameter("source");
        if (source == null) source = "android-widget";

        android.util.Log.d("MainActivity", "Gate widget intent detected, source: " + source);

        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
        prefs.edit()
            .putString("pendingGateOpenSource", source)
            .putString("pendingGateOpenTimestamp", String.valueOf(System.currentTimeMillis()))
            .apply();
    }
}
