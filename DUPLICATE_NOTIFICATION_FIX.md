# Duplicate Notification Fix

## Problem
The app was sending notifications twice because multiple services were independently registering listeners for the same notification events.

## Root Causes

### 1. Multiple Notification Services
The app had **TWO separate notification services** both adding listeners:
- **`fcmService.js`** - Added listeners in `setupNativeListeners()`
- **`notificationService.js`** - Added listeners in `addNotificationListeners()`

### 2. Multiple Initialization Paths
The **`optimizedAuthService.js`** was also initializing notifications:
- Called `notificationService.initializeNotifications()` on auth state change (line 269)
- This happened in **addition to** the FCM boot file initialization

### 3. No Protection Against Duplicate Listeners
None of the services checked if listeners were already registered before adding them again, so calling `addListener()` multiple times would create duplicate listeners.

### 4. Overlapping Initialization in Boot File
The `fcm.js` boot file had multiple paths that could trigger:
- Current user check (immediate)
- Auth state changed listener
- iOS fallback check (after 5 seconds)

## Solution

### Changes Made

#### 1. **fcmService.js**
- ✅ Added `this.isInitialized` flag to prevent duplicate initialization
- ✅ Added `this.listenersSetup` flag to prevent duplicate listener registration
- ✅ Modified `initialize()` to check `isInitialized` before proceeding
- ✅ Modified `setupNativeListeners()` to check `listenersSetup` before adding listeners
- ✅ Modified `unregister()` to reset both flags on cleanup

#### 2. **optimizedAuthService.js**
- ✅ Disabled `initializeNotifications()` - now returns early with log message
- ✅ Removed notification initialization from `onAuthStateChanged()` callback
- ✅ Removed `notificationService` calls from `signOut()` method
- ✅ Added comments explaining that FCM is now handled by fcmService via boot file

### Result
- **Single source of truth**: Only `fcmService` handles all notification logic
- **No duplicate listeners**: Listeners are only registered once
- **Clean separation**: Auth service focuses on authentication, FCM service handles notifications
- **Boot file coordination**: The `fcm.js` boot file manages initialization, but `fcmService` prevents duplicates internally

## Testing

After these changes:
1. **Check console logs** - You should see only ONE "notificationReceived" log per notification
2. **Send a test notification** - User should receive it only once
3. **Check for logs** - Look for "Native listeners already set up, skipping..." to confirm duplicate prevention is working

## Files Modified
1. `/src/services/fcmService.js`
2. `/src/services/optimizedAuthService.js`
3. `/src/boot/fcm.js` (Updated to use shared initialization flag)
4. `/src/pages/auth/EnableNotifications.vue` (Removed duplicate initialization)

## Files to Keep (No Longer Used for Notifications)
- `/src/services/notificationService.js` - Keep for backward compatibility but not actively used
- The `notificationService` is now deprecated in favor of `fcmService`

## Additional Fix (Second Pass)

### 4. **EnableNotifications.vue**
- Removed duplicate `fcmService.initialize()` call on line 89
- This page was re-initializing FCM when user granted permissions
- Now it just logs success since the boot file handles all initialization

### 5. **fcm.js Boot File**
- Changed from local `fcmInitialized` flag to using `fcmService.isInitialized`
- This ensures all initialization paths check the same flag
- Added `hasTokenUpdateInterval` flag to prevent multiple interval timers
- Now all three initialization paths (currentUser, onAuthStateChanged, iOS fallback) use the same shared state

## Migration Notes
If you have any custom code calling `notificationService.addNotificationListeners()`, remove those calls. The FCM boot file handles everything automatically now.

