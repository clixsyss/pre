#!/bin/sh

# Xcode Cloud pre-build script to ensure workspace is used
# This script runs before xcodebuild to set up the environment

set -e

echo "🚀 Starting Xcode Cloud pre-build script..."
echo "📍 Current directory: $(pwd)"

# Ensure we're using the workspace, not the project file
if [ -f "App.xcworkspace" ]; then
    echo "✅ App.xcworkspace found - this is correct for CocoaPods"
else
    echo "❌ App.xcworkspace not found!"
    exit 1
fi

# Verify Pods directory exists
if [ -d "Pods" ]; then
    echo "✅ Pods directory exists"
    
    # Check for the specific xcconfig file that was failing
    if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
        echo "✅ Pods-App.release.xcconfig exists!"
    else
        echo "❌ ERROR: Pods-App.release.xcconfig not found!"
        echo "📂 Target Support Files contents:"
        ls -la "Pods/Target Support Files/" 2>&1 || echo "Target Support Files not found"
        exit 1
    fi
else
    echo "❌ ERROR: Pods directory not found!"
    echo "📂 Current directory contents:"
    ls -la
    exit 1
fi

echo "🎉 Pre-build script completed successfully!"
