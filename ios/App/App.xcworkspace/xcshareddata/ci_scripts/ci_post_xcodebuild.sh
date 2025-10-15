#!/bin/sh

# Xcode Cloud post-build script
# This script runs after xcodebuild completes

set -e

echo "🏁 Starting Xcode Cloud post-build script..."

if [ "$CI_XCODEBUILD_EXIT_CODE" = "0" ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed with exit code: $CI_XCODEBUILD_EXIT_CODE"
    exit 1
fi

echo "🎉 Post-build script completed successfully"
