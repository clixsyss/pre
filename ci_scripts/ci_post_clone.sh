#!/bin/sh

# ci_post_clone.sh
# This script runs after Xcode Cloud clones your repository
# It installs CocoaPods dependencies before building

set -e  # Exit on any error

echo "🚀 Starting Xcode Cloud post-clone script..."

# Print environment info
echo "📍 Current directory: $(pwd)"
echo "📋 Node version: $(node --version)"
echo "📋 NPM version: $(npm --version)"
echo "📋 Ruby version: $(ruby --version)"

# Install Node dependencies (if needed)
if [ -f "package.json" ]; then
    echo "📦 Installing Node dependencies..."
    npm install
    echo "✅ Node dependencies installed"
fi

# Navigate to iOS directory
cd ios/App

echo "📍 Changed to iOS App directory: $(pwd)"

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
    echo "❌ Error: Podfile not found!"
    exit 1
fi

# Install CocoaPods dependencies
echo "🔧 Installing CocoaPods dependencies..."
echo "📋 Pod version: $(pod --version)"

# Update CocoaPods repo (optional, can be slow)
# pod repo update

# Install pods
pod install --repo-update

echo "✅ CocoaPods dependencies installed successfully!"

# List installed pods
echo "📦 Installed pods:"
ls -la Pods/

echo "🎉 Post-clone script completed successfully!"

