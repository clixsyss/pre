#!/bin/bash
# This script runs before the Xcode build starts in Xcode Cloud.

set -e  # Exit on error

echo ""
echo "========================================="
echo "========================================="
echo "🚀 CI PRE-XCODEBUILD SCRIPT STARTING"
echo "========================================="
echo "========================================="
echo ""
echo "Script location: $0"
echo "Initial directory: $(pwd)"
echo "Date: $(date)"
echo ""

# Navigate to project root (where package.json is)
# Xcode Cloud might run this from ci_scripts/ or ios/App/ci_scripts/
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

# Find project root by looking for package.json
if [ -f "../package.json" ]; then
  cd ..
elif [ -f "../../package.json" ]; then
  cd ../..
elif [ -f "../../../package.json" ]; then
  cd ../../..
elif [ -f "package.json" ]; then
  # Already at root
  :
else
  echo "❌ ERROR: Cannot find package.json from $(pwd)"
  echo "Listing current directory:"
  ls -la
  exit 1
fi

echo "Project root: $(pwd)"
echo ""

# Setup Node.js environment
echo "🔧 Setting up Node.js environment..."

# Xcode Cloud provides Homebrew at /Users/local/Homebrew
export HOMEBREW_PREFIX="/Users/local/Homebrew"
if [ -d "$HOMEBREW_PREFIX" ]; then
    echo "✅ Found Homebrew at $HOMEBREW_PREFIX"
    eval "$($HOMEBREW_PREFIX/bin/brew shellenv)"
    export PATH="$HOMEBREW_PREFIX/bin:$PATH"
fi

# Check if node is installed, if not install it via Homebrew
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found, installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ ERROR: Homebrew not available, cannot install Node.js"
        exit 1
    fi
else
    echo "✅ Node.js is already installed"
fi

# Verify installation
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PATH: $PATH"
echo ""

# Step 1: Install npm dependencies
echo "📦 Step 1/4: Installing npm dependencies..."
if ! npm ci --prefer-offline --no-audit; then
  echo "❌ ERROR: npm ci failed!"
  echo "Trying npm install as fallback..."
  if ! npm install --no-audit; then
    echo "❌ ERROR: npm install also failed!"
    exit 1
  fi
fi
echo "✅ npm dependencies installed"
echo ""

# Step 2: Build Quasar app
echo "🏗️  Step 2/4: Building Quasar app..."
if ! npm run build; then
  echo "❌ ERROR: npm run build failed!"
  echo "Checking quasar.config.js..."
  if [ -f "quasar.config.js" ]; then
    echo "✅ quasar.config.js exists"
  else
    echo "❌ ERROR: quasar.config.js not found!"
  fi
  exit 1
fi
echo "✅ Quasar build completed"
echo ""

# Verify build output exists
if [ ! -d "dist/spa" ]; then
  echo "❌ ERROR: dist/spa directory not found after build!"
  exit 1
fi
echo "✅ Build output verified at dist/spa"
echo ""

# Step 3: Copy Capacitor files ONLY (no pod install)
echo "🔄 Step 3/4: Copying Capacitor files to iOS..."
if ! npx cap copy ios; then
  echo "❌ ERROR: cap copy ios failed!"
  echo "Checking capacitor.config.json..."
  if [ -f "capacitor.config.json" ]; then
    echo "✅ capacitor.config.json exists"
    cat capacitor.config.json | head -20
  else
    echo "❌ ERROR: capacitor.config.json not found!"
  fi
  exit 1
fi
echo "✅ Capacitor files copied"
echo ""

# Manually update iOS project files (skip the slow pod install)
echo "🔄 Updating iOS project configuration..."
if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
  echo "✅ iOS project file exists"
else
  echo "❌ ERROR: iOS project file not found!"
  exit 1
fi
echo "✅ iOS project verified"
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
echo "✅ CI PRE-XCODEBUILD SCRIPT COMPLETED"
echo "========================================="