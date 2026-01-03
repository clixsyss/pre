# AWS Migration Analysis & Cleanup Report

## Executive Summary

This project is in a **hybrid state** - it has AWS services (Cognito, DynamoDB, S3) set up and actively being used, but still contains significant Firebase dependencies and unused files that should be removed to improve performance and reduce bundle size.

## Current State

### ✅ AWS Services (Active & Required)
- **AWS Cognito** - Authentication via `aws-amplify` (configured in `src/boot/amplify.js`)
- **DynamoDB** - Database operations (multiple services in `src/services/dynamoDB*.js`)
- **S3** - File storage (configured via AWS SDK)
- **AWS SDK v3** - All required packages installed

### ⚠️ Firebase Services (Partially Active)
- **Firebase Messaging (FCM)** - Still required for push notifications (legitimate use case)
- **Firebase Boot Files** - Still loading but may not be needed for core functionality
- **Firebase Cloud Functions** - Active but should be migrated to AWS Lambda
- **Smart Mirror Firebase** - Separate integration, may be needed

### ❌ Unused/Obsolete Files (Should Be Deleted)

## Files to Delete

### 1. Firebase Configuration Files
- `firebase.json` - Firebase hosting/functions configuration
- `.firebaserc` - Firebase project configuration
- `firestore.rules` - Firestore security rules (44KB)
- `firestore.indexes.json` - Firestore index definitions (9.5KB)
- `storage.rules` - Firebase Storage rules (8.5KB)
- `.firebase/` directory - Firebase cache files

### 2. Firebase Boot Files (If Not Needed)
- `src/boot/firebase.js` - Main Firebase initialization (156 lines)
- `src/boot/capacitorFirebase.js` - Capacitor Firebase boot (20 lines)
- `src/boot/smartMirrorFirebase.js` - Smart Mirror Firebase (145 lines) - **CHECK IF NEEDED**

### 3. Firebase Cloud Functions
- `functions/` directory - Entire Firebase Functions directory
  - `functions/index.js` - 1468 lines of Firebase Functions code
  - `functions/package.json`
  - `functions/package-lock.json`

### 4. Example/Demo Files
- `src/components/FirebaseExample.vue` - Example component (not used)
- `src/examples/capacitor-firestore-examples.js` - Example code
- `src/examples/firestore-usage-example.js` - Example code
- `src/examples/dynamoDBProjectsUsageExample.js` - Example code (if exists)

### 5. Backup Files
- `src/services/firestoreService.js.backup` - Backup file
- `ios/App/App.xcodeproj/project.pbxproj.backup` - iOS backup

### 6. Duplicate/Unused Files
- `src/aws-exports 2.js` - Duplicate AWS exports
- `src/aws-exports 3.js` - Duplicate AWS exports
- `firestore_indexes_backup.txt` - Backup file

### 7. Firebase Service Worker (If Not Using FCM)
- `public/firebase-messaging-sw.js` - **KEEP IF USING FCM**

### 8. Documentation Files (Migration Complete)
- `GUEST_PASS_AWS_MIGRATION.md` - Migration complete
- `AWS_NOTIFICATION_MIGRATION.md` - Migration complete
- `AWS_HOSTING_SETUP.md` - Setup complete
- `DYNAMODB_INTEGRATION.md` - Integration complete
- `DYNAMODB_INTEGRATION_COMPLETE.md` - Complete
- `DYNAMODB_MIGRATION_COMPLETE.md` - Complete
- `DYNAMODB_PROJECTS_INTEGRATION_INSTRUCTIONS.md` - Instructions (can keep for reference)

### 9. Test Files (If Not Needed)
- `test-firestore.js` - Firestore test file
- `test-google-signin.js` - Google Sign-In test file

### 10. Firebase-Related Scripts
- `create-admin.js` - May use Firebase (check first)
- `fix-service-status.js` - May use Firebase (check first)

## Files to Review Before Deleting

