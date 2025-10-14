# Push Notifications - Production Deployment Checklist

Use this checklist to ensure everything is configured correctly before going live.

---

## 🔧 Firebase Console Setup

### Cloud Messaging Configuration
- [ ] **VAPID Key Generated**
  - Go to: Project Settings → Cloud Messaging → Web Push certificates
  - Generated key pair
  - Key copied and saved securely
  
- [ ] **APNs Key Uploaded (iOS)**
  - Obtained `.p8` key from Apple Developer Portal
  - Uploaded to Firebase Console → Cloud Messaging → Apple app configuration
  - Entered correct Key ID
  - Entered correct Team ID
  
- [ ] **Android App Configured**
  - `google-services.json` present at `android/app/google-services.json`
  - File contains correct project ID: `pre-group`
  
- [ ] **Cloud Scheduler Enabled**
  - Enabled Cloud Scheduler API in Google Cloud Console
  - Verified billing is enabled (Blaze plan required)

---

## 📱 Quasar App (Mobile & Web)

### Dependencies
- [ ] **@capacitor/push-notifications installed**
  ```bash
  npm install @capacitor/push-notifications
  ```
  
- [ ] **Capacitor synced**
  ```bash
  npx cap sync
  ```

### Configuration Files

#### fcmService.js
- [ ] **VAPID Key Updated**
  - File: `src/services/fcmService.js`
  - Line 37: `this.vapidKey = 'YOUR_ACTUAL_VAPID_KEY'`
  - Replaced with real VAPID key from Firebase Console

#### quasar.config.js
- [ ] **FCM Boot File Registered**
  - File: `quasar.config.js`
  - Added `'fcm'` to boot array
  - Example: `boot: ['firebase', 'fcm', 'i18n']`

#### firebase-messaging-sw.js
- [ ] **Service Worker Exists**
  - File: `public/firebase-messaging-sw.js`
  - Contains correct Firebase config (matching boot/firebase.js)
  - Firebase SDK version matches (11.10.0)

### iOS Setup

#### Xcode Project
- [ ] **Push Notifications Capability Added**
  - Opened `ios/App/App.xcworkspace` in Xcode
  - Selected App target → Signing & Capabilities
  - Added "Push Notifications" capability
  
- [ ] **Background Modes Enabled**
  - Added "Background Modes" capability
  - Checked "Remote notifications"

#### Info.plist
- [ ] **Background Modes Configured**
  - File: `ios/App/App/Info.plist`
  - Contains:
    ```xml
    <key>UIBackgroundModes</key>
    <array>
      <string>remote-notification</string>
    </array>
    ```

### Android Setup

#### AndroidManifest.xml
- [ ] **Permissions Added**
  - File: `android/app/src/main/AndroidManifest.xml`
  - Contains:
    ```xml
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    ```
  
- [ ] **FCM Metadata Added**
  - Contains inside `<application>`:
    ```xml
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_channel_id"
      android:value="default" />
    ```

#### build.gradle
- [ ] **Firebase Messaging Dependency**
  - File: `android/app/build.gradle`
  - Contains:
    ```gradle
    implementation 'com.google.firebase:firebase-messaging:23.1.0'
    ```

---

## 🖥️ React Dashboard

### Components
- [ ] **NotificationManager Component Created**
  - File: `src/components/NotificationManager.js`
  - Component imports and renders correctly
  
- [ ] **useAuthState Hook Created**
  - File: `src/hooks/useAuthState.js`
  - Hook works with existing auth setup

### Routing
- [ ] **Notification Route Added**
  - File: `src/App.js` (or routing file)
  - Added route: `<Route path="/notifications" element={<NotificationManager />} />`
  
- [ ] **Navigation Link Added**
  - Added link to `/notifications` in admin sidebar/menu
  - Link accessible to admins only

### Testing
- [ ] **Dashboard Starts Without Errors**
  ```bash
  npm start
  ```
  - No console errors
  - Notification page loads at `/notifications`
  
- [ ] **Form Functional**
  - All fields render correctly
  - Preview works
  - English and Arabic inputs work
  - Submit button functional

