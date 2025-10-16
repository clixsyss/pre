#!/bin/bash
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

set -e  # Exit immediately if a command exits with a non-zero status

echo "========================================="
echo "🚀 CI POST-CLONE SCRIPT STARTING"
echo "========================================="
echo "Current directory: $(pwd)"
echo ""

# Step 1: Install npm dependencies
echo "📦 Step 1/4: Installing npm dependencies..."
npm ci --prefer-offline --no-audit
echo "✅ npm dependencies installed"
echo ""

# Step 2: Build Quasar app
echo "🏗️  Step 2/4: Building Quasar app..."
npm run build
echo "✅ Quasar build completed"
echo ""

# Verify build output exists
if [ ! -d "dist/spa" ]; then
  echo "❌ ERROR: dist/spa directory not found after build!"
  exit 1
fi
echo "✅ Build output verified at dist/spa"
echo ""

# Step 3: Sync Capacitor to iOS
echo "🔄 Step 3/4: Syncing Capacitor to iOS..."
npx cap sync ios
echo "✅ Capacitor sync completed"
echo ""

# Verify cap sync created necessary files
if [ ! -f "ios/App/Podfile" ]; then
  echo "❌ ERROR: Podfile not created by cap sync!"
  exit 1
fi
echo "✅ Podfile verified"

# Step 4: Install CocoaPods
echo "📦 Step 4/4: Installing CocoaPods dependencies..."
cd ios/App || { echo "❌ Failed to cd into ios/App"; exit 1; }
echo "Current directory: $(pwd)"

# Ensure CocoaPods is installed
if ! command -v pod &> /dev/null; then
  echo "⚠️  CocoaPods not found, installing..."
  export GEM_HOME="$HOME/.gem"
  export PATH="$GEM_HOME/bin:$PATH"
  gem install cocoapods --user-install --no-document
fi

# Verify pod command works
pod --version || { echo "❌ pod command failed"; exit 1; }

# Install pods
echo "Running: pod install"
pod install --verbose
PODS_EXIT_CODE=$?

if [ $PODS_EXIT_CODE -ne 0 ]; then
  echo "❌ ERROR: pod install failed with exit code $PODS_EXIT_CODE"
  exit 1
fi

echo "✅ CocoaPods installed successfully"
echo ""

# Verify Pods were created
if [ ! -d "Pods" ]; then
  echo "❌ ERROR: Pods directory was not created!"
  exit 1
fi

if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
  echo "❌ ERROR: Pods-App.release.xcconfig not found!"
  echo "Contents of Pods directory:"
  ls -la Pods/ || true
  exit 1
fi

echo "✅ Pods-App.release.xcconfig verified"

echo "========================================="
echo "✅ CI POST-CLONE SCRIPT COMPLETED"
echo "========================================="