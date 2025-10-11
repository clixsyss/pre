# User Migration Flow - Implementation Guide

This document provides a comprehensive guide to the user migration system for PRE Group mobile app.

## 📋 Overview

The user migration system allows users who exist in Firestore (with an `oldId` field) but not in Firebase Authentication to migrate to the new authentication system by setting a password.

## 🏗️ Architecture

### Components

1. **SignIn.vue** - Detects users who need migration
2. **MigrateAccount.vue** - Password setup page for migration
3. **migrateOldUser Cloud Function** - Server-side migration logic
4. **Router** - Includes `/migrate-account` route

### Flow Diagram

```
User tries to sign in
    ↓
auth/user-not-found error
    ↓
Check Firestore for user with oldId
    ↓
User found with oldId and not migrated?
    ↓ YES
Redirect to /migrate-account
    ↓
User sets new password
    ↓
Call migrateOldUser Cloud Function
    ↓
Create Firebase Auth user
    ↓
Update Firestore: migrated=true, authUid=<uid>
    ↓
Success → Redirect to sign in
```

## 📁 Files Modified/Created

### Modified Files
- `/src/pages/unauth/SignIn.vue` - Added migration detection
- `/src/boot/firebase.js` - Added Firebase Functions support
- `/src/router/index.js` - Added `/migrate-account` route
- `/firebase.json` - Added functions configuration

### Created Files
- `/src/pages/unauth/MigrateAccount.vue` - Migration page
- `/functions/index.js` - Cloud Functions
- `/functions/package.json` - Functions dependencies
- `/functions/.gitignore` - Functions ignore file

## 🚀 Deployment Steps

### 1. Install Functions Dependencies

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre/functions
npm install
```

### 2. Deploy Cloud Functions

```bash
# From the pre directory
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre

# Deploy functions to Firebase
firebase deploy --only functions
```

### 3. Test the Functions Locally (Optional)

```bash
# Start Firebase emulators
firebase emulators:start --only functions

# The functions will be available at:
# http://localhost:5001/pre-group/us-central1/migrateOldUser
```

### 4. Update Firestore Security Rules (if needed)

Make sure your Firestore rules allow reading user documents by email for migration checks:

```javascript
// In firestore.rules
match /users/{userId} {
  // Allow migration check by email
  allow read: if request.auth != null || 
    (request.resource == null && 
     get(/databases/$(database)/documents/users/$(userId)).data.email == request.auth.token.email);
}
```

## 🧪 Testing Guide

### Test Case 1: User with oldId (Needs Migration)

**Setup:**
1. Create a test user in Firestore with:
   ```json
   {
     "email": "olduser@example.com",
     "oldId": "OLD_12345",
     "migrated": false,
     "firstName": "Test",
     "lastName": "User",
     "fullName": "Test User"
   }
   ```
2. Make sure this user does NOT exist in Firebase Authentication

**Test Steps:**
1. Open the app
2. Navigate to Sign In
3. Enter email: `olduser@example.com`
4. Enter any password (will be ignored)
5. Click "Sign In"

**Expected Result:**
- App detects user needs migration
- Shows notification: "Please set a new password to complete your account migration"
- Redirects to `/migrate-account` page

**Migration Steps:**
1. Email field shows the user's email (disabled)
2. Enter new password (min 6 characters)
3. Confirm new password
4. Click "Complete Migration"

**Expected Result:**
- Success notification: "Account migrated successfully! Please sign in with your new password"
- Redirects to `/signin`
- User can now sign in with their email and new password
- Firestore document updated with `migrated: true` and `authUid`

### Test Case 2: User Without oldId (Normal User)

**Setup:**
1. Create a normal user via registration
2. User has no `oldId` field

**Test Steps:**
1. Try to sign in with wrong password

**Expected Result:**
- Shows error: "Incorrect password"
- Does NOT redirect to migration page

### Test Case 3: Already Migrated User

**Setup:**
1. User in Firestore with `migrated: true`
2. User exists in Firebase Authentication

**Test Steps:**
1. Sign in with correct credentials

**Expected Result:**
- User signs in successfully
- No migration flow triggered

### Test Case 4: Edge Cases

**Test 4.1: User doesn't exist at all**
- Try signing in with non-existent email
- Expected: "No account found with this email"

**Test 4.2: Password validation**
- Try migration with password < 6 characters
- Expected: Error message about minimum length

**Test 4.3: Password mismatch**
- Enter different passwords in password and confirm fields
- Expected: "Passwords do not match" error

## 📊 Monitoring

### Cloud Functions Logs

Monitor function execution:

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only migrateOldUser
```

