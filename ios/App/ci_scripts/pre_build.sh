#!/bin/sh
set -e
echo "🔧 Running CocoaPods install..."
cd ios/App
pod install
echo "✅ CocoaPods setup complete."