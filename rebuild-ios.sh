#!/bin/bash

# iOS Rebuild Script for Court Booking Fix
# This script rebuilds the iOS app with the booking fix

set -e

echo "🚀 Starting iOS rebuild process..."

# Get the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "📁 Project directory: $PROJECT_DIR"

# Step 1: Clean dist directory
echo ""
echo "🧹 Step 1: Cleaning dist directory..."
rm -rf dist
echo "✅ Dist directory cleaned"

# Step 2: Build Quasar app
echo ""
echo "🔨 Step 2: Building Quasar app..."
npm run build
echo "✅ Quasar app built successfully"

# Step 3: Sync Capacitor
echo ""
echo "🔄 Step 3: Syncing Capacitor..."
npx cap sync ios
echo "✅ Capacitor synced"

# Step 4: Update iOS Pods (optional but recommended)
echo ""
echo "📦 Step 4: Updating iOS Pods..."
cd ios/App
if [ -f "Podfile" ]; then
    echo "Running pod install..."
    pod install --repo-update
    echo "✅ Pods updated successfully"
else
    echo "⚠️  No Podfile found, skipping pod install"
fi
cd ../..

# Step 5: Open Xcode
echo ""
echo "🎯 Step 5: Opening Xcode..."
echo ""
echo "========================================"
echo "📋 Next Steps in Xcode:"
echo "========================================"
echo "1. Clean Build Folder: Product → Clean Build Folder (⇧⌘K)"
echo "2. Select your device or simulator"
echo "3. Build and Run (⌘R)"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Log in to the app"
echo "2. Navigate to: Facilities → Court Booking"
echo "3. Select a sport, court, date, and time slots"
echo "4. Tap 'Confirm Booking'"
echo "5. Check for success message and redirection"
echo ""
echo "📝 Check console for these logs:"
echo "   ✅ '🔍 Data serialized for Capacitor'"
echo "   ✅ '✅ Native addDoc result: { id: ... }'"
echo "========================================"
echo ""

# Open Xcode
npx cap open ios

echo "✅ iOS rebuild process complete!"

