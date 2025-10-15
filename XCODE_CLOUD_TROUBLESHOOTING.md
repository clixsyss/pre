# Xcode Cloud Troubleshooting Guide

## Current Status ✅

**GOOD NEWS:** Xcode Cloud is now using the workspace correctly!
```
xcodebuild archive -workspace /Volumes/workspace/repository/ios/App/App.xcworkspace
```

## Current Issue ❌

**Exit Code 65** - This is typically a code signing or provisioning profile issue.

## What Exit Code 65 Means

Exit code 65 usually indicates:
- ❌ **Code signing problems**
- ❌ **Missing provisioning profiles**
- ❌ **Bundle identifier mismatches**
- ❌ **Missing required capabilities**

## Required Checks in Apple Developer Console

### 1. **Xcode Cloud Workflow Configuration**
- ✅ **Project File:** `ios/App/App.xcworkspace` (FIXED)
- ❓ **Code Signing:** Check if set to "Automatic" or "Manual"
- ❓ **Development Team:** Should be `85289CPB6W`
- ❓ **Bundle Identifier:** Should be `com.pre-group.app`

### 2. **Apple Developer Account Settings**
- ❓ **Certificates:** Ensure valid iOS Distribution certificate
- ❓ **Provisioning Profiles:** Ensure valid App Store or Ad Hoc profile
- ❓ **App ID:** Ensure `com.pre-group.app` exists and has push notifications enabled

### 3. **Xcode Cloud Specific Settings**
- ❓ **Environment Variables:** Check if any custom signing variables are set
- ❓ **Build Settings:** Verify no conflicting code signing settings
- ❓ **Capabilities:** Ensure Push Notifications capability is enabled

## Debug Steps

### 1. **Check the Enhanced CI Scripts**
The new CI scripts will provide detailed debugging information:
- ✅ Workspace verification
- ✅ Pods configuration verification
- ✅ Code signing configuration check
- ✅ Bundle identifier verification
- ✅ Entitlements content display

### 2. **Review Build Logs**
Look for these specific error messages:
- `"Code signing error"`
- `"Provisioning profile not found"`
- `"Bundle identifier mismatch"`
- `"Missing capability"`

### 3. **Verify Apple Developer Console**
- **App ID:** `com.pre-group.app` exists
- **Push Notifications:** Enabled for this App ID
- **Certificates:** Valid and not expired
- **Provisioning Profiles:** Valid and includes this App ID

## Common Solutions

### Solution 1: Enable Push Notifications Capability
1. Go to Apple Developer Console → Certificates, Identifiers & Profiles
2. Find App ID: `com.pre-group.app`
3. Enable "Push Notifications" capability
4. Regenerate provisioning profiles

### Solution 2: Check Xcode Cloud Environment
1. Go to Apple Developer Console → Xcode Cloud
2. Edit your workflow
3. Check "Environment" tab
4. Ensure no conflicting code signing variables

### Solution 3: Verify Team Settings
1. Ensure Development Team `85289CPB6W` has proper permissions
2. Check if the team has valid certificates
3. Verify the team can create provisioning profiles

## Next Steps

1. **Trigger a new build** with the enhanced CI scripts
2. **Check the detailed logs** from `ci_pre_xcodebuild.sh`
3. **Review the specific error messages** in the build output
4. **Update Apple Developer Console settings** based on the error messages

## Contact Information

If you need help with Apple Developer Console settings, you may need to:
- Contact your Apple Developer account administrator
- Check Apple Developer support documentation
- Verify team permissions and certificates

The enhanced CI scripts will provide much more detailed information about what's causing the exit code 65 error.
