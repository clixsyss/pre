# Test Push Notifications on iOS - Quick Steps

## Current Status:
✅ iOS app is running
✅ User is logged in
✅ FCM boot file loaded
❌ **Push permission not requested yet**

## Solution: Request Permission Manually

### Option 1: Use Browser DevTools on iOS (Easiest)

1. **On your Mac**, open **Safari**
2. **Safari** → **Develop** → **[Your iPhone Name]** → **localhost**
3. This opens the **Web Inspector** for your iOS app
4. In the **Console** tab, paste this command:

```javascript
// Request push notification permission
(async () => {
  const { PushNotifications } = await import('@capacitor/push-notifications');
  
  console.log('Requesting permissions...');
  const result = await PushNotifications.requestPermissions();
  console.log('Permission result:', result);
  
  if (result.receive === 'granted') {
    console.log('Registering...');
    await PushNotifications.register();
    console.log('Registered!');
  }
})();
```

5. **Press Enter**
6. **On your iPhone**, you should see: **"PRE Group Would Like to Send You Notifications"**
7. **Tap "Allow"**
8. Check the console - you should see:
   ```
   ✅ Native registration success: <token>
   ✅ Token saved successfully
   ```

### Option 2: Add a Test Button to the App

Since we already created `EnableNotifications.vue`, let's add it to your router:

Open Xcode and edit the app, or we can add a quick test by logging out and back in (which should trigger FCM initialization again).

### Option 3: Check Firestore for the Token

After Option 1 above works, verify:

1. **Firebase Console** → **Firestore** → `users/OpljNxl2HvVV6a6VIvXI4CgYq9Z2/tokens`
2. You should see a **new token** with `platform: "ios"`

---

## Then Test Sending from Dashboard:

Once the iOS token is saved:

1. **Open dashboard**: `http://localhost:3000`
2. **Login as admin**
3. **Go to**: `http://localhost:3000/#/notifications`
4. **Create notification** (fill all EN/AR fields)
5. **Click "Create & Send Now"**
6. **Push notification appears on your iPhone!** 📱🎉

---

**Try Option 1 now (Safari Web Inspector) - it's the fastest way to trigger the permission request!**

