#!/bin/sh

# Xcode Cloud post-build script for PRE iOS app
# This script runs after xcodebuild completes

set -e

echo "🏁 Starting PRE iOS post-build script..."

if [ "$CI" = "true" ]; then
    echo "📱 Running in Xcode Cloud environment"
    
    # Check if build was successful
    if [ "$CI_XCODEBUILD_EXIT_CODE" = "0" ]; then
        echo "✅ Build completed successfully"
        
        # You can add any post-build steps here
        # For example: uploading build artifacts, running tests, etc.
        
    else
        echo "❌ Build failed with exit code: $CI_XCODEBUILD_EXIT_CODE"
        exit 1
    fi
else
    echo "💻 Running in local environment"
fi

echo "🎉 PRE iOS post-build script completed"
