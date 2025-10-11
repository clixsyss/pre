# Firestore Rules for Migration Flow

## 🔒 Important: Security Rules Update Required

### Issue

The migration detection flow needs to check if a user exists in Firestore **before** they're authenticated. By default, Firestore rules block all unauthenticated reads, which will cause the migration check to timeout or fail.

### Current Error

If you see this in logs:
```
❌ Error checking for migration: [permission-denied]
❌ Firestore query timeout after 5 seconds
```

This means your Firestore rules are blocking the migration check.

---

## ✅ Solution: Update Firestore Rules

### Option 1: Temporary Migration Rule (Recommended for Migration Period)

Add this rule to allow **reading** users by email during migration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow reading user by email for migration check
    // TEMPORARY: Remove after all users are migrated
    match /users/{userId} {
      // Allow unauthenticated read ONLY for migration check
      allow read: if request.auth == null && 
                     resource.data.oldId != null &&
                     resource.data.migrated != true;
                     
      // Normal authenticated rules
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**What this does:**
- ✅ Allows unauthenticated users to read **only** users with `oldId` that need migration
- ✅ Doesn't expose migrated users
- ✅ Doesn't allow writes
- ✅ Normal authenticated access still works

### Option 2: Use Cloud Function (More Secure)

Instead of checking in the client, use the existing `checkMigrationStatus` Cloud Function:

```javascript
// In SignIn.vue
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../boot/firebase'

const checkForMigration = async (email) => {
  try {
    const checkMigrationStatus = httpsCallable(functions, 'checkMigrationStatus')
    const result = await checkMigrationStatus({ email })
    return result.data
  } catch (error) {
    console.error('Error checking migration:', error)
    return { needsMigration: false }
  }
}
```

**Pros:**
- ✅ More secure (no exposed data)
- ✅ No rule changes needed
- ✅ Server-side validation

**Cons:**
- ❌ Requires Cloud Functions to be deployed
- ❌ Slightly slower (network call to function)

---

## 🎯 Recommended Approach

**For Migration Period (During User Migration):**

1. **Use Option 1** (Temporary rule) for best UX
2. Monitor migration progress
3. Once all users migrated → remove the rule

**After Migration Complete:**

1. Remove the temporary rule
2. Only keep authenticated access rules
3. Delete or archive users with `oldId`

---

## 📝 Current Rules Structure

### Minimal Rules for Migration

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Migration check: Allow reading users with oldId that need migration
      allow read: if request.auth == null && 
                     resource.data.oldId != null &&
                     resource.data.migrated != true;
                     
      // Authenticated users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only Cloud Functions can write to migrated/authUid fields
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['migrated', 'authUid', 'oldId']);
    }
    
    // Other collections - keep your existing rules
    // ...
  }
}
```

### Full Production Rules (After Migration)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - production rules
    match /users/{userId} {
      // Only authenticated users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can update their own data
      // Cannot modify: migrated, authUid, oldId
      allow update: if request.auth != null && 
                       request.auth.uid == userId &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['migrated', 'authUid', 'oldId']);
                       
      // Cloud Functions only - for migration
      allow write: if false; // Managed by Cloud Functions
    }
    
    // Other collections
    // ...
  }
}
```

---

## 🧪 Testing Your Rules

### Test 1: Migration Check (Unauthenticated)

Should work:
```javascript
// User with oldId, not migrated
{
  "email": "test@example.com",
  "oldId": "OLD_123",
  "migrated": false
}
```

Should NOT work:
```javascript
// User already migrated
{
  "email": "test@example.com", 
  "oldId": "OLD_123",
  "migrated": true  // This should not be readable
}

// User without oldId
{
  "email": "test@example.com",
  "firstName": "Test"  // No oldId, should not be readable
}
```

### Test 2: Use Firebase Console Rules Playground

1. Go to Firebase Console → Firestore → Rules
2. Click "Rules Playground"
3. Test scenarios:
   - Unauthenticated read of user with `oldId` ✅
   - Unauthenticated read of migrated user ❌
   - Authenticated read of own data ✅

---

## 🔐 Security Considerations

### What's Protected

- ✅ Migrated users are **not** exposed to unauthenticated requests
- ✅ Users without `oldId` are **not** exposed
- ✅ Write operations are **not** allowed
- ✅ Only specific fields are readable (`email`, `oldId`, `migrated` status)

### What's Exposed (Temporarily)

- ⚠️ Email addresses of users needing migration
- ⚠️ Existence of `oldId` field
- ⚠️ Migration status

### Risk Mitigation

1. **Time-Limited:** Remove rule after migration period
2. **Limited Data:** Only exposes users needing migration
3. **Read-Only:** No write access
4. **Conditional:** Only works for specific user state

---

## 📊 Migration Timeline

### Week 1-2: Migration Period
```javascript
// Use temporary migration rule (Option 1)
allow read: if request.auth == null && 
               resource.data.oldId != null &&
               resource.data.migrated != true;
```

### After Migration Complete
```javascript
// Remove temporary rule
allow read: if request.auth != null && request.auth.uid == userId;
```

---

## 🚨 Important Notes

1. **Deploy Rules First:** Update rules BEFORE deploying the app with migration flow
2. **Test Thoroughly:** Use Rules Playground to verify behavior
3. **Monitor Usage:** Check Firestore usage for unusual patterns
4. **Set Reminder:** Schedule removal of temporary rule after migration period
5. **Document Change:** Log when rule was added and when it should be removed

---

## 📝 Deployment Checklist

- [ ] Backup current Firestore rules
- [ ] Add migration rule
- [ ] Test with unauthenticated request
- [ ] Deploy Cloud Functions (if using Option 2)
- [ ] Deploy app with migration flow
- [ ] Monitor migration progress
- [ ] Schedule rule cleanup
- [ ] Remove rule after migration period
- [ ] Verify production rules work

---

## 🔄 Rollback Plan

If you need to rollback:

1. Remove migration rule:
```bash
# Restore previous rules
firebase deploy --only firestore:rules
```

2. Revert app to previous version

3. Users with `oldId` can still be migrated manually by admin

---

**Created:** January 10, 2025  
**Purpose:** Enable secure migration flow  
**Status:** Required for migration deployment  
**Priority:** High - Blocks migration feature

