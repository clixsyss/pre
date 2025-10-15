# 🔍 DEBUG: iOS Not Receiving Notifications (Safari Works)

## Symptom
✅ Notifications work in **Safari** (web)  
❌ Notifications **NOT** working on **iOS device**

---

## 🚨 CRITICAL FIRST STEP

### Did you rebuild in Xcode after the latest fixes?

The fixes we just made require **rebuilding the app in Xcode**:

1. **Open Xcode:**
   ```bash
   open "/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/ios/App/App.xcworkspace"
   ```

2. **Clean Build Folder:**
   - In Xcode: `Product → Clean Build Folder` (or `Cmd + Shift + K`)

3. **Rebuild:**
   - `Product → Build` (or `Cmd + B`)

4. **Run on Device:**
   - Select your iPhone
   - Click Run (or `Cmd + R`)

**⚠️ The `npx cap sync` command updates the native files, but Xcode still needs to rebuild the app!**

---

## 🔍 Step-by-Step Debugging

### Step 1: Check Your iOS Logs

After rebuilding and running the app, you should see in Xcode console:

```
✅ GOOD LOGS (token saved):
🎉 FCMService: Got FCM token: f3L8KI3Nxk48lRVeO3fMnx:APA91b...
🔍 FCMService: Capacitor Auth check - User ID: OpljNxl2HvVV6a6VIvXI4CgYq9Z2
🎉 FCMService: Saving token to Firestore for user: OpljNxl2HvVV6a6VIvXI4CgYq9Z2
FCMService: Saving token to Firestore: {token, platform: "ios", userId}
✅ FCMService: Token saved successfully to Firestore
```

```
❌ BAD LOGS (token NOT saved):
🎉 FCMService: Got FCM token: f3L8KI3Nxk48lRVeO3fMnx:APA91b...
⚠️ FCMService: No authenticated user yet, retrying... (attempt 1/10)
...
❌ FCMService: Token not saved after 10 attempts
```

**If you see the BAD logs:**
- The old build is still running
- You need to rebuild in Xcode (see above)

---

### Step 2: Verify Token in Firebase Console

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select project: `pre-group`

2. **Navigate to Firestore:**
   - Click **Firestore Database** in left sidebar

3. **Check for your token:**
   - Navigate to: `users` → `{your-user-id}` → `tokens`
   - Look for **TWO documents**:
     - One with platform: `"web"` (for Safari) ✅
     - One with platform: `"ios"` (for iPhone) ❓

**What you should see:**

```
users/
  └─ OpljNxl2HvVV6a6VIvXI4CgYq9Z2/
      └─ tokens/
          ├─ [hash-1]/              ← Web token (Safari)
          │   ├── token: "BDL03mUP..."
          │   ├── platform: "web"
          │   └── createdAt: timestamp
          │
          └─ [hash-2]/              ← iOS token (iPhone) ← Should be here!
              ├── token: "f3L8KI3Nxk48lRVeO3fMnx..."
              ├── platform: "ios"
              └── createdAt: timestamp
```

**If you only see the web token:**
- iOS token is NOT being saved
- Rebuild in Xcode (Step 1)

---

### Step 3: Check APNs Configuration in Firebase

Even if the token is saved, notifications won't reach iOS without APNs setup:

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select project: `pre-group`

2. **Check Cloud Messaging Settings:**
   - Click **⚙️ Project Settings** (gear icon)
   - Go to **Cloud Messaging** tab
   - Scroll to **Apple app configuration**

3. **Verify APNs Auth Key is uploaded:**
   ```
   ✅ You should see:
   
   Apple Push Notification Authentication Key
   ✅ APNs Authentication Key uploaded
   
   Key ID: [your-key-id]
   Team ID: [your-team-id]
   ```

**If APNs key is NOT uploaded:**
- iOS notifications will NEVER work
- Follow this guide: [Upload APNs Key to Firebase](https://firebase.google.com/docs/cloud-messaging/ios/certs)

---

## 🎯 Quick Test Script

**Run this in your iOS app's Safari Web Inspector:**

1. **Connect your iPhone** to Mac
2. **Open Safari** on Mac
3. **Enable Developer Mode** on iPhone:
   - Settings → Safari → Advanced → Web Inspector: ON
4. **In Safari on Mac:**
   - Develop → [Your iPhone Name] → localhost
5. **In Console, run:**

```javascript
// Check if token is being saved
const fcmService = (await import('/src/services/fcmService.js')).fcmService;

// Check current token
console.log('Current token:', fcmService.currentToken);

// Try to get current user
const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
const { user } = await FirebaseAuthentication.getCurrentUser();
console.log('Current user ID:', user?.uid);

// Try to manually save token
if (fcmService.currentToken && user?.uid) {
  await fcmService.saveTokenToFirestore(fcmService.currentToken, 'ios');
  console.log('✅ Token manually saved!');
}
```

---

## 📊 Diagnosis Table

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Safari works, iOS doesn't | iOS token not in Firestore | Rebuild in Xcode |
| "Token not saved after 10 attempts" | Old build running | Rebuild in Xcode |
| Token saved but no notification | APNs key not configured | Upload APNs key to Firebase |
| Both tokens in Firestore, still no iOS notification | APNs certificate issue | Check Firebase Console |
| Everything configured, still not working | Real device needed | iOS Simulator doesn't support push |

---

## 🎯 Most Likely Issue

Based on your question "Is it because it's connected to the computer?":

**Answer:** No, connection doesn't matter. **The issue is probably:**

1. **You haven't rebuilt in Xcode yet** after the authentication fix
2. **OR** the iOS token isn't being saved to Firestore (check Step 2 above)
3. **OR** APNs Auth Key isn't uploaded to Firebase (check Step 3 above)

---

## ✅ Checklist

- [ ] **Rebuilt app in Xcode** after latest fixes (Product → Clean Build Folder → Build)
- [ ] **Checked Xcode logs** for "✅ Token saved successfully to Firestore"
- [ ] **Verified iOS token** exists in Firebase Firestore at `users/{uid}/tokens/`
- [ ] **Verified APNs Auth Key** is uploaded in Firebase Console
- [ ] **Testing on real device** (not simulator)
- [ ] **App has Push Notifications capability** in Xcode
- [ ] **Provisioning profile** includes push notifications

---

## 🚀 Quick Fix (Most Likely):

**1. Clean and rebuild in Xcode:**
```bash
# In Terminal
cd "/Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre"
open ios/App/App.xcworkspace

# Then in Xcode:
# Product → Clean Build Folder (Cmd+Shift+K)
# Product → Build (Cmd+B)
# Product → Run (Cmd+R)
```

**2. Check logs in Xcode console for:**
```
✅ FCMService: Token saved successfully to Firestore
```

**3. If you see that log, check Firebase Console → Firestore:**
- Look for `users/{your-uid}/tokens/` 
- Should have document with `platform: "ios"`

**4. If token is there, check Firebase Console → Cloud Messaging:**
- Verify APNs Auth Key is uploaded

---

## 💡 Pro Tip

The fact that Safari works proves:
- ✅ Dashboard is working
- ✅ Cloud Functions are working
- ✅ Your web token is being saved correctly

So the issue is **ONLY** with iOS - which means it's one of:
1. iOS token not being saved (rebuild in Xcode)
2. APNs not configured (upload key to Firebase)

Check these two things and it will work! 🎯

