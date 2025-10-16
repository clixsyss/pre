# Firebase Cloud Messaging (FCM) Setup Guide for PRE App

This guide explains how the notification service is implemented in the PRE app, following the exact pattern from the orange-pharmacies app.

## 📋 Implementation Overview

### Files Created/Modified

1. **Created**: `src/services/notificationService.js`
   - Handles FCM token management
   - Requests notification permissions
   - Manages notification listeners
   - Stores FCM tokens in Firestore

2. **Modified**: `src/services/optimizedAuthService.js`
   - Integrated notification initialization on login
   - Clears notifications on logout
   - Non-blocking notification setup

### How It Works

The implementation follows this flow (exactly like orange-pharmacies):

1. **User Logs In** → Auth state change detected
2. **Request Permissions** → App requests notification permissions from the user
3. **Get FCM Token** → If permission granted, get unique FCM token from Firebase
4. **Save to Firestore** → Token is saved to user's document at `Users/{userId}` under field `fcmToken`
5. **Listen for Notifications** → App listens for incoming notifications

## 🔧 Configuration Required

### Android Configuration

#### 1. Add Google Services JSON File
Place your `google-services.json` file in:
```
src-capacitor/android/app/google-services.json
```

#### 2. Update AndroidManifest.xml
Add to `src-capacitor/android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <application>
    <!-- Firebase Messaging Service -->
    <service
      android:name="com.getcapacitor.plugin.firebase.messaging.FCMService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>

    <!-- Notification metadata -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_icon"
      android:resource="@mipmap/ic_launcher" />
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_color"
      android:resource="@color/colorPrimary" />
  </application>

  <!-- Notification permissions -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

#### 3. Update build.gradle
In `src-capacitor/android/app/build.gradle`, ensure:

```gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    // ... other dependencies
}

apply plugin: 'com.google.gms.google-services'
```

#### 4. Update project-level build.gradle
In `src-capacitor/android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### iOS Configuration

#### 1. Add GoogleService-Info.plist
Place your `GoogleService-Info.plist` file in:
```
src-capacitor/ios/App/App/GoogleService-Info.plist
```

#### 2. Enable Push Notifications Capability
1. Open `src-capacitor/ios/App/App.xcworkspace` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and enable:
   - Remote notifications

#### 3. Update AppDelegate.swift
Make sure `AppDelegate.swift` imports Firebase:

```swift
import UIKit
import Capacitor
import Firebase

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Register for remote notifications
        UNUserNotificationCenter.current().delegate = self
        application.registerForRemoteNotifications()
        
        return true
    }
    
    // Handle remote notification registration
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("APNs device token: \\(deviceToken)")
        // Pass token to Firebase
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \\(error)")
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}
```

#### 4. Update Info.plist
Add to `src-capacitor/ios/App/App/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

#### 5. APNs Authentication Key
1. Go to Apple Developer Portal
2. Certificates, Identifiers & Profiles → Keys
3. Create a new key with "Apple Push Notifications service (APNs)"
4. Download the .p8 file
5. Upload to Firebase Console:
   - Project Settings → Cloud Messaging → APNs Authentication Key

## 📱 Testing Notifications

### Test on Development

1. **Build and run the app**:
   ```bash
   quasar dev -m capacitor -T android
   # or
   quasar dev -m capacitor -T ios
   ```

2. **Sign in with a test user**
   - Check console for: "NotificationService: FCM token saved successfully"

3. **Check Firestore**
   - Go to Firebase Console → Firestore
   - Navigate to `Users/{userId}`
   - Verify `fcmToken` field exists

4. **Send test notification**
   - Firebase Console → Cloud Messaging
   - Click "Send your first message"
   - Enter title and message
   - Add device token from Firestore
   - Send

### Send Notifications from Backend

Use the Firebase Admin SDK to send notifications:

```javascript
const admin = require('firebase-admin');

// Get user's FCM token from Firestore
const userDoc = await admin.firestore()
  .collection('Users')
  .doc(userId)
  .get();

const fcmToken = userDoc.data().fcmToken;

if (fcmToken) {
  // Send notification
  await admin.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Hello from PRE!',
      body: 'This is a test notification',
    },
    data: {
      type: 'test',
      // Add custom data here
    },
  });
}
```

## 🔍 Debugging

### Check if notifications are working:

1. **Check permissions**:
   ```javascript
   const permissions = await FirebaseMessaging.requestPermissions();
   console.log('Permission status:', permissions.receive);
   ```

2. **Check token**:
   ```javascript
   const { token } = await FirebaseMessaging.getToken();
   console.log('FCM Token:', token);
   ```

3. **Monitor console logs**:
   - Look for logs prefixed with `NotificationService:`
   - Check for `🔔` emoji logs in auth service

### Common Issues

**Android:**
- Missing `google-services.json` → Build will fail
- Missing permissions in manifest → Notifications won't show
- Wrong package name in `google-services.json` → Token generation fails

**iOS:**
- Missing APNs key in Firebase → Notifications won't arrive
- Push notifications capability not enabled → Build fails
- Wrong bundle ID → Notifications won't arrive

## 🎯 Key Differences from Orange Pharmacies

The PRE app implementation has a few improvements:

1. **Non-blocking initialization**: Notifications are initialized with a 1-second delay to avoid blocking the auth flow
2. **Separate service**: Notification logic is in a dedicated service file for better organization
3. **Better error handling**: Notifications failures don't prevent login (they're optional)
4. **Clean logout**: FCM token is properly cleared from Firestore on logout

## 📚 Resources

- [Capacitor Firebase Messaging](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/messaging)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Push Notifications](https://developer.android.com/develop/ui/views/notifications)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)

## ✅ Verification Checklist

- [ ] Package `@capacitor-firebase/messaging` is installed (already done)
- [ ] Android: `google-services.json` is in place
- [ ] Android: Permissions added to AndroidManifest.xml
- [ ] iOS: `GoogleService-Info.plist` is in place
- [ ] iOS: Push Notifications capability enabled
- [ ] iOS: APNs key uploaded to Firebase Console
- [ ] Test notification received on physical device
- [ ] FCM token visible in Firestore after login
- [ ] Token cleared from Firestore after logout

## 🚀 Next Steps

1. Configure native projects (Android & iOS) as per this guide
2. Test on physical devices (notifications don't work in simulators)
3. Implement server-side notification sending logic
4. Add notification handling in your app (navigation, badges, etc.)
5. Consider adding notification categories and actions

