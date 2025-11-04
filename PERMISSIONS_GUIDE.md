# Permissions Guide

## Overview

This app requests critical permissions upfront to ensure a smooth user experience. Users are asked to grant permissions when they first log in, rather than being surprised by permission requests later when trying to use features.

## Permissions Requested

### 1. **Location Permission** 📍
- **When:** Requested at app startup after login
- **Why:** Required for guest pass generation with location restrictions
- **Usage:** Validates that users are within project premises when creating guest passes
- **iOS:** "While Using the App" permission
- **Android:** Fine location access

### 2. **Bluetooth Permission** 📱
- **When:** Requested at app startup after login
- **Why:** Required for gate control and smart device features
- **Usage:** Connects to BLE devices like gate controllers and smart home devices
- **iOS:** Bluetooth access
- **Android:** Nearby devices permission (Bluetooth + Location for BLE scanning)

### 3. **Notifications Permission** 🔔
- **When:** Requested at app startup via FCM service
- **Why:** Receive important community updates, announcements, and alerts
- **Usage:** Push notifications from Firebase Cloud Messaging

### 4. **Camera & Media Permissions** 📷
- **When:** Requested on-demand when user tries to upload images
- **Why:** Upload photos for service requests, complaints, and chat messages
- **Usage:** Access camera and photo library

## Implementation Details

### Files Created

1. **`src/services/permissionsService.js`**
   - Main permissions service
   - Handles location and Bluetooth permission requests
   - Provides permission status checking
   - Includes user-friendly instructions for denied permissions

2. **`src/boot/permissions.js`**
   - Boot file that initializes permissions at app startup
   - Waits for user authentication before requesting permissions
   - Delays by 2 seconds to ensure UI is fully loaded

### Configuration Changes

**`quasar.config.js`**
- Added `'permissions'` to boot files array
- Added Bluetooth LE stub for web builds

## User Experience Flow

```
1. User opens app
   ↓
2. User logs in
   ↓
3. App waits 2 seconds for UI to load
   ↓
4. Location permission dialog appears
   ↓
5. User grants/denies location permission
   ↓
6. Bluetooth permission dialog appears (iOS) or initializes (Android)
   ↓
7. User grants/denies Bluetooth permission
   ↓
8. User can now use all app features
```

## Permission Timing

- **Notifications:** Requested via FCM service after authentication
- **Location & Bluetooth:** Requested 2 seconds after authentication
- **Camera & Media:** Requested on-demand when user tries to upload images

This staggered approach prevents overwhelming users with multiple permission dialogs at once.

## Handling Denied Permissions

If a user denies permissions, the app will:

1. **Location Denied:**
   - Guest pass generation will fail with error message
   - Error includes instructions to enable in device settings
   - Example: "Go to Settings → PRE Group → Location → Select 'While Using the App'"

2. **Bluetooth Denied:**
   - Gate control features will not work
   - Smart device features will be unavailable
   - User will see error messages with instructions

## Testing Permissions

### Reset Permissions on iOS
1. Delete app from device
2. Reinstall app
3. Permissions will be requested again

### Reset Permissions on Android
1. Go to Settings → Apps → PRE Group → Permissions
2. Reset all permissions to "Ask every time"
3. Reopen app

### Test Permission Service Manually

```javascript
// In browser console or component
const permissionsService = window.$permissions

// Check current permission status
const status = await permissionsService.checkPermissionStatus()
console.log(status)

// Request permissions manually
await permissionsService.requestAllPermissions()

// Get instructions for denied permissions
const locationInstructions = permissionsService.getPermissionInstructions('location')
console.log(locationInstructions)
```

## Platform-Specific Notes

### iOS
- Location permission shows "While Using the App" and "Always" options
- Users should select "While Using the App" for better privacy
- Bluetooth permission is requested automatically when BLE is initialized
- NSLocationWhenInUseUsageDescription is displayed in permission dialog

### Android
- Location permission is required for BLE scanning (Android OS requirement)
- "Nearby devices" permission includes Bluetooth access
- Permissions can be granted as "While using the app" or "Only this time"

## Troubleshooting

### Permissions not appearing
1. Ensure user is logged in
2. Check console logs for errors
3. Verify boot file is loaded: `quasar.config.js` → boot array includes `'permissions'`

### Bluetooth permission failing
1. Ensure `@capacitor-community/bluetooth-le` is installed
2. Check that device has Bluetooth hardware
3. Verify Bluetooth is enabled on device

### Location permission failing
1. Ensure location services are enabled on device
2. Check that app has been granted permission in device settings
3. Verify Info.plist (iOS) or AndroidManifest.xml (Android) includes location permission declarations

## Related Files

- `src/services/permissionsService.js` - Main permissions logic
- `src/boot/permissions.js` - Boot file for initialization
- `src/services/locationService.js` - Location service using Geolocation API
- `src/composables/useBluetooth.js` - Bluetooth functionality
- `ios/App/App/Info.plist` - iOS permission descriptions
- `android/app/src/main/AndroidManifest.xml` - Android permission declarations

## Best Practices

1. **Always check permissions before using features** that require them
2. **Provide clear error messages** when permissions are denied
3. **Include instructions** on how to enable permissions in device settings
4. **Don't overwhelm users** - stagger permission requests
5. **Request permissions with context** - explain why the permission is needed

## Future Improvements

- [ ] Add permission onboarding screen with explanations
- [ ] Show permission status in settings page
- [ ] Add "Remind me later" option for non-critical permissions
- [ ] Implement permission rationale screens (especially for Android)
- [ ] Add deep links to device settings for easier permission management

