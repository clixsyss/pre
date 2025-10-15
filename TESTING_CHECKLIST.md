# iOS Notifications Testing Checklist

## Quick Test Steps

### 1. Rebuild the App 🔨

```bash
cd "/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre"
npx cap open ios
```

In Xcode:
- [ ] Clean Build Folder (⌘⇧K)
- [ ] Build (⌘B) 
- [ ] Run on your physical iOS device

### 2. Sign In & Check Logs 📱

After signing in, verify these logs appear **IN ORDER**:

#### iOS Native Console (Xcode):
```
✅ 📱 AppDelegate: Firebase configured
✅ 📱 AppDelegate: FCM delegate set
✅ ✅ AppDelegate: Successfully registered for remote notifications!
✅ 📱 AppDelegate: APNS token passed to Firebase Messaging
✅ 🎉🎉🎉 AppDelegate: FCM token received!
✅ 🎉 AppDelegate: FCM Token: [long token string]
✅ ✅ AppDelegate: FCM token saved to UserDefaults
```

#### JavaScript Console (Web Inspector):
```
✅ FCMService: Manually retrieving FCM token...
✅ 🎉 FCMService: Got native FCM token via plugin: [token]
✅ 🎉 FCMService: Saving token to Firestore for user: [userId]
✅ ✅ FCMService: Token saved successfully!
```

### 3. Verify in Firestore 🔥

Open Firebase Console → Firestore:

Navigate to: `users/{your-user-id}/tokens/{token-hash}`

Check document contains:
- [ ] `token` field (FCM token string)
- [ ] `platform` = "ios"
- [ ] `createdAt` timestamp
- [ ] `lastSeenAt` timestamp
- [ ] `deviceInfo` object

### 4. Send Test Notification 🔔

#### Method 1: Firebase Console
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter test title and message
4. Click "Send test message"
5. Paste your FCM token
6. Click "Test"
7. [ ] Notification received on device

#### Method 2: PRE Dashboard
1. Login to PRE Dashboard
2. Navigate to Notifications section
3. Create new notification for your project
4. Target your user or send to all
5. Send notification
6. [ ] Notification received on device

## Success Criteria ✅

- [ ] FCM token appears in Xcode logs
- [ ] FCM token saved to Firestore
- [ ] Test notification from Firebase Console arrives
- [ ] Test notification from PRE Dashboard arrives
- [ ] Tapping notification navigates to correct screen

## Common Issues & Solutions ⚠️

### ❌ "Firebase not configured" error
**Solution:** GoogleService-Info.plist is missing or not added to Xcode target
- Right-click on App folder in Xcode
- Add Files to "App"
- Select GoogleService-Info.plist
- Ensure "Copy items if needed" is checked
- Ensure target "App" is selected

### ❌ Token not appearing in Firestore
**Solution:** Check retry logs
```
⚠️ FCMService: No authenticated user yet, retrying...
```
If this continues for 10 attempts, authentication is too slow.

### ❌ "@capacitor-firebase/messaging not available"
**Solution:** Plugin not installed properly
```bash
npm install "@capacitor-firebase/messaging@7.3.1"
npx cap sync ios
```

### ❌ Notifications not arriving
**Possible causes:**
1. APNS certificates not configured in Firebase Console
2. Device notifications disabled in Settings
3. Token expired or invalid
4. App not in background (for background notifications)

**Check:**
- Firebase Console → Project Settings → Cloud Messaging → iOS app configuration
- Device Settings → PRE Group → Notifications → Allow Notifications = ON
- Token exists in Firestore and matches device

## Debug Mode 🐛

To see all FCM logs, add this to your JavaScript console:
```javascript
localStorage.setItem('debug', 'fcm:*')
```

To see native iOS logs:
- Xcode → Window → Devices and Simulators
- Select your device
- Click "Open Console"
- Filter by "AppDelegate" or "FCM"

## Next Steps After Success 🎯

1. [ ] Test foreground notifications (app open)
2. [ ] Test background notifications (app minimized)
3. [ ] Test notification tap actions
4. [ ] Test different notification types
5. [ ] Test notification localization (English/Arabic)
6. [ ] Test on multiple devices
7. [ ] Test token refresh after app restart

---

**Date:** October 15, 2025  
**Status:** Ready for Testing

