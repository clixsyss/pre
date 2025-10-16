#!/bin/bash
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

echo "🚀 CI SCRIPT IS RUNNING!"
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "📦 Installing npm dependencies..."
npm install

echo "✅ npm dependencies installed successfully!"

echo "📦 Installing CocoaPods dependencies..."
cd ios/App || exit 1

echo "Current directory after cd: $(pwd)"

# Make sure cocoapods is available
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  sudo gem install cocoapods
fi

# Install pods
pod install --repo-update

echo "✅ Pods installed successfully!"