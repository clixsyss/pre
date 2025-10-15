#!/bin/sh

# ci_post_clone.sh
# This script runs after Xcode Cloud clones your repository
# It installs CocoaPods dependencies before building

set -e  # Exit on any error

echo "🚀 Starting Xcode Cloud post-clone script..."
echo "================================================"

# Print environment info for debugging
echo "📍 Working directory: $(pwd)"
echo "📍 CI_WORKSPACE: ${CI_WORKSPACE}"
echo "📍 CI_PRIMARY_REPOSITORY_PATH: ${CI_PRIMARY_REPOSITORY_PATH}"
echo "📋 Node version: $(node --version || echo 'Node not found')"
echo "📋 NPM version: $(npm --version || echo 'NPM not found')"
echo "📋 Ruby version: $(ruby --version || echo 'Ruby not found')"
echo "📋 Pod version: $(pod --version || echo 'CocoaPods not found')"
echo "================================================"

# Determine the correct base path
# Xcode Cloud uses CI_WORKSPACE or we can use current directory
if [ -n "$CI_WORKSPACE" ]; then
    BASE_PATH="$CI_WORKSPACE"
    echo "✅ Using CI_WORKSPACE: $BASE_PATH"
elif [ -n "$CI_PRIMARY_REPOSITORY_PATH" ]; then
    BASE_PATH="$CI_PRIMARY_REPOSITORY_PATH"
    echo "✅ Using CI_PRIMARY_REPOSITORY_PATH: $BASE_PATH"
else
    BASE_PATH="$(pwd)"
    echo "✅ Using current directory: $BASE_PATH"
fi

cd "$BASE_PATH"
echo "📍 Changed to base path: $(pwd)"

# Install Node dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing Node dependencies..."
    npm ci --prefer-offline --no-audit || npm install
    echo "✅ Node dependencies installed"
    echo "📦 node_modules exists: $([ -d "node_modules" ] && echo 'YES' || echo 'NO')"
else
    echo "⚠️ No package.json found at $(pwd)"
fi

# Navigate to iOS App directory
echo "📍 Navigating to iOS App directory..."
cd ios/App || {
    echo "❌ Failed to navigate to ios/App"
    echo "📂 Contents of ios/: $(ls -la ../ios/ 2>&1 || echo 'ios directory not found')"
    exit 1
}

echo "📍 Now in iOS App directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
    echo "❌ Error: Podfile not found at $(pwd)"
    echo "📂 Directory contents:"
    ls -la
    exit 1
fi

echo "✅ Podfile found!"

# Clean up any existing Pods directory to avoid conflicts
if [ -d "Pods" ]; then
    echo "🧹 Removing existing Pods directory..."
    rm -rf Pods
    rm -f Podfile.lock
fi

# Install CocoaPods dependencies
echo "🔧 Installing CocoaPods dependencies..."
echo "📋 Pod version: $(pod --version)"

# Install pods with verbose output
echo "🚀 Running pod install --repo-update --verbose..."
pod install --repo-update --verbose || {
    echo "❌ pod install with repo-update failed, trying without repo update..."
    echo "🚀 Running pod install --verbose..."
    pod install --verbose || {
        echo "❌ pod install failed completely, trying with clean install..."
        echo "🧹 Cleaning Pods directory..."
        rm -rf Pods
        rm -f Podfile.lock
        echo "🚀 Running pod install --clean-install..."
        pod install --clean-install --verbose
    }
}

echo "✅ CocoaPods dependencies installed successfully!"

# Verify Pods directory was created
if [ -d "Pods" ]; then
    echo "✅ Pods directory created successfully"
    echo "📦 Pods directory contents:"
    ls -la Pods/ | head -20
    
    # Check for the specific xcconfig file that was failing
    if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
        echo "✅ Pods-App.release.xcconfig exists!"
    else
        echo "⚠️ Warning: Pods-App.release.xcconfig not found"
        echo "📂 Target Support Files contents:"
        ls -la "Pods/Target Support Files/" 2>&1 || echo "Target Support Files not found"
    fi
    
    # Verify workspace was created
    if [ -f "App.xcworkspace" ]; then
        echo "✅ App.xcworkspace created successfully!"
    else
        echo "❌ ERROR: App.xcworkspace not created!"
        exit 1
    fi
    
else
    echo "❌ ERROR: Pods directory was not created!"
    exit 1
fi

# Final verification - ensure the exact files that Xcode Cloud needs exist
echo "🔍 Final verification for Xcode Cloud..."
if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "✅ Pods-App.release.xcconfig verified for Xcode Cloud"
else
    echo "❌ CRITICAL: Pods-App.release.xcconfig missing - this will cause Xcode Cloud to fail"
    exit 1
fi

if [ -f "App.xcworkspace" ]; then
    echo "✅ App.xcworkspace verified for Xcode Cloud"
else
    echo "❌ CRITICAL: App.xcworkspace missing - this will cause Xcode Cloud to fail"
    exit 1
fi

echo "================================================"
echo "🎉 Post-clone script completed successfully!"
echo "📋 Xcode Cloud should now use App.xcworkspace"
echo "📋 All required Pods configuration files are present"
echo "================================================"

