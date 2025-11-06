#!/bin/bash

# Android Permissions Sync Script
# This script ensures all Android permissions are properly configured

echo "🤖 Syncing Android permissions and configuration..."
echo ""

# Step 1: Sync Capacitor to update native projects with latest config
echo "📱 Step 1: Syncing Capacitor configuration..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Failed to sync Capacitor"
    exit 1
fi
echo "✅ Capacitor synced successfully"
echo ""

# Step 2: Display AndroidManifest.xml location permissions
echo "📋 Step 2: Verifying AndroidManifest.xml location permissions..."
echo ""
if grep -q "ACCESS_FINE_LOCATION" android/app/src/main/AndroidManifest.xml; then
    echo "✅ ACCESS_FINE_LOCATION: FOUND"
else
    echo "❌ ACCESS_FINE_LOCATION: MISSING"
fi

if grep -q "ACCESS_COARSE_LOCATION" android/app/src/main/AndroidManifest.xml; then
    echo "✅ ACCESS_COARSE_LOCATION: FOUND"
else
    echo "❌ ACCESS_COARSE_LOCATION: MISSING"
fi
echo ""

# Step 3: Open in Android Studio for building
echo "📱 Step 3: Opening project in Android Studio..."
echo ""
echo "🔧 IMPORTANT: After Android Studio opens:"
echo "   1. Clean Project (Build → Clean Project)"
echo "   2. Rebuild Project (Build → Rebuild Project)"
echo "   3. Run on device/emulator"
echo ""
echo "📍 The app should now request location permission when you:"
echo "   - Try to generate a guest pass"
echo "   - Use BLE gate access"
echo ""

# Open Android Studio
if command -v studio &> /dev/null; then
    studio android
elif [ -d "/Applications/Android Studio.app" ]; then
    open -a "Android Studio" android
else
    echo "⚠️  Android Studio not found in PATH"
    echo "   Please manually open: android folder in Android Studio"
fi

echo ""
echo "✅ Android permissions sync complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Build and run the app in Android Studio"
echo "   2. Grant location permission when prompted"
echo "   3. Check Settings → Apps → PRE Group → Permissions to verify"
echo ""
echo "💡 Tip: If permission not requested:"
echo "   - Uninstall the app completely from device"
echo "   - Rebuild and reinstall"
echo "   - Location permission should be requested on first use"
echo ""

