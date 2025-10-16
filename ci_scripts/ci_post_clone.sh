#!/bin/bash
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

set -e  # Exit on error

echo "🚀 CI SCRIPT IS RUNNING!"
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "📦 Installing npm dependencies..."
npm install

echo "✅ npm dependencies installed successfully!"

echo "🏗️  Building Quasar app..."
npm run build

echo "✅ Quasar build completed!"

echo "🔄 Syncing Capacitor to iOS..."
npx cap sync ios

echo "✅ Capacitor sync completed!"

echo "📦 Installing CocoaPods dependencies..."
cd ios/App || exit 1

echo "Current directory after cd: $(pwd)"

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
pod install --repo-update

echo "✅ Pods installed successfully!"
echo "✅ CI post-clone script completed!"