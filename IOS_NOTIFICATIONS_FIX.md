# iOS Push Notifications Fix

## Problem Diagnosed

Your iOS app was successfully:
- ✅ Registering for APNS (Apple Push Notification Service)
- ✅ Getting an APNS device token
- ❌ **BUT never retrieving or saving the FCM (Firebase Cloud Messaging) token**

This meant your backend had no FCM token to send notifications to, so notifications couldn't work.

### Root Cause

The issue was **timing-related**:
1. iOS AppDelegate registered for notifications and got the APNS token immediately on app launch
2. The JavaScript FCM service initialized later and set up listeners
3. By the time the listeners were ready, the registration event had already fired
4. The FCM token was never retrieved or saved to Firestore

## What Was Fixed

### 1. Installed @capacitor-firebase/messaging Plugin ✅

```bash
npm install "@capacitor-firebase/messaging@7.3.1"
npx cap sync ios
```

This plugin provides proper FCM token management for iOS/Android.

### 2. Updated fcmService.js ✅

Added new methods to handle token retrieval:

**`getNativeToken()`** - Manually retrieves FCM token after initialization
- First tries to use @capacitor-firebase/messaging plugin to get token
- Falls back to waiting for registration event if plugin unavailable
- Ensures token is retrieved even if registration event was missed

**`saveTokenWithRetry()`** - Saves token with retry logic
- Retries up to 10 times (once per second) if user not yet authenticated
- Ensures token is saved even when authentication is delayed
- Provides detailed logging for debugging

**Updated `initializeNative()`** - Now calls getNativeToken() after registration
- Ensures token is retrieved regardless of timing issues

### 3. Updated iOS AppDelegate.swift ✅

Added Firebase initialization and FCM delegate:

**Imports:**
```swift
import FirebaseCore
import FirebaseMessaging
```

**Firebase Configuration:**
```swift
FirebaseApp.configure()
Messaging.messaging().delegate = self
```

**APNS Token Forwarding:**
```swift
Messaging.messaging().apnsToken = deviceToken
```

**FCM Token Reception:**
```swift
func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    // Saves token to UserDefaults and posts notification
}
```

## How to Test

### 1. Rebuild the iOS App

Open Xcode and rebuild the app:

```bash
cd "/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre"
npx cap open ios
```

Then in Xcode:
- Clean Build Folder (Cmd + Shift + K)
- Build (Cmd + B)
- Run on your device

### 2. Monitor Console Logs

Watch for these key log messages after sign-in:

#### ✅ Success Indicators:

```
📱 AppDelegate: Firebase configured
📱 AppDelegate: FCM delegate set
✅ AppDelegate: Successfully registered for remote notifications!
✅ AppDelegate: Device token: [APNS token]
📱 AppDelegate: APNS token passed to Firebase Messaging
🎉🎉🎉 AppDelegate: FCM token received!
🎉 AppDelegate: FCM Token: [FCM token]
✅ AppDelegate: FCM token saved to UserDefaults
```

In JavaScript console:
```
FCMService: Manually retrieving FCM token...
🎉 FCMService: Got native FCM token via plugin: [token]
🎉 FCMService: Saving token to Firestore for user: [userId]
✅ FCMService: Token saved successfully!
```

### 3. Verify Token in Firestore

Check Firebase Console → Firestore Database:

Navigate to: `users/{userId}/tokens/{tokenId}`

You should see a document with:
- `token`: Your FCM token string
- `platform`: "ios"
- `createdAt`: Timestamp
- `lastSeenAt`: Timestamp
- `deviceInfo`: Object with device details

### 4. Test Notifications

#### Option A: Use Firebase Console
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and message
4. Click "Send test message"
5. Enter your FCM token
6. Click "Test"

#### Option B: Use your Dashboard
If you have a PRE dashboard with notification sending capability:
1. Create a test notification for your project
2. Target your user
3. Send notification
4. Check if it arrives on the iOS device

## Troubleshooting

### Token Still Not Appearing?

**Check if FCM token is being generated:**
```swift
// Look for this in iOS console:
🎉🎉🎉 AppDelegate: FCM token received!
```

If you see "Firebase not configured" error, make sure `GoogleService-Info.plist` is in your iOS project.

**Check JavaScript console for:**
```
FCMService: Getting native FCM token...
🎉 FCMService: Got native FCM token via plugin: [token]
```

### User Not Authenticated Error?

The token save will retry automatically up to 10 times. Look for:
```
⚠️ FCMService: No authenticated user yet, retrying in 1s... (attempt X/10)
```

If it fails after 10 attempts:
```
⚠️ FCMService: No authenticated user after 10 attempts, token not saved
```

This means authentication is taking too long. Check your auth flow.

### Plugin Import Error?

If you see:
```
FCMService: @capacitor-firebase/messaging not available
```

The plugin might not be properly installed. Re-run:
```bash
npm install "@capacitor-firebase/messaging@7.3.1"
npx cap sync ios
```

## Expected Behavior After Fix

1. **App Launch:**
   - Firebase configures in AppDelegate
   - App registers for notifications
   - APNS token received and passed to Firebase
   
2. **User Signs In:**
   - FCM service initializes
   - Manually retrieves FCM token via plugin
   - Token saved to Firestore under users/{uid}/tokens/
   
3. **FCM Token Refresh:**
   - When FCM token refreshes, AppDelegate receives it
   - Saves to UserDefaults
   - Posts notification event
   - JavaScript picks it up and updates Firestore

4. **Notification Received:**
   - Background: iOS system shows notification
   - Foreground: AppDelegate receives, JavaScript shows in-app notification
   - Tap: Navigation happens to relevant screen

## Files Changed

1. ✅ `/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/src/services/fcmService.js`
   - Added `getNativeToken()` method
   - Added `saveTokenWithRetry()` method
   - Updated `initializeNative()` to call getNativeToken()
   - Updated registration listener to use saveTokenWithRetry()

2. ✅ `/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/ios/App/App/AppDelegate.swift`
   - Added Firebase imports
   - Added Firebase configuration
   - Added MessagingDelegate
   - Added FCM token reception handler
   - Updated APNS token handling

3. ✅ `package.json`
   - Added @capacitor-firebase/messaging@7.3.1

## Additional Notes

- The fix maintains backward compatibility with the existing push notification setup
- Both @capacitor/push-notifications and @capacitor-firebase/messaging work together
- APNS token is converted to FCM token automatically by Firebase
- Token refresh is handled automatically by the AppDelegate delegate method
- Retry logic ensures token is saved even with delayed authentication

## Support

If notifications still don't work after this fix:

1. Check Firebase Console → Project Settings → Cloud Messaging
   - Verify APNs certificates are uploaded
   - Verify APNs Key is configured

2. Check iOS Capabilities in Xcode:
   - Push Notifications should be enabled
   - Background Modes → Remote notifications should be checked

3. Check device Settings:
   - Settings → PRE Group → Notifications → Allow Notifications should be ON

4. Check Firestore Security Rules:
   - Users should be able to write to their own tokens subcollection

---

**Last Updated:** October 15, 2025
**Status:** ✅ Fixed and Ready for Testing

