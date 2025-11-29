# Firebase → AWS Migration Checklist

Helper scripts live here to move the `pre` backend off Firebase and onto the new Amplify stack. Work through the sections in order, pausing after each major milestone to verify.

## 0. Prerequisites

- Node.js 18+.
- Firebase service account JSON with access to Firestore, Auth, and Storage (`FIREBASE_SERVICE_ACCOUNT`).
- Firebase project metadata in env vars: `FIREBASE_PROJECT_ID`, optional `FIREBASE_STORAGE_BUCKET`.
- AWS CLI credentials for the `PRE` profile (or export `AWS_PROFILE`/`AWS_REGION`).
- Cognito user pool already created by `amplify add auth` and noted via `COGNITO_USER_POOL_ID`.
- Pinpoint app created (for push) with `PINPOINT_APP_ID`.
- Install migration dependencies once:

  ```bash
  cd migration-scripts
  npm install
  ```

Keep Firebase exports backed up locally until the switch is fully verified.

## 1. Firestore → DynamoDB

1. Export collections:

   ```bash
  npm run export-firestore
  ```

2. Provision tables (PAY_PER_REQUEST, hash key `id`):

   ```bash
  npm run create-dynamo
  ```

   Adjust `createDynamoTables.js` if any collection needs composite keys or global secondary indexes.

3. Import JSON into DynamoDB:

   ```bash
  npm run import-dynamo
  ```

4. Verify in AWS Console (record counts, spot-check documents).

## 2. Firebase Storage → S3

1. Set `AMPLIFY_S3_BUCKET` (the bucket from `amplify storage` or Amplify hosting).
2. Run the streaming transfer (defaults to `public-read`, override via `S3_OBJECT_ACL`):

   ```bash
  npm run transfer-storage
  ```

3. Validate key counts and object ACLs in S3.

## 3. Cloud Messaging → Pinpoint

1. Export FCM tokens from Firestore (defaults to `fcmTokens` collection):

   ```bash
  npm run export-fcm-tokens
  ```

   Use `FCM_TOKENS_COLLECTION`, `FCM_TOKEN_FIELD`, and `FCM_TOKEN_USER_FIELD` env vars if your schema differs.

2. Import endpoints into Pinpoint:

   ```bash
  npm run sync-pinpoint
  ```

   Test push delivery with a sample user. Update the app’s `fcm.js` boot file to register devices via AWS Pinpoint or Amplify Push Notifications.

## 4. Firebase Auth → Amazon Cognito

1. Export Firebase Auth users:

   ```bash
  npm run export-auth
  ```

   Result: `auth-users.json`. Password hashes cannot be migrated—plan for forced password reset.

2. Import into Cognito (requires `COGNITO_USER_POOL_ID`, optionally `COGNITO_TEMP_PASSWORD`):

   ```bash
  npm run import-auth
  ```

   The script suppresses welcome emails; send your own reset campaign after import.

3. Update the Quasar app to use the Amplify Auth client (`aws-amplify`). Replace all Firebase Auth SDK calls and confirm sign-in flows on iOS/Android/Web.

## 5. Cloud Functions → Lambda

- Inventory existing Firebase Cloud Functions (see `functions/` in the repo).
- For each function:
  - Recreate via `amplify add function` (HTTP endpoints) or DynamoDB Streams/EventBridge for triggers.
  - Move environment variables into Amplify function parameters (`amplify function update`).
  - Deploy with `amplify push`.
- Decommission Firebase Functions only after Lambda replacements are tested.

## 6. Security Rules → IAM/AppSync Policies

- Translate Firestore security rules into DynamoDB/AppSync access policies:
  - Use Cognito group-based authorization in AppSync resolvers, or
  - Inline IAM condition checks on DynamoDB table roles if accessing directly via SDK.
- For file access, move Firebase Storage rules into S3 bucket policies. Amplify Storage helpers respect Cognito identities.
- Document and test all critical access paths (admin vs member vs guest).

## 7. Verification & Cutover

- Confirm DynamoDB counts and sample documents match Firestore exports.
- Confirm S3 object counts and URLs.
- Run integration tests (web, iOS, Android) against Cognito, DynamoDB, S3, Pinpoint.
- Monitor CloudWatch logs for Lambda functions during dry-run.
- Toggle feature flags/config in the app so production builds point at AWS endpoints.
- After sign-off, disable Firebase Auth, Functions, Firestore writes, and Storage writes.

## 8. Optional Cleanup

- Commit scripts when stable:

  ```bash
  git add migration-scripts
  git commit -m "Add Firebase to AWS migration toolkit"
  ```

- Archive Firebase exports for audit, then remove temporary JSON/exports once AWS data is validated.

