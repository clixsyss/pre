# Location Permissions Setup Guide

## Issue
The app is not requesting location permissions on iOS and Android, which is required for:
- **Guest Pass Generation** - Location verification
- **Gate Access** - BLE functionality (Android requires location for BLE scanning)

---

## Root Cause Analysis

### ✅ What's Already Configured (GOOD)
1. **iOS Info.plist** - Has correct permission keys:
   - `NSLocationWhenInUseUsageDescription`
   - `NSLocationAlwaysAndWhenInUseUsageDescription`

2. **Android Manifest** - Has location permissions:
   - `ACCESS_FINE_LOCATION`
   - `ACCESS_COARSE_LOCATION`

3. **Capacitor Geolocation Plugin** - Installed (`@capacitor/geolocation@^7.0.1`)

4. **Permission Service** - Code exists to request permissions

5. **Boot File** - `permissions.js` is loaded in boot sequence

### ⚠️ What Was Missing (FIXED)
1. **Capacitor Config** - Geolocation plugin configuration not set
2. **Android Manifest (src-capacitor)** - Missing permissions in secondary manifest
3. **Android 12+ Support** - Needed proper permission declarations

---

## What I Fixed

### 1. Updated `capacitor.config.json`
Added Geolocation plugin configuration:
```json
"Geolocation": {
  "iosBackgroundLocationIndicator": false,
  "iosShowLocationDialog": true
}
```

### 2. Updated Android Manifests
Both `/android/app/src/main/AndroidManifest.xml` and `/src-capacitor/android/app/src/main/AndroidManifest.xml` now have:
- Fine location permission
- Coarse location permission (with Android 12+ support)
- GPS and network location features

### 3. Created Helper Scripts
- `sync-ios-permissions.sh` - Syncs and builds iOS with permissions
- `sync-android-permissions.sh` - Syncs and builds Android with permissions

---

## How to Apply Changes

### For iOS

#### Option A: Using the Script (Recommended)
```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre
./sync-ios-permissions.sh
```

This will:
1. Sync Capacitor configuration
2. Update CocoaPods
3. Verify permissions are in Info.plist
4. Open Xcode for building

#### Option B: Manual Steps
```bash
# 1. Sync Capacitor
npx cap sync ios

# 2. Update pods
cd ios/App
pod install --repo-update
cd ../..

# 3. Open in Xcode
open ios/App/App.xcworkspace

# 4. In Xcode:
#    - Clean Build Folder (Cmd+Shift+K)
#    - Build (Cmd+B)
#    - Run on device (Cmd+R)
```

### For Android

#### Option A: Using the Script (Recommended)
```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre
./sync-android-permissions.sh
```

This will:
1. Sync Capacitor configuration
2. Verify permissions in AndroidManifest.xml
3. Open Android Studio for building

#### Option B: Manual Steps
```bash
# 1. Sync Capacitor
npx cap sync android

# 2. Open in Android Studio
open -a "Android Studio" android

# 3. In Android Studio:
#    - Clean Project (Build → Clean Project)
#    - Rebuild Project (Build → Rebuild Project)
#    - Run on device
```

---

## When Will Permissions Be Requested?

### Automatic Request (On App Start)
The app requests permissions **3 seconds after authentication** (iOS) or **2 seconds** (Android) via `boot/permissions.js`:

```javascript
setTimeout(() => {
  permissionsService.requestAllPermissions()
}, delay)
```

### Manual Request (On Demand)
Permissions are also requested when:
1. **Guest Pass Generation** - When user tries to create a guest pass
2. **BLE Gate Access** - When connecting to gate device
3. **Settings Page** - User can manually request from Profile → App Permissions

---

## Verifying Permissions Work

### iOS
1. Build and run the app
2. Login to your account
3. Wait 3 seconds - iOS should show location permission dialog
4. Grant "While Using the App" permission
5. Go to **Settings → PRE Group → Location** - Should show "While Using the App"

