#!/bin/bash

# iOS Permissions Sync Script
# This script ensures all iOS permissions are properly configured

echo "🍎 Syncing iOS permissions and configuration..."
echo ""

# Step 1: Sync Capacitor to update native projects with latest config
echo "📱 Step 1: Syncing Capacitor configuration..."
npx cap sync ios
if [ $? -ne 0 ]; then
    echo "❌ Failed to sync Capacitor"
    exit 1
fi
echo "✅ Capacitor synced successfully"
echo ""

# Step 2: Update CocoaPods (in case Geolocation plugin needs updates)
echo "📦 Step 2: Updating CocoaPods..."
cd ios/App
pod install --repo-update
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Pod install failed, but continuing..."
fi
cd ../..
echo "✅ Pods updated"
echo ""

# Step 3: Display Info.plist location permissions
echo "📋 Step 3: Verifying Info.plist location permissions..."
echo ""
if grep -q "NSLocationWhenInUseUsageDescription" ios/App/App/Info.plist; then
    echo "✅ NSLocationWhenInUseUsageDescription: FOUND"
    grep -A 1 "NSLocationWhenInUseUsageDescription" ios/App/App/Info.plist | tail -1
else
    echo "❌ NSLocationWhenInUseUsageDescription: MISSING"
fi

if grep -q "NSLocationAlwaysAndWhenInUseUsageDescription" ios/App/App/Info.plist; then
    echo "✅ NSLocationAlwaysAndWhenInUseUsageDescription: FOUND"
    grep -A 1 "NSLocationAlwaysAndWhenInUseUsageDescription" ios/App/App/Info.plist | tail -1
else
    echo "❌ NSLocationAlwaysAndWhenInUseUsageDescription: MISSING"
fi
echo ""

# Step 4: Open in Xcode for building
echo "📱 Step 4: Opening project in Xcode..."
echo ""
echo "🔧 IMPORTANT: After Xcode opens:"
echo "   1. Clean Build Folder (Cmd+Shift+K)"
echo "   2. Build (Cmd+B)"
echo "   3. Run on device/simulator (Cmd+R)"
echo ""
echo "📍 The app should now request location permission on first launch"
echo "   or when you try to generate a guest pass."
echo ""

# Open Xcode
open ios/App/App.xcworkspace

echo ""
echo "✅ iOS permissions sync complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Build and run the app in Xcode"
echo "   2. Grant location permission when prompted"
echo "   3. Check Settings → PRE Group → Location to verify"
echo ""

