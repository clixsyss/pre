#!/bin/bash
# ci_post_clone.sh
# This script runs immediately after Xcode Cloud clones your repo.

set -e  # Exit immediately if a command exits with a non-zero status

echo ""
echo "========================================="
echo "========================================="
echo "🚀 CI POST-CLONE SCRIPT STARTING"
echo "========================================="
echo "========================================="
echo ""
echo "Script location: $0"
echo "Current directory: $(pwd)"
echo "Date: $(date)"
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

# Step 3: Sync Capacitor to iOS (copy files only, skip pod install)
echo "🔄 Step 3/4: Syncing Capacitor to iOS..."
npx cap copy ios
npx cap update ios
echo "✅ Capacitor files copied"
echo ""

# Verify cap sync created necessary files
if [ ! -f "ios/App/Podfile" ]; then
  echo "❌ ERROR: Podfile not found at ios/App/Podfile!"
  ls -la ios/App/ || true
  exit 1
fi
echo "✅ Podfile verified"

# Step 4: Install CocoaPods MANUALLY (not via cap sync)
echo "📦 Step 4/4: Installing CocoaPods dependencies..."

# Ensure CocoaPods is installed first
if ! command -v pod &> /dev/null; then
  echo "⚠️  CocoaPods not found, installing..."
  export GEM_HOME="$HOME/.gem"
  export PATH="$GEM_HOME/bin:$PATH"
  gem install cocoapods --user-install --no-document
fi

# Verify pod command works
echo "Pod version: $(pod --version)"

# Change to iOS app directory
cd ios/App || { echo "❌ Failed to cd into ios/App"; exit 1; }
echo "Current directory: $(pwd)"
echo ""

# Show what we're working with
echo "Podfile contents:"
head -30 Podfile
echo ""

# Install pods with explicit flags (NO repo update for speed)
echo "Running: pod install (this may take 2-5 minutes for Firebase dependencies...)"
echo "Started at: $(date)"

# Run with parallel jobs for faster download
pod install --verbose 2>&1 | tee pod-install.log &
POD_PID=$!

# Wait for pod install with timeout monitoring
SECONDS=0
while kill -0 $POD_PID 2>/dev/null; do
  sleep 30
  echo "⏱️  Pod install still running... ${SECONDS}s elapsed"
  if [ $SECONDS -gt 600 ]; then
    echo "⚠️  WARNING: Pod install taking longer than 10 minutes!"
  fi
done

wait $POD_PID
PODS_EXIT_CODE=$?
echo "Completed at: $(date) (took ${SECONDS}s)"

if [ $PODS_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ ERROR: pod install failed with exit code $PODS_EXIT_CODE"
  echo "Last 50 lines of output:"
  tail -50 pod-install.log
  exit 1
fi

echo "✅ CocoaPods installed successfully"
echo ""

# Verify Pods were created
if [ ! -d "Pods" ]; then
  echo "❌ ERROR: Pods directory was not created!"
  echo "Contents of ios/App directory:"
  ls -la
  exit 1
fi

# List what was created
echo "Pods directory contents:"
ls -la Pods/ | head -20

if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
  echo "❌ ERROR: Pods-App.release.xcconfig not found!"
  echo "Contents of Pods/Target Support Files:"
  ls -la "Pods/Target Support Files/" || true
  exit 1
fi

echo "✅ Pods-App.release.xcconfig verified"

echo "========================================="
echo "✅ CI POST-CLONE SCRIPT COMPLETED"
echo "========================================="