package com.pregroup.app;

import android.os.Bundle;
import android.webkit.WebView;
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
    }
}
