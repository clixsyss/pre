#!/bin/bash

# Gate Control BLE Feature Installation Script
# This script installs and configures the BLE feature for the Quasar app

echo "🚀 Installing Gate Control BLE Feature..."
echo ""

# Step 1: Install BLE plugin for Capacitor
echo "📦 Step 1: Installing @capacitor-community/bluetooth-le..."
npm install @capacitor-community/bluetooth-le
echo "✅ BLE plugin installed"
echo ""

# Step 2: Sync Capacitor
echo "🔄 Step 2: Syncing Capacitor..."
npx cap sync
echo "✅ Capacitor synced"
echo ""

# Step 3: Instructions for Android permissions
echo "⚙️ Step 3: Android Configuration"
echo "Please add the following permissions to android/app/src/main/AndroidManifest.xml:"
echo ""
echo '<uses-permission android:name="android.permission.BLUETOOTH" />'
echo '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />'
echo '<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />'
echo '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />'
echo '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />'
echo '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />'
echo ""

# Step 4: Instructions for iOS permissions
echo "🍎 Step 4: iOS Configuration"
echo "Please add the following to ios/App/App/Info.plist:"
echo ""
echo '<key>NSBluetoothAlwaysUsageDescription</key>'
echo '<string>This app needs Bluetooth to connect to your gate device</string>'
echo '<key>NSBluetoothPeripheralUsageDescription</key>'
echo '<string>This app needs Bluetooth to connect to your gate device</string>'
echo ""

# Step 5: Final sync
echo "🔄 Step 5: Final sync..."
npx cap sync
echo ""

echo "✅ Installation complete!"
echo ""
echo "📖 Next steps:"
echo "1. Configure Android permissions in AndroidManifest.xml"
echo "2. Configure iOS permissions in Info.plist"
echo "3. Build and test the app: npx cap run android OR npx cap run ios"
echo "4. For web testing, use Chrome or Edge browser"
echo ""
echo "📚 For detailed documentation, see GATE_CONTROL_BLE_GUIDE.md"
echo ""

