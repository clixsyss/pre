# Fix: iOS Notification Click Logs User Out

## Problem

When a user clicks on a notification on iOS, the app opens but then immediately logs the user out. This happens because:

1. **Cold Start Delay**: When iOS opens the app from a notification (cold start), Cognito auth state restoration from the keychain can take 5-10 seconds
2. **Router Guard Too Aggressive**: The router guard checks auth state immediately and signs out the user if:
   - Auth state isn't ready yet
   - DynamoDB user lookup fails (because auth isn't ready)
3. **Race Condition**: The notification handler navigates before auth state is restored, triggering the router guard which signs out the user

## Root Cause

The router guard in `src/router/index.js` was:
- Not waiting long enough for iOS auth state restoration (only 3-5 seconds)
- Signing out users immediately on DynamoDB errors without checking if it's a transient auth restoration issue
- Not detecting notification-triggered navigation to give extra wait time

## Solution

### 1. Increased Wait Times for iOS Notification Navigation

**Router Guard (`src/router/index.js`)**:
- Increased timeout from 5s to 10s for iOS notification navigation
- Added detection for notification-triggered navigation (when `from.path === '/'`)
- Added retry logic: if DynamoDB check fails on iOS notification navigation, wait 3 more seconds and retry

**FCM Service (`src/services/fcmService.js`)**:
- Increased `waitForAuthenticationState()` timeout from 8s to 10s for iOS
- Increased additional delay before navigation from 1.5s to 2s for iOS
- Uses `waitForAuthState()` method for better reliability on iOS

### 2. Less Aggressive Error Handling

**Router Guard**:
- Before signing out on DynamoDB errors, checks if this might be notification navigation
- If iOS + notification navigation, waits 3 more seconds and retries DynamoDB check
- Only signs out if retry also fails (not just on first error)

### 3. Better Notification Navigation Detection

The router guard now detects notification navigation by checking:
- `from.path === '/'` (app was closed/backgrounded)
- `from.name === null || undefined` (no previous route)

## Changes Made

### `src/router/index.js`

1. **Increased timeout for iOS notification navigation**:
   ```javascript
   const timeoutDuration = (isIOS && mightBeNotificationNavigation) ? 10000 : 5000
   ```

2. **Added retry logic for DynamoDB errors on iOS**:
   ```javascript
   if (isIOS && mightBeNotificationNavigation) {
     // Wait 3 more seconds and retry DynamoDB check
     const retryUser = await optimizedAuthService.waitForAuthState(3000)
     // Retry DynamoDB lookup...
   }
   ```

3. **Increased wait time for notification navigation**:
   ```javascript
   const retryUser = isIOS 
     ? await optimizedAuthService.waitForAuthState(8000) // 8s for iOS
     : await optimizedAuthService.getCurrentUser()
   ```

### `src/services/fcmService.js`

1. **Increased wait time for iOS**:
   ```javascript
   const maxWaitTime = this.platform === 'ios' ? 10000 : 5000; // 10s for iOS
   ```

2. **Increased delay before navigation**:
   ```javascript
   const additionalDelay = this.platform === 'ios' ? 2000 : 1000; // 2s for iOS
   ```

3. **Better auth state checking**:
   ```javascript
   const currentUser = this.platform === 'ios' 
     ? await optimizedAuthService.waitForAuthState(Math.min(maxWaitTime - elapsed, 3000))
     : await optimizedAuthService.getCurrentUser();
   ```

## Testing

To test the fix:

1. **Close the app completely** (swipe up from app switcher)
2. **Send a notification** from the dashboard
3. **Tap the notification** to open the app
4. **Verify**: User should remain logged in and navigate to the correct page

### Expected Behavior

- ✅ App opens from notification
- ✅ User remains logged in
- ✅ App navigates to the correct page (based on notification type)
- ✅ No logout occurs

### If Still Logging Out

If users are still being logged out:

1. **Check console logs** for:
   - `Navigation guard: iOS detected, waiting for auth state...`
   - `Notification navigation: waiting for auth state...`
   - `Auth state ready after Xms`

2. **Check if timeout is too short**:
   - If logs show "timeout" before "auth state ready", increase timeout further
   - iOS devices with slower processors may need up to 12 seconds

3. **Check DynamoDB connectivity**:
   - If DynamoDB lookup consistently fails (not just on cold start), check network/credentials

## Technical Details

### Why iOS Takes Longer

1. **Keychain Access**: Cognito stores session tokens in iOS Keychain, which requires:
   - Secure Enclave access (if using biometrics)
   - Keychain daemon communication
   - Session token decryption

2. **Cold Start**: When app is completely closed:
   - No cached auth state in memory
   - Must restore from Keychain
   - Must validate tokens with Cognito

3. **Network Latency**: First network call to validate session can be slow on cold start

### Timing Breakdown (iOS Cold Start)

- **0-2s**: App launches, loads JavaScript bundle
- **2-4s**: Cognito SDK initializes, reads Keychain
- **4-6s**: Session token validated with Cognito
- **6-8s**: Auth state restored, user object available
- **8-10s**: Router guard completes, navigation happens

## Related Files

- `src/router/index.js` - Router guard with auth checks
- `src/services/fcmService.js` - Notification handling
- `src/services/optimizedAuthService.js` - Cognito auth service
- `src/boot/fcm.js` - FCM initialization

## Future Improvements

1. **Pre-warm Auth State**: On app launch, immediately start restoring auth state in background
2. **Cache Auth State**: Store auth state in memory cache that persists across app launches
3. **Progressive Loading**: Show loading screen while auth restores, then navigate
4. **Offline Support**: Cache user data locally to avoid DynamoDB dependency on cold start

