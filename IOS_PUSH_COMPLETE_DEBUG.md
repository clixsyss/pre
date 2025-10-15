# 🔍 Complete iOS Push Notifications Debug Guide

## 🎯 What We've Done

1. ✅ Fixed bundle ID mismatch (`com.pre-group.app`)
2. ✅ Added retry logic for token saving
3. ✅ Set up listeners BEFORE registration
4. ✅ Added comprehensive native iOS logging
5. ✅ Added detailed FCM service logging

## 🧪 Testing Steps

### Step 1: Clean Build in Xcode

1. **Open Xcode**: Open your project at `/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/ios/App/App.xcworkspace`
2. **Clean Build Folder**: 
   - Press `Cmd + Shift + K`
   - Or go to **Product** → **Clean Build Folder**
3. **Build**:
   - Press `Cmd + B`
   - Or go to **Product** → **Build**

### Step 2: Verify Capabilities

1. **Select your app target** (App)
2. **Go to "Signing & Capabilities" tab**
3. **Verify you have BOTH**:
   - ✅ **Push Notifications** capability
   - ✅ **Background Modes** with "Remote notifications" checked

### Step 3: Run and Monitor Logs

1. **Run on a real device** (not simulator - simulators don't support push notifications)
2. **Open the Xcode Console** (bottom panel)
3. **Look for these specific log markers**:

#### ✅ Success Pattern:
```
📱 AppDelegate: App launched
📱 AppDelegate: Registering for remote notifications...
📱 AppDelegate: Notification authorization - granted: true
📱 AppDelegate: Calling registerForRemoteNotifications()
✅ AppDelegate: Successfully registered for remote notifications!
✅ AppDelegate: Device token: <64-character-hex-string>
✅ AppDelegate: Device token length: 32

FCMService: Setting up native listeners BEFORE registration...
FCMService: Adding registration listener...
FCMService: About to call PushNotifications.register()...
FCMService: PushNotifications.register() completed
🎉🎉🎉 FCMService: *** REGISTRATION EVENT FIRED ***
🎉 FCMService: Token: <apns-token>
🎉 FCMService: Saving token to Firestore for user: OpljNxl2HvVV6a6VIvXI4CgYq9Z2
✅ FCMService: Token saved successfully!
```

#### ❌ Failure Pattern (APNs Registration Failed):
```
📱 AppDelegate: App launched
📱 AppDelegate: Registering for remote notifications...
📱 AppDelegate: Notification authorization - granted: true
📱 AppDelegate: Calling registerForRemoteNotifications()
❌ AppDelegate: Failed to register for remote notifications!
❌ AppDelegate: Error: <error-message>
```

#### ⚠️ Partial Success (No Token Event):
```
📱 AppDelegate: App launched
... (no APNs registration logs at all)

FCMService: Setting up native listeners BEFORE registration...
FCMService: Adding registration listener...
FCMService: About to call PushNotifications.register()...
FCMService: PushNotifications.register() completed
(Then nothing - no registration event)
```

## 🔍 Common Issues and Solutions

### Issue 1: No AppDelegate Logs

**Problem**: You don't see any "📱 AppDelegate" logs

**Solution**:
- The AppDelegate.swift file wasn't synced
- Run: `npx cap sync ios`
- Clean and rebuild in Xcode

### Issue 2: "Failed to register for remote notifications"

**Problem**: You see "❌ AppDelegate: Failed to register" in logs

**Possible Causes**:
1. **Missing APNs Authentication Key in Firebase**
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Under "Apple app configuration" → Upload APNs Authentication Key
   - Get the key from Apple Developer Console

2. **Wrong Bundle ID**
   - Verify in Xcode: **General** tab → **Bundle Identifier** = `com.pre-group.app`
   - Verify in `capacitor.config.json`: `"appId": "com.pre-group.app"`
   - Verify in Firebase: iOS app is registered with bundle ID `com.pre-group.app`

3. **Network Issues**
   - Device must have internet connection
   - APNs requires connection to Apple's servers

### Issue 3: Registration Event Never Fires

**Problem**: You see "PushNotifications.register() completed" but NO "🎉🎉🎉 REGISTRATION EVENT FIRED"

**Possible Causes**:
1. **Capacitor Plugin Not Bridging Properly**
   - Check if `@capacitor/push-notifications` is installed: `npm ls @capacitor/push-notifications`
   - Reinstall if needed: `npm install @capacitor/push-notifications@latest`
   - Run `npx cap sync ios`

2. **AppDelegate Not Calling NotificationCenter**
   - Verify `AppDelegate.swift` has the custom code
   - Clean build and run again

### Issue 4: User Not Authenticated

**Problem**: You see "⚠️ FCMService: No authenticated user yet, retrying..."

**Solution**:
- This is expected! The retry logic will keep trying for 5 seconds
- Make sure you're logged in BEFORE the app starts
- Or wait for the retry to succeed

## 🎯 Verification Checklist

Run through this checklist:

- [ ] Xcode project has "Push Notifications" capability
- [ ] Xcode project has "Background Modes" with "Remote notifications"
- [ ] Bundle ID in Xcode = `com.pre-group.app`
- [ ] `capacitor.config.json` has `"appId": "com.pre-group.app"`
- [ ] Firebase Console has iOS app with bundle ID `com.pre-group.app`
- [ ] Firebase Console has APNs Authentication Key uploaded
- [ ] `App.entitlements` has `<key>aps-environment</key><string>development</string>`
- [ ] Running on a **real device** (not simulator)
- [ ] Device has internet connection
- [ ] User is authenticated in the app

## 📊 Expected Firestore Structure

After successful registration, you should see:

```
users/
  └── OpljNxl2HvVV6a6VIvXI4CgYq9Z2/
      └── tokens/
          ├── <web-token-id>/          ← Web tokens (2 of these)
          │   ├── token: "..."
          │   ├── platform: "web"
          │   └── createdAt: timestamp
          └── <ios-token-id>/          ← iOS token (NEW!)
              ├── token: "..."
              ├── platform: "ios"
              └── createdAt: timestamp
```

## 🚀 Next Steps After Fix

Once you see the iOS token saved:

1. **Test sending a notification from Firebase Console**:
   - Go to Firebase Console → Engage → Messaging
   - Click "New campaign" → "Notifications"
   - Enter title and body
   - Click "Send test message"
   - Enter the iOS FCM token
   - Send!

2. **Test from your admin dashboard**:
   - Send a notification to "All Users" or specific user
   - Check Firestore for notification status
   - Verify iOS app receives it

## 🆘 Still Not Working?

If you've checked everything and it's still not working, share:

1. **Complete Xcode console logs** from app launch to registration attempt
2. **Screenshot of Xcode "Signing & Capabilities" tab**
3. **Screenshot of Firebase Console → Cloud Messaging → Apple app configuration**
4. **Bundle ID from Xcode General tab**
5. **Contents of `capacitor.config.json`**

---

## 📝 Key Insights

**Why Safari works but iOS app doesn't:**
- Web push uses **VAPID keys** (different from APNs)
- iOS native push requires **APNs certificates/keys** + proper entitlements
- They are **completely separate** systems

**Critical iOS Requirements:**
1. APNs Authentication Key in Firebase
2. Push Notifications capability in Xcode
3. Proper bundle ID matching everywhere
4. App.entitlements with aps-environment
5. Real device (simulator doesn't support push)

Good luck! 🍀

