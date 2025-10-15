# Xcode Cloud Setup Instructions for PRE iOS App

## Critical Configuration Issue

**Xcode Cloud is currently configured to use `App.xcodeproj` instead of `App.xcworkspace`.**

This causes the build to fail with:
```
Unable to open base configuration reference file '/Volumes/workspace/repository/ios/App/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig'
```

## Required Fix in Apple Developer Console

1. **Go to Apple Developer Console** → Xcode Cloud
2. **Find your PRE app workflow**
3. **Edit the workflow settings**
4. **Change the project file from:**
   - ❌ `ios/App/App.xcodeproj`
5. **To:**
   - ✅ `ios/App/App.xcworkspace`

## Why This Matters

- **CocoaPods requires the `.xcworkspace` file** to work properly
- **The `.xcodeproj` file doesn't include Pods configuration**
- **Xcode Cloud must use the workspace** for CocoaPods dependencies

## Current CI Scripts

The following scripts are already in place to handle CocoaPods installation:

- `ci_scripts/ci_pre_clone.sh` - Sets up environment variables
- `ci_scripts/ci_post_clone.sh` - Installs CocoaPods and verifies setup
- `ios/App/App.xcworkspace/xcshareddata/ci_scripts/ci_pre_xcodebuild.sh` - Pre-build verification

## Verification

After changing the Xcode Cloud configuration:

1. **Trigger a new build**
2. **Check the build logs** for:
   - ✅ "Using App.xcworkspace"
   - ✅ "Pods-App.release.xcconfig verified"
   - ✅ "CocoaPods dependencies installed successfully"

## Alternative Solution

If you cannot change the Xcode Cloud configuration, you can:

1. **Remove CocoaPods configuration** from the project file
2. **Use the workspace file manually** in Xcode
3. **But this is NOT recommended** as it will break local development

## Contact

If you need help changing the Xcode Cloud configuration, contact the Apple Developer support team.
