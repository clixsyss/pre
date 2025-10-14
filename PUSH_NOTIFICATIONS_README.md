# Push Notification System - README

## 📋 Overview

This directory contains a complete push notification system for the PRE Group mobile app (iOS, Android, Web) and admin dashboard.

### System Components

```
pre/
├── src/
│   ├── services/
│   │   └── fcmService.js                 # FCM client service (token mgmt, handlers)
│   └── boot/
│       └── fcm.js                        # FCM initialization on app startup
├── public/
│   └── firebase-messaging-sw.js          # Service worker for web push
├── functions/
│   └── index.js                          # Cloud Functions (sending logic)
├── firestore.rules                       # Security rules (updated with token perms)
├── PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md   # Complete guide
├── PUSH_NOTIFICATION_QUICK_START.md            # 15-min quick start
├── example-notification-payloads.json          # Example payloads
└── install-push-notifications.sh               # Installation script

pre-dashboard/
├── src/
│   ├── components/
│   │   └── NotificationManager.js        # Admin UI for creating notifications
│   └── hooks/
│       └── useAuthState.js               # Auth state hook
```

---

## 🚀 Quick Start

### Option 1: Automated Installation (Recommended)

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre
./install-push-notifications.sh
```

Then follow the manual steps shown at the end (VAPID key, boot file registration, etc.)

### Option 2: Manual Installation

Follow: **[PUSH_NOTIFICATION_QUICK_START.md](./PUSH_NOTIFICATION_QUICK_START.md)**

---

## 📖 Documentation

| Document | Description | Time to Read |
|----------|-------------|--------------|
| **[PUSH_NOTIFICATION_QUICK_START.md](./PUSH_NOTIFICATION_QUICK_START.md)** | Get started in 15 minutes | 5 min |
| **[PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md](./PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md)** | Complete implementation guide with Firebase setup, testing, troubleshooting | 30 min |
| **[example-notification-payloads.json](./example-notification-payloads.json)** | Example notification payloads for testing | 5 min |

---

## ✅ Features

### Client Features (iOS, Android, Web)
- ✅ Device token registration and management
- ✅ Foreground notification handling (in-app banners)
- ✅ Background notification handling (system notifications)
- ✅ Notification tap handling (deep linking)
- ✅ Token refresh handling
- ✅ Automatic token cleanup on logout
- ✅ Bilingual support (English/Arabic)

### Admin Dashboard Features
- ✅ Create notifications with bilingual content
- ✅ Send immediately or schedule for future
- ✅ Target all users, specific users, or topic subscribers
- ✅ Choose notification type (announcement, promo, news, etc.)
- ✅ Add optional images
- ✅ Preview notifications before sending
- ✅ View recent notifications and statuses
- ✅ Retry failed notifications

### Cloud Functions Features
- ✅ Automatic sending on notification creation
- ✅ Scheduled sending (runs every minute)
- ✅ Batch sending (handles 500+ tokens)
- ✅ Invalid token removal
- ✅ Success/failure tracking
- ✅ Topic subscription management
- ✅ Bilingual payload support

---

## 🏗️ Architecture

### Flow Diagram

```
Admin creates notification in dashboard
    ↓
Notification document written to Firestore /notifications
    ↓
Cloud Function triggered (sendNotificationOnCreate)
    ↓
Function collects device tokens from /users/{uid}/tokens
    ↓
Function builds FCM messages (bilingual)
    ↓
Function sends via Firebase Cloud Messaging in batches
    ↓
FCM delivers to devices (iOS/Android/Web)
    ↓
Client app receives and displays notification
    ↓
User taps notification → app navigates to relevant page
```

### Data Model

**User Tokens:**
```
/users/{uid}/tokens/{tokenId}
  ├─ token: "eXaMpLeToKeN123..."
  ├─ platform: "ios" | "android" | "web"
  ├─ createdAt: Timestamp
  ├─ lastSeenAt: Timestamp
  └─ deviceInfo: { userAgent, isNative, platformType }
```

**Notifications:**
```
/notifications/{notificationId}
  ├─ title_en: "Welcome!"
  ├─ title_ar: "مرحبا!"
  ├─ body_en: "Thank you for joining..."
  ├─ body_ar: "شكرا لانضمامك..."
  ├─ type: "announcement"
  ├─ sendNow: true
  ├─ scheduledAt: null | Timestamp
  ├─ audience: { all: true, uids: [], topic: null }
  ├─ status: "pending" | "sent" | "failed"
  ├─ createdBy: "adminUid"
  ├─ createdAt: Timestamp
  ├─ sentAt: Timestamp | null
  ├─ tokensCount: 150
  ├─ successCount: 148
  ├─ failureCount: 2
  └─ invalidTokensRemoved: 2
