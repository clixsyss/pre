# Push Notifications - Quick Start Guide

**⚡ Get push notifications working in 15 minutes!**

This is a condensed version of the full implementation guide. Follow these steps in order.

---

## Step 1: Install Dependencies (2 min)

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre

# Install Capacitor Push Notifications
npm install @capacitor/push-notifications

# Sync with native projects
npx cap sync
```

---

## Step 2: Get VAPID Key from Firebase (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/) → **pre-group** project
2. Click gear icon → **Project Settings** → **Cloud Messaging** tab
3. Scroll to **Web Push certificates**
4. Click **Generate key pair**
5. **Copy the key** (starts with `B...`)

**Update the code:**

Edit `src/services/fcmService.js` line 37:
```javascript
this.vapidKey = 'PASTE_YOUR_VAPID_KEY_HERE';
```

---

## Step 3: Register FCM Boot File (1 min)

Edit `quasar.config.js` and add `fcm` to the boot array:

```javascript
boot: [
  'firebase',
  'fcm',  // Add this line
  'i18n'
],
```

---

## Step 4: Deploy Firestore Rules (1 min)

```bash
firebase deploy --only firestore:rules
```

This adds permissions for users to save their FCM tokens.

---

## Step 5: Deploy Cloud Functions (3 min)

```bash
firebase deploy --only functions
```

Wait for deployment to complete. You should see:
- ✅ sendNotificationOnCreate
- ✅ sendScheduledNotifications
- ✅ subscribeToTopic
- ✅ unsubscribeFromTopic

---

## Step 6: Add Notification Manager to Dashboard (2 min)

Edit `pre-dashboard/src/App.js` (or your routing file):

```javascript
import NotificationManager from './components/NotificationManager';

// Add to routes:
<Route path="/notifications" element={<NotificationManager />} />
```

---

## Step 7: Test on Web (2 min)

```bash
# Start Quasar dev server
npm run dev
```

1. Open `http://localhost:9000`
2. Login as a user
3. Open DevTools → Console
4. Look for: `FCMService: Token saved successfully`
5. Go to Firestore → `users/{yourUid}/tokens` → verify token exists

✅ **Web working!**

---

## Step 8: Test Sending a Notification (2 min)

```bash
# Start dashboard
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre-dashboard
npm start
```

1. Login as admin
2. Go to `/notifications`
3. Fill out form:
   - **Title EN:** Test Notification
   - **Title AR:** إشعار تجريبي
   - **Body EN:** This is a test
   - **Body AR:** هذا اختبار
   - **Type:** Announcement
   - **Send immediately:** ✅
   - **Audience:** All Users
4. Click **Create & Send Now**

**Check your web app:**
- You should see a notification banner appear!

✅ **End-to-end working!**

---

## iOS Setup (Real Device Only - 5 min)

⚠️ **iOS Simulator does NOT support push notifications!**

### Upload APNs Key to Firebase

1. Get APNs `.p8` key from Apple Developer Portal
2. Firebase Console → Project Settings → Cloud Messaging → Apple app configuration
3. Upload `.p8` file with Key ID and Team ID

### Xcode Setup

1. Open `pre/ios/App/App.xcworkspace`
2. Select **App** target → **Signing & Capabilities**
3. Add capability: **Push Notifications**
4. Add capability: **Background Modes** → check **Remote notifications**
5. Connect iPhone via USB
6. Select your device in Xcode
7. Click **Run** (▶️)
8. Allow notifications when prompted

**Check Xcode console for:**
```
FCMService: Native registration success
```

✅ **iOS working!**

---

## Android Setup (Emulator or Device - 3 min)

### Verify google-services.json

File should exist at: `pre/android/app/google-services.json`

### Build & Run

1. Open Android Studio
2. File → Open → `pre/android`
3. Select emulator with **Google Play Services**
4. Click **Run** (▶️)
5. Allow notifications when prompted

**Check Logcat for:**
```
FCMService: Native registration success
```

✅ **Android working!**

---

## Common Issues

### "Permission denied" saving token
```bash
firebase deploy --only firestore:rules
```

### iOS registration fails
1. Verify APNs key uploaded to Firebase
2. Clean Xcode build: Cmd+Shift+K
3. Rebuild

### Android notifications not appearing
Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Web service worker error
1. Check `public/firebase-messaging-sw.js` exists
2. Test on HTTPS or localhost only
3. Clear service workers in DevTools

---

## Next Steps

- ✅ Read full guide: `PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md`
- ✅ Test scheduled notifications
- ✅ Test bilingual content (EN/AR)
- ✅ Test on production builds

---

## Verification Checklist

Before going live:

- [ ] VAPID key updated in `fcmService.js`
- [ ] FCM boot file registered in `quasar.config.js`
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed (all 4 functions)
- [ ] Tested on iOS real device
- [ ] Tested on Android device/emulator
- [ ] Tested on web browser
- [ ] Dashboard route added for `/notifications`
- [ ] APNs key uploaded (for iOS)
- [ ] google-services.json present (for Android)

---

**🚀 You're all set! Start sending notifications!**

