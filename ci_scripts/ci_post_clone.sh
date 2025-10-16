#!/bin/sh
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

echo "🚀 Running ci_post_clone.sh..."

# Install npm dependencies first (required for Capacitor plugins)
echo "📦 Installing npm dependencies..."
npm install

echo "✅ npm dependencies installed successfully!"

# Now install CocoaPods
echo "📦 Installing CocoaPods dependencies..."
cd ios/App || exit 1

# Make sure cocoapods is available
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  sudo gem install cocoapods
fi

# Install pods
pod install --repo-update

echo "✅ Pods installed successfully!"