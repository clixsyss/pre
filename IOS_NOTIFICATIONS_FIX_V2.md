# iOS Push Notifications Fix - Using @capacitor-firebase/messaging

## What Was Fixed (V2)

The previous approach was mixing `@capacitor/push-notifications` with `@capacitor-firebase/messaging`, causing conflicts. The **correct approach** is to use **ONLY** `@capacitor-firebase/messaging` which handles everything automatically.

### Key Changes

1. ✅ **Simplified AppDelegate.swift**
   - Removed manual FCM MessagingDelegate setup
   - Removed manual token handling
   - Let the @capacitor-firebase/messaging plugin handle everything
   - Just configure Firebase and let Capacitor do its magic

2. ✅ **Updated fcmService.js**
   - Now uses `FirebaseMessaging.getToken()` directly instead of waiting for registration events
   - Uses `FirebaseMessaging.requestPermissions()` instead of PushNotifications
   - Uses `FirebaseMessaging` listeners for token refresh and notifications
   - Much simpler and more reliable

3. ✅ **Added capacitor.config.json Configuration**
   - Added `FirebaseMessaging` plugin configuration with presentation options
   - This tells iOS how to show notifications (badge, sound, alert)

## Files Modified

### 1. `capacitor.config.json`
```json
{
  "plugins": {
    "FirebaseMessaging": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

### 2. `AppDelegate.swift` - Simplified
```swift
import UIKit
import Capacitor
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        FirebaseApp.configure()
        return true
    }
    
    // Let Capacitor handle the rest...
}
```

### 3. `fcmService.js` - Using FirebaseMessaging
```javascript
// Import the plugin
const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

// Request permissions
const permissionResult = await FirebaseMessaging.requestPermissions();

// Get token directly
const result = await FirebaseMessaging.getToken();
const token = result.token;

