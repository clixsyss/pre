# Security Update: Firestore Rules for User Blocking

## 🔒 Security Rules Update Required

The new user blocking functionality requires additional Firestore security rules to ensure proper authorization and data protection.

## ⚠️ Current Security Issues

1. **Missing Admin Authorization**: No verification that users performing blocking operations are actually admins
2. **Open User Access**: Users collection is currently open for all reads/writes (temporary migration workaround)
3. **Missing Blocking Field Rules**: No specific rules for the new blocking fields

## ✅ Required Firestore Rules Update

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Existing rules...

    // Users collection - Updated with proper security
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow users to update their own data (except blocking fields)
      allow update: if request.auth != null && request.auth.uid == userId &&
        // Prevent users from modifying their own blocking status
        !('blockedFromGatePasses' in request.resource.data) &&
        !('blockedFromGatePassesAt' in request.resource.data) &&
        !('blockedFromGatePassesBy' in request.resource.data) &&
        !('blockedFromGatePassesReason' in request.resource.data) &&
        !('blockedFromGatePassesUntil' in request.resource.data) &&
        !('unblockedFromGatePassesAt' in request.resource.data) &&
        !('unblockedFromGatePassesBy' in request.resource.data) &&
        !('unblockedFromGatePassesReason' in request.resource.data);

      // Allow admins to read and update all user data including blocking fields
      allow read, update: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));

      // Allow creation for registration (temporary)
      allow create: if true; // TEMPORARY: Remove after migration complete
    }

    // Admin authorization check function
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Blocking operations - Admin only
    match /users/{userId} {
      // Allow admins to modify blocking fields
      allow update: if isAdmin() &&
        (('blockedFromGatePasses' in request.resource.data) ||
         ('blockedFromGatePassesAt' in request.resource.data) ||
         ('blockedFromGatePassesBy' in request.resource.data) ||
         ('blockedFromGatePassesReason' in request.resource.data) ||
         ('blockedFromGatePassesUntil' in request.resource.data) ||
         ('unblockedFromGatePassesAt' in request.resource.data) ||
         ('unblockedFromGatePassesBy' in request.resource.data) ||
         ('unblockedFromGatePassesReason' in request.resource.data));
    }
  }
}
```

## 🚀 Deployment Steps

1. **Update Firestore Rules**:

   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Test the Rules**:
   - Try to block a user as a non-admin (should fail)
   - Try to block a user as an admin (should succeed)
   - Try to modify blocking fields as a regular user (should fail)

## 🔧 Additional Security Measures

### 1. **Admin Authorization Service**

Create a service to verify admin status:

```javascript
// src/services/adminAuthService.js
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'

export const isUserAdmin = async (userId) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId))
    return adminDoc.exists()
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
```

### 2. **Update User Blocking Service**

Add admin verification to the blocking service:

```javascript
// In userBlockingService.js
import { isUserAdmin } from './adminAuthService'

async blockUserFromGatePasses(userId, adminId, reason, blockedUntil = null) {
  try {
    // Verify admin authorization
    const isAdmin = await isUserAdmin(adminId)
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    // Rest of the function...
  } catch (error) {
    // Handle error
  }
}
```

### 3. **Input Validation**

The services now include comprehensive input validation:

- ✅ User ID format validation
- ✅ Admin ID format validation
- ✅ String sanitization (XSS prevention)
- ✅ Phone number validation
- ✅ Reason length validation
- ✅ Date validation

### 4. **Error Handling**

- ✅ Generic error messages (no sensitive data leakage)
- ✅ Proper error logging
- ✅ Graceful fallbacks

## 🧪 Testing Checklist

### Security Tests

- [ ] Non-admin cannot block users
- [ ] Non-admin cannot unblock users
- [ ] Users cannot modify their own blocking status
- [ ] Invalid inputs are rejected
- [ ] XSS attempts are sanitized
- [ ] Phone numbers are validated
- [ ] Error messages don't leak sensitive information

### Functionality Tests

- [ ] Admin can block users
- [ ] Admin can unblock users
- [ ] Temporary blocking expires automatically
- [ ] WhatsApp integration works with valid phone numbers
- [ ] UI shows proper blocking messages
- [ ] Generate button is disabled for blocked users

## 📋 Migration Notes

1. **Temporary Open Access**: The current open access to users collection is temporary for migration purposes
2. **Admin Verification**: Add proper admin verification before deploying to production
3. **Rule Testing**: Test all rules thoroughly before production deployment
4. **Monitoring**: Monitor Firestore security rule violations in the Firebase console

## ⚠️ Important Warnings

1. **Remove Temporary Rules**: The open access rules for users collection should be removed after migration is complete
2. **Admin Verification**: Ensure admin verification is working before production deployment
3. **Regular Audits**: Regularly audit admin access and blocking operations
4. **Backup Rules**: Keep a backup of working rules before making changes

---

**Status**: ✅ Ready for Deployment  
**Priority**: 🔴 High - Security Critical  
**Last Updated**: December 2024