### Critical Review Needed:
1. **`src/boot/smartMirrorFirebase.js`** - Check if Smart Mirror integration is still active
2. **`src/boot/fcm.js`** - Uses Firebase Messaging for push notifications (REQUIRED)
3. **`src/services/fcmService.js`** - FCM service (REQUIRED for push notifications)
4. **`public/firebase-messaging-sw.js`** - Service worker for FCM (REQUIRED if using FCM)

### Services Still Using Firebase:
These services may need refactoring to remove Firebase dependencies:
- `src/services/firestoreService.js` - Main Firestore service
- `src/services/unifiedFirestoreService.js` - Unified Firestore wrapper
- `src/services/smartMirrorService.js` - Smart Mirror service
- `src/utils/firestore.js` - Firestore utilities
- `src/utils/googleAuthHelper.js` - Google Auth helper (may use Firebase)

## Package Dependencies to Remove

From `package.json`, these Firebase packages can be removed if not using FCM:
- `firebase` - **KEEP IF USING FCM**
- `@capacitor-firebase/app` - **KEEP IF USING FCM**
- `@capacitor-firebase/authentication` - Can remove (using Cognito)
- `@capacitor-firebase/firestore` - Can remove (using DynamoDB)
- `@capacitor-firebase/storage` - Can remove (using S3)
- `@capacitor-firebase/messaging` - **KEEP IF USING FCM**

## Quasar Config Changes Needed

In `quasar.config.js`, remove these boot files if not needed:
```javascript
boot: [
  'amplify',        // KEEP - AWS Cognito
  'i18n',          // KEEP
  'axios',         // KEEP
  'capacitorFirebase',  // REMOVE if not needed
  'firebase',      // REMOVE if not needed
  'smartMirrorFirebase', // REVIEW - may be needed
  'projectStore',  // KEEP
  'fcm',          // KEEP if using FCM
  'permissions',  // KEEP
],
```

## Estimated Impact

### Bundle Size Reduction:
- Removing Firebase SDK: ~200-300KB
- Removing unused boot files: ~50-100KB
- Removing example files: ~10-20KB
- **Total estimated reduction: ~260-420KB**

### Performance Improvements:
- Faster app startup (fewer boot files to load)
- Reduced memory footprint
- Cleaner dependency tree
- Faster build times

## Migration Checklist

- [ ] Review Smart Mirror Firebase integration status
- [ ] Confirm FCM is still needed for push notifications
- [ ] Remove Firebase boot files from `quasar.config.js`
- [ ] Delete Firebase configuration files
- [ ] Delete Firebase Functions directory
- [ ] Delete example/demo files
- [ ] Delete backup files
- [ ] Remove unused Firebase packages from `package.json`
- [ ] Update services to remove Firebase imports
- [ ] Test authentication (Cognito)
- [ ] Test database operations (DynamoDB)
- [ ] Test file uploads (S3)
- [ ] Test push notifications (FCM if keeping)

## Notes

1. **FCM (Firebase Cloud Messaging)** is still required for push notifications. This is a legitimate use case as AWS doesn't have a direct equivalent. Consider keeping minimal Firebase setup only for FCM.

2. **Smart Mirror Integration** - The `smartMirrorFirebase.js` boot file suggests a separate Smart Mirror integration. Verify if this is still active before removing.

3. **Firebase Functions** - These should be migrated to AWS Lambda functions for consistency.

4. **Gradual Migration** - Consider removing files in phases to ensure nothing breaks.

## Recommended Action Plan

1. **Phase 1: Remove Obvious Unused Files**
   - Delete backup files
   - Delete example files
   - Delete duplicate aws-exports files
   - Delete Firebase config files (firebase.json, .firebaserc)

2. **Phase 2: Review and Remove Boot Files**
   - Review Smart Mirror integration
   - Remove Firebase boot files if not needed
   - Update quasar.config.js

3. **Phase 3: Clean Dependencies**
   - Remove unused Firebase packages
   - Keep only FCM-related packages if needed

4. **Phase 4: Migrate Functions**
   - Migrate Firebase Functions to AWS Lambda
   - Delete functions directory

5. **Phase 5: Final Cleanup**
   - Remove remaining Firebase service files
   - Update documentation

