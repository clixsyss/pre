#!/bin/sh

# ci_pre_clone.sh
# This script runs before Xcode Cloud clones your repository
# It sets up environment variables to ensure the workspace is used

set -e

echo "🚀 Starting Xcode Cloud pre-clone script..."
echo "================================================"

# Set environment variables to ensure workspace is used
export CI_XCODE_PROJECT="App.xcworkspace"
export CI_WORKSPACE_PATH="ios/App/App.xcworkspace"

echo "✅ Environment configured for workspace usage"
echo "📍 CI_XCODE_PROJECT: $CI_XCODE_PROJECT"
echo "📍 CI_WORKSPACE_PATH: $CI_WORKSPACE_PATH"

echo "================================================"
echo "🎉 Pre-clone script completed successfully!"
echo "================================================"
