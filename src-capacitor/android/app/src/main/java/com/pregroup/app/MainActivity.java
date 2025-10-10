package com.pregroup.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register Firebase plugins
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.app.FirebaseAppPlugin.class);
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin.class);
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.firestore.FirebaseFirestorePlugin.class);
    }
}
