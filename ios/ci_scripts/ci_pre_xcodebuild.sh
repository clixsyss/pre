#!/bin/sh
set -e

echo "🚀 Xcode Cloud: Running pre-xcodebuild script"
cd ios/App || exit

echo "📦 Installing CocoaPods dependencies..."
pod install

echo "✅ Pods installation completed successfully."