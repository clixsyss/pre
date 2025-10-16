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
npx cap sync ios --no-build
echo "✅ Capacitor sync completed"
echo ""

# Step 4: Install CocoaPods
echo "📦 Step 4/4: Installing CocoaPods dependencies..."
cd ios/App || { echo "❌ Failed to cd into ios/App"; exit 1; }

# Verify Podfile exists
if [ ! -f "Podfile" ]; then
  echo "❌ ERROR: Podfile not found!"
  exit 1
fi

# Install pods without updating repo (faster)
echo "Running: pod install"
pod install
echo "✅ CocoaPods installed successfully"
echo ""

# Verify Pods were created
if [ ! -d "Pods" ]; then
  echo "❌ ERROR: Pods directory was not created!"
  exit 1
fi

echo "========================================="
echo "✅ CI POST-CLONE SCRIPT COMPLETED"
echo "========================================="