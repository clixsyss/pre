#!/bin/sh
# This script runs before the Xcode build starts in Xcode Cloud.

echo "⚙️ Running ci_pre_xcodebuild.sh..."

# Navigate to the iOS app directory (adjust if your ios path is different)
cd ios/App || exit 1

# Make sure CocoaPods is available and install pods
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  sudo gem install cocoapods
fi

echo "Installing pods..."
pod install --repo-update

echo "✅ Pods installed successfully."