# Files Safe to Delete - Performance Improvement

## Summary
This document lists files that can be safely deleted to improve app performance and reduce bundle size. Files are categorized by safety level.

## ✅ SAFE TO DELETE IMMEDIATELY

### Configuration Files (Firebase - No Longer Used)
```
firebase.json
.firebaserc
firestore.rules
firestore.indexes.json
storage.rules
.firebase/ (entire directory)
```

### Backup Files
```
src/services/firestoreService.js.backup
ios/App/App.xcodeproj/project.pbxproj.backup
firestore_indexes_backup.txt
```

### Duplicate Files
```
src/aws-exports 2.js
src/aws-exports 3.js
```

### Example/Demo Files (Not Used in Production)
```
src/components/FirebaseExample.vue
src/examples/capacitor-firestore-examples.js
src/examples/firestore-usage-example.js
src/examples/dynamoDBProjectsUsageExample.js (if exists)
```

### Test Files (Development Only)
```
test-firestore.js
test-google-signin.js
```

### Documentation (Migration Complete)
```
GUEST_PASS_AWS_MIGRATION.md
AWS_NOTIFICATION_MIGRATION.md
AWS_HOSTING_SETUP.md
DYNAMODB_INTEGRATION.md
DYNAMODB_INTEGRATION_COMPLETE.md
DYNAMODB_MIGRATION_COMPLETE.md
```

## ⚠️ REVIEW BEFORE DELETING

### Firebase Boot Files
**Action:** Review if still needed, then remove from `quasar.config.js` boot array
```
src/boot/firebase.js          # Main Firebase init - likely not needed
src/boot/capacitorFirebase.js # Capacitor Firebase - likely not needed
src/boot/smartMirrorFirebase.js # Smart Mirror - CHECK IF INTEGRATION IS ACTIVE
```

### Firebase Cloud Functions
**Action:** Migrate to AWS Lambda first, then delete
```
functions/ (entire directory)
  - functions/index.js
  - functions/package.json
  - functions/package-lock.json
```

### Service Worker
**Action:** Keep if using FCM for push notifications
```
public/firebase-messaging-sw.js  # KEEP IF USING FCM
```

## 🔒 KEEP (Required for Functionality)

### FCM (Firebase Cloud Messaging) - Required for Push Notifications
```
src/boot/fcm.js
src/services/fcmService.js
public/firebase-messaging-sw.js (if using FCM)
```

### AWS Configuration
```
src/boot/amplify.js
src/aws/dynamodbClient.js
```

## Package.json Dependencies to Remove

After reviewing, these can be removed from `package.json`:
```json
{
  "@capacitor-firebase/authentication": "^7.3.1",  // Remove - using Cognito
  "@capacitor-firebase/firestore": "^7.3.1",       // Remove - using DynamoDB
  "@capacitor-firebase/storage": "^7.3.1"          // Remove - using S3
}
```

**Keep these if using FCM:**
```json
{
  "firebase": "^11.10.0",                          // Keep if using FCM
  "@capacitor-firebase/app": "^7.3.1",            // Keep if using FCM
  "@capacitor-firebase/messaging": "^7.3.1"        // Keep if using FCM
}
```

## Quasar Config Changes

In `quasar.config.js`, update the boot array:
```javascript
boot: [
  'amplify',        // ✅ KEEP - AWS Cognito
  'i18n',          // ✅ KEEP
  'axios',         // ✅ KEEP
  // 'capacitorFirebase',  // ❌ REMOVE
  // 'firebase',      // ❌ REMOVE
  // 'smartMirrorFirebase', // ⚠️ REVIEW FIRST
  'projectStore',  // ✅ KEEP
  'fcm',          // ✅ KEEP if using FCM
  'permissions',  // ✅ KEEP
],
```

## Estimated Impact

- **Bundle Size Reduction:** ~260-420KB
- **Startup Time:** Faster (fewer boot files)
- **Memory:** Reduced footprint
- **Build Time:** Faster builds

## Quick Delete Command (Safe Files Only)

```bash
# Configuration files
rm firebase.json .firebaserc firestore.rules firestore.indexes.json storage.rules
rm -rf .firebase

# Backup files
rm src/services/firestoreService.js.backup
rm ios/App/App.xcodeproj/project.pbxproj.backup
rm firestore_indexes_backup.txt

# Duplicate files
rm "src/aws-exports 2.js" "src/aws-exports 3.js"

# Example files
rm src/components/FirebaseExample.vue
rm src/examples/capacitor-firestore-examples.js
rm src/examples/firestore-usage-example.js

# Test files
rm test-firestore.js test-google-signin.js

# Documentation (optional - keep for reference if needed)
# rm GUEST_PASS_AWS_MIGRATION.md AWS_NOTIFICATION_MIGRATION.md ...
```

## Next Steps

1. ✅ Delete "SAFE TO DELETE IMMEDIATELY" files
2. ⚠️ Review "REVIEW BEFORE DELETING" files
3. 🔄 Update `quasar.config.js` boot array
4. 📦 Update `package.json` dependencies
5. 🧪 Test app functionality
6. 🚀 Rebuild and verify performance improvements

