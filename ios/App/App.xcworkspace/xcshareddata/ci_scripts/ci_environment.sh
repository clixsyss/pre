#!/bin/sh

# Xcode Cloud environment configuration
# This script sets up the environment for Xcode Cloud builds

set -e

echo "🔧 Setting up Xcode Cloud environment..."

# Force Xcode Cloud to use the workspace instead of the project file
export CI_XCODE_PROJECT="App.xcworkspace"

echo "✅ Environment configured to use App.xcworkspace"
echo "🎉 Environment setup completed"
