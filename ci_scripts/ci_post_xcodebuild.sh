#!/bin/sh

# ci_post_xcodebuild.sh
# This script runs after xcodebuild completes

set -e

echo "🏁 Starting ci_post_xcodebuild.sh..."

if [ "$CI_XCODEBUILD_EXIT_CODE" = "0" ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed with exit code: $CI_XCODEBUILD_EXIT_CODE"
    echo "📋 Common exit code 65 issues:"
    echo "   - Code signing problems"
    echo "   - Missing provisioning profiles"
    echo "   - Bundle identifier mismatches"
    echo "   - Missing required capabilities"
fi

echo "🎉 ci_post_xcodebuild.sh completed"
