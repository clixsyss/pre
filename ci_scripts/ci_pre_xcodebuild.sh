#!/bin/sh
# This script runs before the Xcode build starts in Xcode Cloud.

set -e  # Exit on error

echo "⚙️ Running ci_pre_xcodebuild.sh..."
echo "Current directory: $(pwd)"

# Verify that the build was created
if [ ! -d "dist/spa" ]; then
  echo "❌ ERROR: dist/spa directory not found! Build may have failed."
  echo "Attempting to build now..."
  npm run build
  npx cap sync ios
fi

echo "✅ Pre-build verification completed."