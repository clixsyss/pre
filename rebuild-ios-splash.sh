#!/bin/bash

echo "🚀 Rebuilding iOS app with improved splash screen..."

# Build the Quasar app
echo "📦 Building Quasar app..."
quasar build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync ios

# Copy the updated files to iOS
echo "📱 Copying updated files to iOS..."
npx cap copy ios

echo "✅ iOS app rebuilt successfully!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Build and run the app on your device/simulator"
echo "3. The splash screen should now show smoothly without white screen"