---

## ☁️ Cloud Functions

### Deployment
- [ ] **All Functions Deployed**
  ```bash
  firebase deploy --only functions
  ```
  - sendNotificationOnCreate ✅
  - sendScheduledNotifications ✅
  - subscribeToTopic ✅
  - unsubscribeFromTopic ✅
  
- [ ] **Functions Appear in Console**
  - Go to Firebase Console → Functions
  - All 4 functions listed
  - All functions show "Healthy" status
  
- [ ] **Scheduler Job Created**
  - Go to Cloud Scheduler Console
  - Job: `firebase-schedule-sendScheduledNotifications-us-central1`
  - Status: Enabled
  - Schedule: every 1 minutes

### Logs
- [ ] **No Deployment Errors**
  ```bash
  firebase functions:log
  ```
  - No critical errors in logs
  - Functions execute successfully

---

## 🔐 Firestore Security Rules

### Rules Deployed
- [ ] **Rules Deployed**
  ```bash
  firebase deploy --only firestore:rules
  ```
  
- [ ] **Token Rules Added**
  - Rules file contains:
    ```
    match /users/{userId}/tokens/{tokenId} {
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
    ```
  
- [ ] **Notification Rules Verified**
  - Users can read notifications
  - Only admins can write notifications

### Firestore Indexes
- [ ] **Required Indexes Created**
  - Index for: `notifications` collection
    - status (Ascending)
    - sendNow (Ascending)
    - scheduledAt (Ascending)
  
  Deploy indexes:
  ```bash
  firebase deploy --only firestore:indexes
  ```

---

## 🧪 Testing

### Web Testing
- [ ] **Token Registration Works**
  - Open web app in browser
  - Login as user
  - DevTools shows: "FCM: Token saved successfully"
  - Token visible in Firestore: `users/{uid}/tokens`
  
- [ ] **Foreground Notification Works**
  - Web app open
  - Send test notification from dashboard
  - In-app banner appears (Quasar Notify)
  
- [ ] **Background Notification Works**
  - Web app in background tab
  - Send test notification
  - Browser notification appears in system tray
  
- [ ] **Notification Tap Works**
  - Tap browser notification
  - Web app opens/focuses
  - Navigates to correct page

### iOS Testing (Real Device Only)
- [ ] **Real Device Connected**
  - iPhone connected via USB
  - Device appears in Xcode
  
- [ ] **Token Registration Works**
  - Build and run on device
  - Allow notifications when prompted
  - Xcode console shows: "Native registration success"
  - Token visible in Firestore
  
- [ ] **Foreground Notification Works**
  - App open
  - Send test notification
  - In-app banner appears
  
- [ ] **Background Notification Works**
  - App in background (Home button pressed)
  - Send test notification
  - System notification appears
  
- [ ] **Notification Tap Works**
  - Tap notification from lock screen/notification center
  - App opens
  - Navigates to correct page

### Android Testing
- [ ] **Device/Emulator Has Google Play Services**
  - Use emulator with Play Store
  - OR use real Android device
  
- [ ] **Token Registration Works**
  - Build and run on device/emulator
  - Allow notifications when prompted
  - Logcat shows: "Native registration success"
  - Token visible in Firestore
  
- [ ] **Foreground Notification Works**
  - App open
  - Send test notification
  - In-app banner appears
  
- [ ] **Background Notification Works**
  - App in background
  - Send test notification
  - System notification appears
  
- [ ] **Notification Tap Works**
  - Tap notification
  - App opens
  - Navigates to correct page

### Admin Dashboard Testing
- [ ] **Immediate Notification Works**
  - Create notification with "Send immediately" checked
  - Click "Create & Send Now"
  - Success message appears
  - Notification status changes to "sent" in Firestore
  - Users receive notification
  
- [ ] **Scheduled Notification Works**
  - Create notification with future date/time
  - Click "Schedule Notification"
  - Notification status is "pending" in Firestore
  - Wait for scheduled time
  - Status changes to "sent"
  - Users receive notification
  