```

---

## 🔧 Configuration

### Required Configuration

1. **VAPID Key** (Web Push)
   - Get from: Firebase Console → Cloud Messaging → Web Push certificates
   - Update in: `src/services/fcmService.js` line 37

2. **APNs Key** (iOS Push)
   - Get from: Apple Developer Portal → Keys
   - Upload to: Firebase Console → Cloud Messaging → Apple app configuration

3. **google-services.json** (Android Push)
   - Location: `android/app/google-services.json`
   - Already configured for project: pre-group

4. **FCM Boot File**
   - Register in: `quasar.config.js` → `boot: ['fcm']`

5. **Notification Manager Route**
   - Add in: `pre-dashboard/src/App.js`
   - Route: `/notifications`

---

## 🧪 Testing

### Test Checklist

- [ ] Web browser - token registration
- [ ] Web browser - foreground notification
- [ ] Web browser - background notification (tab inactive)
- [ ] Web browser - notification tap → navigation
- [ ] iOS real device - token registration
- [ ] iOS real device - foreground notification
- [ ] iOS real device - background notification (app closed)
- [ ] iOS real device - notification tap → navigation
- [ ] Android device/emulator - token registration
- [ ] Android device/emulator - foreground notification
- [ ] Android device/emulator - background notification
- [ ] Android device/emulator - notification tap → navigation
- [ ] Admin dashboard - create immediate notification
- [ ] Admin dashboard - schedule future notification
- [ ] Admin dashboard - target specific users
- [ ] Admin dashboard - view notification status
- [ ] Cloud Functions - logs show successful sends
- [ ] Cloud Functions - invalid tokens removed
- [ ] Bilingual content - English notification
- [ ] Bilingual content - Arabic notification

### Testing Commands

```bash
# View Cloud Functions logs
firebase functions:log

# View specific function logs
firebase functions:log --only sendNotificationOnCreate

# View logs in real-time
firebase functions:log --follow

# Test Cloud Functions locally
firebase emulators:start --only functions,firestore

# Test web app
npm run dev

# Build and sync mobile apps
npm run build && npx cap sync

# Open iOS in Xcode
npx cap open ios

# Open Android in Android Studio
npx cap open android
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Permission denied" saving token | Deploy Firestore rules: `firebase deploy --only firestore:rules` |
| iOS registration fails | Verify APNs key uploaded, clean Xcode build |
| Android notifications not appearing | Add `POST_NOTIFICATIONS` permission to AndroidManifest |
| Web service worker error | Ensure `firebase-messaging-sw.js` exists in `public/` |
| Scheduled notifications not sending | Enable Cloud Scheduler API in Google Cloud Console |
| Invalid registration token errors | Normal - function automatically removes invalid tokens |

### Debug Logs

**Web (Browser Console):**
```javascript
// Enable verbose FCM logs
localStorage.setItem('debug', 'firebase:*');
```

**iOS (Xcode Console):**
```bash
# Filter for FCM logs
FCMService
```

**Android (Logcat):**
```bash
# Filter for FCM logs
adb logcat | grep FCMService
```

**Cloud Functions:**
```bash
firebase functions:log --follow
```

---

## 📊 Monitoring

### Firebase Console Dashboards

1. **Cloud Messaging Reports**
   - Path: Firebase Console → Cloud Messaging → Reports
   - Metrics: Delivery rate, open rate, impressions

2. **Cloud Functions Logs**
   - Path: Firebase Console → Functions → Logs tab
   - View: Execution logs, errors, performance

3. **Firestore Usage**
   - Path: Firebase Console → Firestore Database → Usage tab
   - Metrics: Reads, writes, storage

### Key Metrics to Monitor

- **Token Count:** `/users/{uid}/tokens` - Should grow with users
- **Notification Status:** Success vs Failed ratio
- **Invalid Tokens:** Should be low (<5%)
- **Function Execution Time:** Should be <10 seconds
- **Cost:** Monthly Firebase bill

---

## 💰 Cost Estimate

### Firebase Pricing (Blaze Plan)

| Service | Free Tier | Current Usage | Estimated Cost |
|---------|-----------|---------------|----------------|
| FCM | Unlimited | Unlimited | **$0.00** |
| Cloud Functions | 2M invocations/month | ~5K/month | **$0.50** |
| Cloud Scheduler | 3 jobs/month | 1 job | **$0.00** |
| Firestore | 50K reads, 20K writes/day | ~500 reads, ~100 writes/day | **$0.00** |

**Total: ~$0.50/month**

---

## 🔒 Security

### Firestore Rules

Token access is restricted to:
- ✅ Users can only read/write their own tokens
- ✅ Admins can create/update notifications
- ✅ Users can read (but not write) notifications

### Cloud Functions Security

- ✅ Topic subscription requires authentication
- ✅ Notification creation validates admin status
- ✅ Token validation prevents malicious tokens

---

## 📚 Resources

### Official Documentation
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

### Support
- 📖 Full Guide: [PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md](./PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md)
- ⚡ Quick Start: [PUSH_NOTIFICATION_QUICK_START.md](./PUSH_NOTIFICATION_QUICK_START.md)
- 💬 Firebase Support: https://firebase.google.com/support

---

## 🎯 Next Steps

### Immediate Next Steps
1. ✅ Complete Firebase Console setup (VAPID key, APNs key)
2. ✅ Deploy Firestore rules and Cloud Functions
3. ✅ Test on all platforms (iOS, Android, Web)
4. ✅ Train admins on dashboard usage

### Future Enhancements
- 📊 Add analytics tracking (open rates, conversion)
- 🎨 Rich notifications with action buttons
- 👤 User notification preferences
- 🌍 Location-based targeting
- 📝 Notification templates
- 🔔 In-app notification center
- 📈 A/B testing for notification content

---

## 📝 Changelog

### Version 1.0.0 (October 2025)
- ✅ Initial release
- ✅ iOS, Android, Web support
- ✅ Bilingual support (EN/AR)
- ✅ Admin dashboard UI
- ✅ Immediate and scheduled sending
- ✅ Token management and cleanup
- ✅ Topic subscription support

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0  
**Maintained by:** PRE Group Development Team

---

## 🤝 Contributing

When making changes to the notification system:

1. Test on all platforms (iOS, Android, Web)
2. Update documentation if adding features
3. Check Cloud Functions logs for errors
4. Verify Firestore rules allow necessary operations
5. Test with bilingual content

---

**🚀 Ready to start? Run:** `./install-push-notifications.sh`

