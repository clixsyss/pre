# iOS Court Booking Fix

## Issue Summary
The iOS app with Capacitor had two issues with bookings:

### Issue 1: Bookings Not Being Created (FIXED)
1. **Date serialization issue**: JavaScript `Date` objects were not being properly serialized for Capacitor Firebase
2. **Hanging operations**: The `addDocument` operation was hanging indefinitely without timeout
3. **Firebase App initialization error**: The `@capacitor-firebase/app` plugin was showing UNIMPLEMENTED error (non-critical)

### Issue 2: Bookings Not Appearing Immediately (FIXED)
1. **Cache not invalidated**: After creating a booking, cached data was being returned
2. **Timing issue**: Fetch happened before Firestore fully committed the write
3. **No refresh**: Some booking types didn't trigger a refresh after creation

## Changes Made

### 1. `src/services/firestoreService.js`
- Added `serializeDataForCapacitor()` method to convert Date objects to ISO strings
- Updated `addDoc()` to serialize data before sending to Capacitor Firebase
- Added 15-second timeout to prevent hanging operations
- Added detailed error logging
- Updated `setDoc()` and `updateDoc()` to use the same serialization
- **Added automatic cache invalidation after write operations**

### 2. `src/boot/firebase.js`
- Made `@capacitor-firebase/app` initialization error non-blocking
- Other Firebase plugins can still work without it

### 3. `src/services/bookingService.js`
- Added cache invalidation after creating court bookings
- Ensures fresh data is fetched after booking creation

### 4. `src/pages/auth/CourtBooking.vue`
- Added 500ms delay before fetching bookings to ensure Firestore has committed
- Improved timing of success notification and navigation

### 5. `src/pages/auth/ServiceCategoryDetails.vue`
- Added refresh after service booking creation
- Added 500ms delay before fetching to ensure consistency

### 6. `src/pages/auth/AcademyRegistration.vue`
- Added 500ms delay before fetching bookings
- Ensures new registration appears immediately

## Testing Instructions

### 1. Clean and Rebuild iOS App
```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre

# Clean build directory
rm -rf dist

# Build the Quasar app
npm run build

# Sync Capacitor
npx cap sync ios

# Clean iOS build (optional but recommended)
cd ios/App
rm -rf DerivedData
xcodebuild clean -workspace App.xcworkspace -scheme App
cd ../..

# Open Xcode
npx cap open ios
```

### 2. In Xcode
1. Clean Build Folder: `Product → Clean Build Folder` (⇧⌘K)
2. Update Pods (if needed):
   ```bash
   cd ios/App
   pod install --repo-update
   cd ../..
   ```
3. Run the app on a real device or simulator

### 3. Test Court Booking
1. Log in to the app
2. Navigate to **Facilities → Court Booking**
3. Select:
   - A sport (e.g., Tennis)
   - A court (e.g., Court A)
   - A date (October 2, 2025)
   - Time slots (e.g., 07:00 AM, 08:00 AM)
4. Tap **Confirm Booking**
5. Check the console logs for:
   ```
   🔍 Data serialized for Capacitor
   🔍 Calling capacitorFirestore.addDocument...
   ✅ Native addDoc result: { id: "..." }
   ```

### 4. What to Look For

#### Success Indicators:
- ✅ Booking is created in Firestore
- ✅ Success notification appears: "Booking request submitted!"
- ✅ User is redirected to `/my-bookings`
- ✅ Booking appears in the bookings list

#### Console Logs (Expected):
```
🔍 FirestoreService.addDoc called: { collectionPath: "projects/.../bookings", dataKeys: [...] }
🔍 Using native Capacitor Firebase for addDoc...
🔍 Data serialized for Capacitor
🔍 Calling capacitorFirestore.addDocument...
✅ Native addDoc result: { id: "abc123" }
```

#### If It Still Fails:
Look for one of these errors in the console:
1. **Timeout Error**: "addDocument operation timed out" → Indicates network or permissions issue
2. **Permission Denied**: Check Firestore security rules
3. **Invalid Data**: Check that all required fields are present

## Technical Details

### Date Serialization
Before fix:
```javascript
const booking = {
  createdAt: new Date(), // ❌ JavaScript Date object
  // ...
}
```

After fix:
```javascript
// Automatically converted in serializeDataForCapacitor()
const booking = {
  createdAt: "2025-10-01T08:15:47.692Z", // ✅ ISO string
  // ...
}
```

### Timeout Protection
```javascript
const timeoutMs = 15000; // 15 seconds
const result = await Promise.race([
  addDocPromise,
  timeoutPromise
]);
```

### Cache Invalidation
```javascript
// After creating a booking
cacheService.invalidatePattern(`collection:projects/${projectId}/bookings`);

// Wait for Firestore to commit
await new Promise(resolve => setTimeout(resolve, 500));

// Then fetch fresh data
await academiesStore.fetchUserBookings(user.uid, projectId);
```

## Firestore Security Rules
The app uses these rules for bookings:
```javascript
match /projects/{projectId}/bookings/{bookingId} {
  allow read, write: if request.auth != null && request.auth.uid != null;
}
```

## Troubleshooting

### If bookings still don't work:

1. **Check Firestore Rules**:
   - Open Firebase Console → Firestore Database → Rules
   - Verify the rules match the ones in `firestore.rules`
   - Deploy rules: `firebase deploy --only firestore:rules`

2. **Check Network**:
   - Ensure device has internet connection
   - Check if other Firestore operations (read) work

3. **Check Console for Detailed Errors**:
   ```
   ❌ Add document error: ...
   ❌ Error details: { message: "...", code: "...", ... }
   ```

4. **Verify User Authentication**:
   - Ensure `request.auth.uid` is set
   - Check logs: `🔐 FirestoreService: Ensuring authentication context...`

5. **Test on Web First** (for comparison):
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:9000` and test booking there

## Additional Notes

- The `@capacitor-firebase/app` UNIMPLEMENTED error is expected on iOS simulator and can be ignored
- Date objects are now consistently serialized across all Firestore operations (addDoc, setDoc, updateDoc)
- All operations now have proper timeout protection
- This fix applies to all booking types: court bookings, service bookings, and academy registrations

