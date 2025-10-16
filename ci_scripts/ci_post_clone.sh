#!/bin/bash
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

set -e  # Exit on error

echo "🚀 CI SCRIPT IS RUNNING!"
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "📦 Installing npm dependencies..."
npm ci --prefer-offline --no-audit

echo "✅ npm dependencies installed successfully!"

# Verify critical Capacitor packages
echo "🔍 Verifying Capacitor Keyboard installation..."
if [ ! -d "node_modules/@capacitor/keyboard/ios/Sources/KeyboardPlugin/include" ]; then
  echo "❌ ERROR: Capacitor Keyboard files not found after npm install!"
  echo "Attempting to reinstall @capacitor/keyboard..."
  npm install @capacitor/keyboard@7.0.3 --force
fi

# Double-check the files exist
if [ -f "node_modules/@capacitor/keyboard/ios/Sources/KeyboardPlugin/include/Keyboard.h" ]; then
  echo "✅ Keyboard.h found"
else
  echo "❌ ERROR: Keyboard.h still missing!"
  exit 1
fi

echo "🏗️  Building Quasar app..."
npm run build

echo "✅ Quasar build completed!"

echo "🔄 Syncing Capacitor to iOS..."
npx cap sync ios

echo "✅ Capacitor sync completed!"

echo "📦 Installing CocoaPods dependencies..."
cd ios/App || exit 1

echo "Current directory after cd: $(pwd)"
echo "Verifying node_modules path from iOS directory:"
ls -la ../../node_modules/@capacitor/keyboard/ios/Sources/KeyboardPlugin/include/ || echo "❌ Cannot access keyboard include files from here"

# Make sure cocoapods is available
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  sudo gem install cocoapods
fi

# Clean pod cache and install fresh
echo "Cleaning CocoaPods cache..."
pod cache clean --all || true

# Install pods
echo "Installing pods..."
pod install --repo-update --verbose

echo "✅ Pods installed successfully!"
echo "✅ CI post-clone script completed!"