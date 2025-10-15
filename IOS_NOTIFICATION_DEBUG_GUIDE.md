# 🔴 iOS Push Notification Debugging Guide

## Current Issues

### ❌ Issue 1: iOS App Not Receiving Notifications
**Symptoms:**
- Permissions granted ✅
- Registration called ✅
- **BUT: No token received** ❌
- Safari (web) receives notifications ✅

### ❓ Issue 2: Verify Specific User Targeting
Need to confirm notification was sent to the correct user

---

## 🔍 Issue 1: iOS Token Registration Not Working

### **Root Cause**
The `PushNotifications.register()` call is completing, but the `registration` event is **not firing**, which means:
- No APNs token is being retrieved
- No FCM token is being saved to Firestore
- App cannot receive notifications

### **Why This Happens**
1. **Missing APNs Authentication Key** in Firebase Console
2. **Development vs Production** certificate mismatch
3. **iOS Simulator** (doesn't support push - but you're on real device ✅)
4. **App not signed** with proper provisioning profile

---

## ✅ Solution: Fix APNs Configuration

### **Step 1: Verify APNs Key in Firebase Console**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select project**: `pre-group`
3. **Go to**: Project Settings (gear icon) → Cloud Messaging tab
4. **Scroll to**: "Apple app configuration"

**Check if you see:**
```
APNs Authentication Key
Key ID: XXXXXXXXXX
Team ID: XXXXXXXXXX
```

### **If APNs Key is MISSING:**

#### **Option A: Upload APNs Auth Key (Recommended)**

1. **Go to**: https://developer.apple.com/account/resources/authkeys/list
2. **Click**: + button to create new key
3. **Name**: "Firebase Push Notifications"
4. **Enable**: "Apple Push Notifications service (APNs)"
5. **Download**: The `.p8` file (SAVE IT! Can't download again)
6. **Note**: Key ID and Team ID

**Upload to Firebase:**
1. Firebase Console → Project Settings → Cloud Messaging
2. Under "Apple app configuration" → Click "Upload"
3. **Upload** the `.p8` file
4. **Enter** Key ID and Team ID
5. **Save**

#### **Option B: Upload APNs Certificates (Legacy)**

Only if you can't use Auth Key:
1. Generate certificate in Apple Developer Portal
2. Upload to Firebase Console
3. Choose "Development" or "Production" based on build type

---

### **Step 2: Verify Xcode Configuration**

Open your project in Xcode:
```bash
open /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/ios/App/App.xcworkspace
```

#### **Check 1: Signing & Capabilities**
1. Select **App** target
2. Go to **"Signing & Capabilities"** tab
3. **Verify**:
   - ✅ "Push Notifications" capability is added
   - ✅ Signing team is selected
   - ✅ Bundle ID matches: `com.pregroup.app` (or `com.pre-group.app`)

#### **Check 2: Background Modes**
Still in "Signing & Capabilities":
1. **Verify** "Background Modes" capability exists
2. **Check**:
   - ✅ "Remote notifications" is enabled

#### **Check 3: GoogleService-Info.plist**
1. In Xcode, verify `GoogleService-Info.plist` is in the project
2. **Check**:
   - File is **red** = missing (re-add it)
   - File is **white** = good ✅

---

### **Step 3: Add Debug Logging**

Let's add more detailed logging to see what's happening:

<function_calls>
<invoke name="search_replace">
<parameter name="file_path">/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/src/services/fcmService.js