### Android
1. Build and run the app
2. Login to your account
3. Wait 2 seconds - Android should show location permission dialog
4. Select "Precise" or "Approximate" location
5. Grant "Allow only while using the app"
6. Go to **Settings → Apps → PRE Group → Permissions → Location** - Should show "Allowed only while using the app"

---

## Troubleshooting

### iOS: Permission Dialog Not Showing

**Cause**: iOS caches permission decisions. Once denied, it won't ask again.

**Solution**:
```bash
# Reset iOS permissions
xcrun simctl privacy booted reset all  # For simulator
# OR
# Delete app and reinstall for physical device
```

### Android: Permission Dialog Not Showing

**Cause**: App already has permission decision cached.

**Solution**:
1. Go to Settings → Apps → PRE Group
2. Tap "Uninstall"
3. Rebuild and reinstall app
4. Permission dialog should appear

### Permission Denied Previously

If users previously denied permissions:
1. **iOS**: Settings → PRE Group → Location → Select "While Using the App"
2. **Android**: Settings → Apps → PRE Group → Permissions → Location → Allow

### Still Not Working?

1. **Verify Geolocation plugin is installed**:
   ```bash
   npm list @capacitor/geolocation
   ```

2. **Check boot file is loading**:
   - Look for console log: `🔐 Permissions Boot: Starting...`
   - Should see: `📍 Requesting location permission...`

3. **Check permission service**:
   - Look for: `✅ Location permission granted` or `⚠️ Location permission denied`

4. **Manual permission check** (in app):
   - Go to Profile page
   - Check "App Permissions" section
   - Status should show "Granted", "Denied", or "Not Set"
   - Tap "Request Permissions" to manually trigger

---

## Permission Status Indicators

The app now shows permission status in **Profile → App Permissions**:

- 🟢 **Granted** - Permission is enabled
- 🔴 **Denied** - User denied permission (need to enable in device settings)
- 🟡 **Not Set** - Permission not requested yet

### Actions Available:
1. **Request Permissions** - Triggers permission dialogs
2. **Open Settings** - Opens device settings for manual permission management

---

## Important Notes

### Location Permission is Required For:
- ✅ Guest pass generation (when location restriction is enabled)
- ✅ BLE scanning on Android (OS requirement)

### When Location is NOT Required:
- ❌ Guest pass generation (when location restriction is disabled globally)
- ❌ Viewing existing passes
- ❌ General app navigation

### Bluetooth Permission is Required For:
- ✅ Gate control via BLE
- ✅ Connecting to smart gate devices

---

## Testing Checklist

### iOS Testing
- [ ] App requests location on first launch after login
- [ ] Permission dialog shows proper description
- [ ] "While Using the App" option works
- [ ] Guest pass generation works after granting permission
- [ ] Settings shows permission as "Granted"
- [ ] Profile page shows "Location: Granted"

### Android Testing
- [ ] App requests location on first launch after login
- [ ] Permission dialog shows "Precise" and "Approximate" options
- [ ] Guest pass generation works after granting permission
- [ ] Settings → Apps → PRE Group shows Location as "Allowed"
- [ ] Profile page shows "Location: Granted"

---

## Files Modified

1. ✅ `capacitor.config.json` - Added Geolocation plugin config
2. ✅ `android/app/src/main/AndroidManifest.xml` - Updated location permissions
3. ✅ `src-capacitor/android/app/src/main/AndroidManifest.xml` - Added all permissions
4. ✅ `src/pages/auth/ProfilePage.vue` - Added permission status UI
5. ✅ `src/services/permissionsService.js` - Added checkBluetoothPermission method
6. ✅ `ios/App/App/Info.plist` - Already had correct keys (no changes needed)

---

## Quick Start

### For iOS:
```bash
./sync-ios-permissions.sh
```

### For Android:
```bash
./sync-android-permissions.sh
```

Both scripts will sync, verify, and open the respective IDE for building.

---

## Support

If issues persist after following this guide:
1. Check console logs for permission-related messages
2. Verify Geolocation plugin version: `npm list @capacitor/geolocation`
3. Ensure device location services are enabled in system settings
4. Try completely uninstalling and reinstalling the app

---

Last Updated: November 6, 2025