// Save to Firestore
await this.saveTokenToFirestore(token, this.platform);
```

## Prerequisites Before Testing

### 1. Xcode Capabilities ✅
Open Xcode → Select App target → "Signing & Capabilities"

Make sure you have:
- ✅ **Push Notifications** capability
- ✅ **Background Modes** → check "Remote notifications"

### 2. Firebase Console ✅
Go to Firebase Console → Project Settings → Cloud Messaging → Apple app configuration

Make sure:
- ✅ **APNs Authentication Key (.p8 file)** is uploaded
- ✅ **Key ID** is filled in
- ✅ **Team ID** is filled in

### 3. GoogleService-Info.plist ✅
Verify `ios/App/App/GoogleService-Info.plist` exists and is added to Xcode target

## Testing Steps

### Step 1: Rebuild in Xcode

```bash
cd "/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre"
npx cap open ios
```

In Xcode:
1. Clean Build Folder: ⌘⇧K (Cmd + Shift + K)
2. Build: ⌘B (Cmd + B)
3. **Run on PHYSICAL iPhone** (notifications don't work in simulator)

### Step 2: Monitor Logs After Sign In

#### ✅ Native iOS Logs (Xcode Console):
```
📱 AppDelegate: Firebase configured
✅ AppDelegate: Registered for remote notifications
✅ AppDelegate: Device token: [token]
```

#### ✅ JavaScript Console (Safari Web Inspector):
```
FCMService: Initializing native Firebase Messaging...
FCMService: FirebaseMessaging plugin loaded
FCMService: Permission granted ✅
FCMService: Getting FCM token...
🎉 FCMService: Got FCM token: [long-token-string]
🎉 FCMService: Token length: [length]
🎉 FCMService: Saving token to Firestore for user: [userId]
✅ FCMService: Token saved successfully!
✅ FCMService: Native listeners set up successfully
✅ FCMService: Native initialization complete
```

### Step 3: Verify in Firestore

1. Open Firebase Console → Firestore Database
2. Navigate to: `users/{your-user-id}/tokens/`
3. You should see a document with:
   - `token`: Your FCM token string
   - `platform`: "ios"
   - `createdAt`: Timestamp
   - `lastSeenAt`: Timestamp
   - `deviceInfo`: Object with platform details

### Step 4: Send Test Notification

#### Method A: Firebase Console
1. Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and message
4. Click "Send test message"
5. Paste your FCM token
6. Click "Test"

#### Method B: PRE Dashboard
1. Login to dashboard
2. Navigate to Notifications
3. Create new notification for your project
4. Send to all users or target your user
5. Send

### Step 5: Verify Notification Received

Test in these scenarios:

1. **App in Foreground:**
   - Notification should appear as Quasar toast notification
   - Should show title, body, and View/Dismiss buttons

2. **App in Background:**
   - iOS system notification should appear
   - Badge count should update
   - Sound should play

3. **App Killed:**
   - iOS system notification should appear
   - Tapping notification should open app

## Troubleshooting

### ❌ "FirebaseMessaging plugin not found"

**Solution:** Plugin not installed properly
```bash
npm install @capacitor-firebase/messaging
npx cap sync ios
```

### ❌ Token not appearing in Firestore

**Check these logs:**
```
⚠️ FCMService: No authenticated user yet, retrying in 1s...
```

This means user authentication is delayed. The service will retry up to 10 times. If it still fails after 10 attempts, check your authentication flow.

### ❌ "Permission denied"

**Solution:** User denied notification permissions

Check:
- iOS Settings → PRE Group → Notifications → Allow Notifications = ON
- Request permissions again after enabling

### ❌ Notification not arriving

**Possible causes:**
1. **APNs not configured** - Check Firebase Console → Cloud Messaging → iOS config
2. **Wrong environment** - Development vs Production APNs certificate
3. **Token expired** - Try signing out and back in to get new token
4. **App not in correct state** - Some notifications only work when app is background/killed

**Debugging:**
- Send from Firebase Console with test token first
- Check Xcode console for any errors
- Verify token exists in Firestore
- Try on a different device

### ❌ Notifications work from Firebase Console but not from Dashboard

**Possible causes:**
1. Dashboard sending wrong payload format
2. Missing server key in dashboard
3. Wrong API endpoint

**Solution:** Check dashboard notification sending logic to ensure it matches FCM API format

## Important Notes

### Token Refresh

Tokens automatically refresh and the service handles it:
```javascript
// Listener is set up automatically
FirebaseMessaging.addListener('tokenReceived', async (event) => {
  // Token saved to Firestore automatically
});
```

### Notification Payload Format

Your backend should send notifications in this format:

```json
{
  "token": "user-fcm-token",
  "notification": {
    "title": "Notification Title",
    "body": "Notification Body"
  },
  "data": {
    "type": "booking",
    "bookingId": "123",
    "title_ar": "عنوان الإشعار",
    "body_ar": "نص الإشعار"
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

### Background Notifications

For background notifications to work:
1. ✅ `UIBackgroundModes` with `remote-notification` must be in `Info.plist`
2. ✅ AppDelegate must implement `didReceiveRemoteNotification`
3. ✅ Both are already configured correctly

### Production vs Development

- **Development:** Use sandbox APNs (auto-detected by Firebase)
- **Production:** Use production APNs certificate
- Firebase automatically routes to the correct environment based on your build configuration

## Success Criteria ✅

You know everything is working when:

1. ✅ After sign in, you see FCM token in console
2. ✅ Token appears in Firestore under `users/{uid}/tokens/`
3. ✅ Test notification from Firebase Console arrives
4. ✅ Test notification from PRE Dashboard arrives
5. ✅ Foreground notifications show in-app (Quasar toast)
6. ✅ Background notifications show as system notifications
7. ✅ Tapping notification navigates to correct screen

## What's Different from V1?

| Aspect | V1 (Wrong) | V2 (Correct) |
|--------|-----------|--------------|
| Plugin | Mixed @capacitor/push-notifications with @capacitor-firebase/messaging | Only @capacitor-firebase/messaging |
| AppDelegate | Manually set up MessagingDelegate | Let plugin handle everything |
| Token Retrieval | Waited for registration event | Direct call to getToken() |
| Complexity | High - manual handling | Low - plugin handles it |
| Reliability | Timing issues | Reliable and straightforward |

## Next Steps After Success

1. Test on multiple devices
2. Test different notification types (booking, news, etc.)
3. Test notification routing
4. Test bilingual notifications (English/Arabic)
5. Implement notification topics if needed
6. Set up notification analytics

---

**Last Updated:** October 15, 2025  
**Status:** ✅ Ready for Testing (V2 - Simplified Approach)