### Console Logs

The implementation includes detailed console logs:

**SignIn.vue:**
- `[SignIn] 🔍 User not found in Auth, checking for migration...`
- `[SignIn] ✅ User needs migration, redirecting to migration page`

**MigrateAccount.vue:**
- `[MigrateAccount] Starting migration for: <email>`
- `[MigrateAccount] ✅ Migration successful`

**Cloud Function:**
- `[migrateOldUser] Starting migration process...`
- `[migrateOldUser] ✅ Migration completed successfully!`

## 🔒 Security Considerations

### 1. Cloud Function Security
- Function only accepts authenticated calls via `httpsCallable`
- Validates all inputs (email and password)
- Checks user eligibility before migration
- Rolls back Auth user creation if Firestore update fails

### 2. Data Integrity
- `oldId` is preserved for traceability
- `migrated` flag prevents double migration
- `authUid` links Firestore and Auth records

### 3. Firestore Rules
Users cannot directly modify:
- `migrated` field
- `authUid` field
- `oldId` field

These can only be updated by Cloud Functions with admin privileges.

## 🐛 Troubleshooting

### Issue: Function not found

**Symptoms:** Error calling Cloud Function

**Solutions:**
1. Check function is deployed: `firebase functions:list`
2. Verify project ID in firebase config
3. Check Firebase console for function deployment status

### Issue: Migration fails silently

**Symptoms:** No error shown, but user not migrated

**Solutions:**
1. Check Cloud Function logs: `firebase functions:log`
2. Verify Firestore document has `oldId` field
3. Check `migrated` field is `false` or missing

### Issue: "Permission denied" error

**Symptoms:** Error accessing Firestore

**Solutions:**
1. Check Firestore security rules
2. Verify user document exists
3. Check Firebase Auth configuration

## 📝 Database Structure

### Before Migration

```json
{
  "users/{userId}": {
    "email": "user@example.com",
    "oldId": "OLD_123",
    "migrated": false,
    "firstName": "John",
    "lastName": "Doe",
    // other fields...
  }
}
```

### After Migration

```json
{
  "users/{userId}": {
    "email": "user@example.com",
    "oldId": "OLD_123",           // ✅ Preserved
    "migrated": true,              // ✅ Updated
    "authUid": "firebase_auth_uid", // ✅ Added
    "firstName": "John",
    "lastName": "Doe",
    "updatedAt": "2025-01-10T...",
    // other fields...
  }
}
```

## 🔄 Rollback Procedure

If you need to rollback a migration:

1. Delete the Firebase Auth user:
   ```bash
   # In Firebase Console → Authentication → Users → Delete user
   ```

2. Update Firestore document:
   ```javascript
   await admin.firestore().collection('users').doc(userId).update({
     migrated: false,
     authUid: admin.firestore.FieldValue.delete(),
     updatedAt: admin.firestore.FieldValue.serverTimestamp()
   })
   ```

## 📞 Support

For issues or questions:
- Check Cloud Function logs: `firebase functions:log`
- Review console logs in browser/device
- Check Firebase Console for Auth and Firestore status

## ✅ Checklist

Before going live, ensure:

- [ ] Functions deployed successfully
- [ ] Tested migration with test user
- [ ] Tested edge cases (wrong password, non-existent user, etc.)
- [ ] Firestore rules updated (if needed)
- [ ] Monitoring set up for Cloud Functions
- [ ] Rollback procedure documented
- [ ] Team trained on migration flow

## 🎯 Next Steps

1. Deploy functions to production
2. Test with real users in staging environment
3. Monitor function performance and costs
4. Plan for bulk migration if needed
5. Document any custom variations or requirements

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Author:** AI Assistant (Claude)

