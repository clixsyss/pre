#!/bin/sh

# Xcode Cloud pre-build script for PRE iOS app
# This script runs before xcodebuild to set up the environment

set -e

echo "🚀 Starting PRE iOS pre-build script..."

# Check if we're running in Xcode Cloud
if [ "$CI" = "true" ]; then
    echo "📱 Running in Xcode Cloud environment"
    
    # Install CocoaPods if not available
    if ! command -v pod &> /dev/null; then
        echo "📦 Installing CocoaPods..."
        gem install cocoapods
    fi
    
    # Navigate to the iOS App directory
    cd ios/App
    
    # Install pods
    echo "📦 Installing CocoaPods dependencies..."
    pod install --repo-update
    
    echo "✅ CocoaPods installation complete"
else
    echo "💻 Running in local environment - skipping pod install"
fi

echo "🎉 PRE iOS pre-build script completed successfully"
