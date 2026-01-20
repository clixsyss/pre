package com.pregroup.app;

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
        
        // Initialize Firebase (similar to iOS FirebaseApp.configure())
        FirebaseApp.initializeApp(this);
        
        // Enable WebView debugging for better error tracking
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Enable edge-to-edge display and handle window insets properly
        // This allows the webview to extend behind system UI, and our JavaScript
        // safe area calculation will add appropriate padding
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Allow content to draw behind system bars
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            
            // Set status bar to be transparent/overlay so webview can draw behind it
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
            
            // Set status bar color to match app header (dark color)
            getWindow().setStatusBarColor(0xFF231F20); // #231F20
        }
    }
}
