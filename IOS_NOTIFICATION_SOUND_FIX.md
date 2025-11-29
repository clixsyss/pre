# iOS Notification Sound Fix

## Problem
iOS notifications were arriving **without sound** even though:
- The backend was configured to send `sound: 'default'`
- The iOS app had proper notification permissions
- The AppDelegate was correctly configured with `UNUserNotificationCenterDelegate`

## Root Cause
The issue was in the Firebase Cloud Functions notification payload. The APNS (Apple Push Notification Service) configuration included:

```javascript
apns: {
  payload: {
    aps: {
      sound: 'default',
      badge: 1,
      'content-available': 1,  // ❌ THIS WAS THE PROBLEM
    }
  }
}
```

### Why This Caused Silent Notifications
The `'content-available': 1` flag tells iOS that this is a **background/silent notification**. This flag is specifically designed for:
- Silent data-only notifications
- Waking up the app in the background without alerting the user
- Background refresh operations

When this flag is present, iOS may **suppress the sound** even if `sound: 'default'` is specified, because it assumes you want a silent notification.

## Solution
**Remove the `'content-available': 1` line** from the APNS payload:

```javascript
apns: {
  payload: {
    aps: {
      sound: 'default',  // ✅ Now the sound will play!
      badge: 1,
    }
  }
}
```

## What Was Changed

### 1. Cloud Functions (`pre-dashboard/functions/index.js`)
- **Line 608-616**: Removed `'content-available': 1` from the APNS payload
- This ensures iOS treats the notification as a **foreground notification** with sound

### 2. Example Payloads (`pre/example-notification-payloads.json`)
- **Line 207-222**: Updated the iOS example to include proper APNS configuration
- Added `mutable-content: 1` for future rich notifications support
- Added `apns-priority: "10"` for high-priority delivery

## Deployment Instructions

### Step 1: Deploy the Updated Cloud Functions
```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre-dashboard
firebase deploy --only functions
```

Or use your deploy script:
```bash
./deploy-functions.sh
```

### Step 2: Test the Fix
1. **Send a test notification** from the admin dashboard
2. **Test on an iOS device** with the app:
   - In the **foreground** (app open)
   - In the **background** (app minimized)
   - **Killed** (app not running)
3. **Verify sound plays** in all three scenarios

### Step 3: Verify Logs
Check Firebase Functions logs to ensure notifications are being sent:
```bash
firebase functions:log --only sendNotifications
```

Look for:
```
✅ Sent push notification to user [userId] token [token]...
```

## How iOS Notifications Now Work

### Backend (Cloud Functions)
```javascript
const message = {
  token: userToken,
  notification: {
    title: "Welcome!",
    body: "Thank you for joining."
  },
  data: {
    type: 'announcement',
    notificationId: 'notif_123'
  },
  android: {
    priority: 'high',
    notification: {
      sound: 'default',
      icon: 'notification_icon'
    }
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',  // ✅ Sound enabled
        badge: 1           // ✅ Badge counter
      }
    }
  }
};

await admin.messaging().send(message);
```

### iOS Native (AppDelegate.swift)
```swift
// UNUserNotificationCenterDelegate enables sound
func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
) {
    // Play sound even when app is in foreground
    if #available(iOS 14.0, *) {
        completionHandler([.banner, .sound, .badge])
    } else {
        completionHandler([.alert, .sound, .badge])
    }
}
```

### Capacitor Config (capacitor.config.json)
```json
{
  "plugins": {
    "FirebaseMessaging": {
      "presentationOptions": [
        "badge",
        "sound",  // ✅ Sound permission
        "alert"
      ]
    }
  }
}
```

## When to Use `content-available`
Only use `'content-available': 1` when you need:
- **Silent notifications** (no sound, no banner)
- **Background data sync** without user notification
- **App wake-up** for background processing

For **normal user-facing notifications**, never include this flag.

## Additional iOS Sound Best Practices

### 1. Custom Sounds (Optional)
If you want custom notification sounds:
1. Add `.caf` audio files to `ios/App/App/` directory in Xcode
2. Update the APNS payload:
```javascript
apns: {
  payload: {
    aps: {
      sound: 'custom_sound.caf',  // Your custom sound file
      badge: 1
    }
  }
}
```

### 2. Critical Alerts (Optional)
For time-sensitive notifications (requires special entitlement):
```javascript
apns: {
  payload: {
    aps: {
      sound: {
        critical: 1,
        name: 'default',
        volume: 1.0
      },
      badge: 1
    }
  }
}
```

### 3. Notification Interruption Level (iOS 15+)
```javascript
apns: {
  payload: {
    aps: {
      sound: 'default',
      badge: 1,
      'interruption-level': 'time-sensitive'  // or 'active', 'passive', 'critical'
    }
  }
}
```

## Testing Checklist
- [ ] Deploy updated Cloud Functions
- [ ] Test notification with app in **foreground** - should see banner + hear sound
- [ ] Test notification with app in **background** - should see banner + hear sound
- [ ] Test notification with app **killed** - should see notification + hear sound
- [ ] Test on **multiple iOS devices** (different iOS versions if possible)
- [ ] Verify badge count updates correctly
- [ ] Verify notification tap opens correct page
- [ ] Check device notification settings allow sound
- [ ] Check device is not in Do Not Disturb mode

## Troubleshooting

### Still No Sound?
1. **Check device settings**: Settings > PRE Group > Notifications > Sounds = ON
2. **Check Do Not Disturb**: Make sure device isn't in silent/DND mode
3. **Check Focus modes**: iOS 15+ Focus modes can silence notifications
4. **Check notification logs**: Look for delivery errors in Functions logs
5. **Test with different notification types**: Some notification categories might be configured differently

### Sound Works Sometimes But Not Always?
- This is often caused by iOS notification grouping or Focus modes
- Check notification delivery time (avoid quiet hours)
- Verify APNS priority is set to high

### Need Help?
- Check Firebase Functions logs: `firebase functions:log`
- Check Xcode device logs during notification delivery
- Use Firebase Cloud Messaging test tool: Firebase Console > Cloud Messaging > Send test message

## Related Files
- `/pre-dashboard/functions/index.js` - Cloud Functions notification logic
- `/pre/src/services/fcmService.js` - Frontend FCM service
- `/pre/ios/App/App/AppDelegate.swift` - iOS native notification handling
- `/pre/capacitor.config.json` - Capacitor plugin configuration
- `/pre/example-notification-payloads.json` - Example notification formats

## References
- [Apple APNS Documentation](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging iOS](https://firebase.google.com/docs/cloud-messaging/ios/receive)
- [Capacitor Firebase Messaging](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/messaging)