- [ ] **Targeting Works**
  - Test "All Users" - all users receive
  - Test "Specific Users" - only those users receive
  - Test "Topic" - only subscribers receive (if implemented)

### Bilingual Testing
- [ ] **English Content Works**
  - Browser/device in English
  - Send notification
  - English title and body appear
  
- [ ] **Arabic Content Works**
  - Browser/device in Arabic
  - Send notification
  - Arabic title and body appear
  - Text displays RTL correctly

---

## 📊 Monitoring Setup

### Firebase Console
- [ ] **Error Alerts Configured**
  - Go to Firebase Console → Alerts
  - Created alert for Cloud Functions failures
  - Email notification enabled
  
- [ ] **Usage Alerts Configured**
  - Alert for excessive function invocations
  - Alert for high Firestore usage

### Logs
- [ ] **Log Viewing Tested**
  ```bash
  firebase functions:log
  ```
  - Logs are accessible
  - Recent activity visible
  
- [ ] **Error Handling Verified**
  - Send notification with invalid data
  - Error logged correctly
  - Status set to "failed" in Firestore

---

## 📚 Documentation

### Team Documentation
- [ ] **Implementation Guide Available**
  - `PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md` exists
  - Team has access to document
  
- [ ] **Quick Start Guide Available**
  - `PUSH_NOTIFICATION_QUICK_START.md` exists
  - New developers can follow it
  
- [ ] **README Available**
  - `PUSH_NOTIFICATIONS_README.md` exists
  - Overview and architecture documented

### Admin Training
- [ ] **Admin Dashboard Training Complete**
  - Admins know how to access `/notifications`
  - Admins understand how to create notifications
  - Admins understand bilingual requirements
  - Admins know how to schedule notifications
  - Admins know how to retry failed notifications

---

## 🚀 Pre-Launch

### Final Checks
- [ ] **All Tests Pass**
  - Web ✅
  - iOS ✅
  - Android ✅
  - Dashboard ✅
  
- [ ] **No Console Errors**
  - Clean browser console
  - Clean Xcode console
  - Clean Logcat
  - Clean Cloud Functions logs
  
- [ ] **Firestore Usage Verified**
  - Token count matches expected users
  - No orphaned tokens
  - Notification history reasonable
  
- [ ] **Cost Monitoring Enabled**
  - Firebase billing alerts configured
  - Budget set (optional)

### Soft Launch (Recommended)
- [ ] **Test with Small User Group**
  - Send to 5-10 beta users first
  - Verify delivery
  - Collect feedback
  
- [ ] **Monitor for 24 Hours**
  - Check Cloud Functions logs
  - Monitor error rates
  - Verify scheduled notifications work
  
- [ ] **Address Any Issues**
  - Fix any bugs found
  - Update documentation if needed

---

## 🎉 Launch

### Go-Live
- [ ] **Full User Notification Sent**
  - Create welcome notification
  - Send to all users
  - Monitor delivery
  
- [ ] **Success Metrics Tracked**
  - Delivery rate: ____%
  - Open rate: ____%
  - Error rate: ____%

### Post-Launch
- [ ] **Monitor for 1 Week**
  - Daily log checks
  - User feedback collected
  - Issues addressed promptly
  
- [ ] **Document Lessons Learned**
  - Note any issues encountered
  - Update documentation as needed
  
- [ ] **Plan Next Enhancements**
  - User preferences
  - Rich notifications
  - Analytics integration

---

## 📞 Support

### Issue Reporting
If you encounter issues:

1. **Check troubleshooting guide:** `PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md`
2. **Check Cloud Functions logs:**
   ```bash
   firebase functions:log --follow
   ```
3. **Check Firestore data:** Verify tokens and notification documents
4. **Test on multiple devices:** Isolate platform-specific issues

### Resources
- 📖 Full Guide: `PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md`
- ⚡ Quick Start: `PUSH_NOTIFICATION_QUICK_START.md`
- 📚 README: `PUSH_NOTIFICATIONS_README.md`
- 💬 Firebase Support: https://firebase.google.com/support

---

**✅ When all items are checked, you're ready for production!**

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0

