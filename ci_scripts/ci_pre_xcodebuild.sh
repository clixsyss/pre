#!/bin/sh

# ci_pre_xcodebuild.sh
# This script runs before xcodebuild starts

set -e

echo "🚀 Starting ci_pre_xcodebuild.sh..."
echo "📍 Current directory: $(pwd)"
echo "📍 CI environment variables:"
echo "   CI_XCODEBUILD_EXIT_CODE: ${CI_XCODEBUILD_EXIT_CODE:-not set}"
echo "   CI_WORKSPACE: ${CI_WORKSPACE:-not set}"
echo "   CI_PRIMARY_REPOSITORY_PATH: ${CI_PRIMARY_REPOSITORY_PATH:-not set}"

# Navigate to the iOS App directory
cd ios/App

echo "📍 Now in iOS App directory: $(pwd)"

# Verify workspace exists
if [ -f "App.xcworkspace" ]; then
    echo "✅ App.xcworkspace found"
else
    echo "❌ App.xcworkspace not found!"
    exit 1
fi

# Verify Pods directory exists
if [ -d "Pods" ]; then
    echo "✅ Pods directory exists"
    
    # Check for the specific xcconfig file
    if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
        echo "✅ Pods-App.release.xcconfig exists!"
    else
        echo "❌ Pods-App.release.xcconfig not found!"
        echo "📂 Target Support Files contents:"
        ls -la "Pods/Target Support Files/" 2>&1 || echo "Target Support Files not found"
        exit 1
    fi
else
    echo "❌ Pods directory not found!"
    echo "📂 Current directory contents:"
    ls -la
    exit 1
fi

# Check code signing configuration
echo "🔐 Checking code signing configuration..."
if [ -f "App/App.entitlements" ]; then
    echo "✅ App.entitlements found"
    echo "📄 Entitlements content:"
    cat App/App.entitlements
else
    echo "⚠️ App.entitlements not found"
fi

# Check Info.plist
if [ -f "App/Info.plist" ]; then
    echo "✅ Info.plist found"
    echo "📄 Bundle identifier:"
    /usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" App/Info.plist 2>/dev/null || echo "Could not read bundle identifier"
else
    echo "⚠️ Info.plist not found"
fi

echo "🎉 ci_pre_xcodebuild.sh completed successfully!"
