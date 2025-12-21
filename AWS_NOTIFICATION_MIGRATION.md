# AWS Notification System Migration

## Overview

The frontend notification system has been migrated from Firebase Cloud Functions to AWS Lambda + DynamoDB Streams. This document explains the changes and how to test the new system.

## Architecture

### Before (Firebase)
1. Admin creates notification in Firestore
2. Firebase Cloud Function (`sendNotificationOnCreate`) triggers on document creation
3. Function sends push notifications via FCM

### After (AWS)
1. Admin creates notification in DynamoDB (`projects__notifications` table)
2. DynamoDB Stream triggers Lambda function
3. Lambda sends push notifications via FCM
4. Lambda updates notification status (processing → sent/partial/failed)

## Key Changes

### New Services Created

1. **`src/services/notificationsAwsService.js`**
   - Creates notifications in DynamoDB `projects__notifications` table
   - Exposes `createNotification()` method for admin UI
   - Frontend only INSERTs - Lambda handles status updates

2. **`src/services/tokenRegistrationService.js`**
   - Registers FCM tokens in DynamoDB `userTokens` table
   - Idempotent: checks for existing tokens before creating
   - Automatically called when FCM token is obtained

### Updated Services

1. **`src/services/fcmService.js`**
   - Now registers tokens in both Firestore (for FCM messaging) AND DynamoDB (for Lambda)
   - Token registration happens automatically on login/refresh

2. **`src/aws/dynamodbClient.js`**
   - Added security warnings about IAM credentials in frontend
   - Credentials isolated to this single file
   - Production recommendation: Use Cognito/STS instead

## Integration Points

### For Admin Notification UI

When creating push notifications in the admin dashboard, use `notificationsAwsService.createNotification()`:

```javascript
import { createNotification } from '@/services/notificationsAwsService'

await createNotification({
  projectId: 'project-123',
  title_en: 'Welcome to PRE Group!',
  title_ar: 'مرحبا بكم في مجموعة PRE!',
  body_en: 'Thank you for joining our community.',
  body_ar: 'شكرا لانضمامك إلى مجتمعنا.',
  audience: { all: true }, // or { uids: ['user1', 'user2'] }
  sendNow: true,
  type: 'announcement'
})
```

**Replace:**
- ❌ Firebase Cloud Functions calls
- ❌ Firestore writes that trigger push notifications
- ❌ Direct FCM sending from frontend

**With:**
- ✅ `notificationsAwsService.createNotification()`

## Testing

### Test Notification Creation

1. **Create notification in UI:**
   - Navigate to admin notification dashboard
   - Fill in title_en, body_en, title_ar, body_ar
   - Select audience (all users or specific users)
   - Click "Send Now" or "Schedule"

2. **Verify in DynamoDB:**
   - Open AWS Console → DynamoDB → `projects__notifications` table
   - Check that new notification record was created with:
     - `parentId` = project ID
     - `id` = notification ID (format: `notif-{timestamp}-{random}`)
     - `status` = "pending"
     - `sendNow` = true/false
     - `title_en`, `body_en`, `title_ar`, `body_ar` present
     - `audience` object with targeting info

3. **Check Lambda logs:**
   - Open AWS Console → CloudWatch → Log Groups
   - Find your Lambda function logs
   - Verify notification processing:
     - Lambda received DynamoDB Stream event
     - Status updated from "pending" → "processing" → "sent"
     - Token collection and FCM sending logs

4. **Verify notification delivery:**
   - Check test device receives push notification
   - Notification should display title_en/body_en (or title_ar/body_ar based on user language)
   - Tap notification to verify navigation

### Test Token Registration

1. **Verify token storage:**
   - Login as a user
   - Open AWS Console → DynamoDB → `userTokens` table
   - Query by `userId` (PK)
   - Verify token record exists with:
     - `userId` = user ID
     - `id` = token ID (format: `{platform}-{hash}-{timestamp}`)
     - `token` = FCM token string
     - `platform` = "web", "ios", or "android"
     - `isActive` = true
     - `createdAt`, `updatedAt` timestamps

2. **Test idempotency:**
   - Login same user on same device multiple times
   - Verify only ONE token record exists (updated, not duplicated)
   - Check `updatedAt` timestamp changes on subsequent logins

3. **Test token refresh:**
   - If FCM token refreshes (rare but possible)
   - Verify new token is registered
   - Old token can remain (Lambda filters by isActive)

## Important Notes

### Security

⚠️ **Current State:** Frontend uses IAM user credentials from environment variables

⚠️ **Production Recommendation:** 
- Replace IAM keys with AWS Cognito Identity Pools
- Or use AWS STS to get temporary credentials
- Or route through API Gateway + Lambda backend
- **Never embed permanent IAM keys in production frontend**

See `src/aws/dynamodbClient.js` for security warnings.

### Token Storage

- Tokens are stored in BOTH Firestore and DynamoDB:
  - **Firestore:** Required for Firebase FCM messaging SDK
  - **DynamoDB:** Required for Lambda notification system
- This dual storage is intentional and necessary
- Both systems use the same token source

### Status Updates

- Frontend creates notification with `status: "pending"`
- Lambda updates status to:
  - `"processing"` - Lambda started processing
  - `"sent"` - Successfully sent to all/most users
  - `"partial"` - Sent to some users, failed for others
  - `"failed"` - Failed to send (no tokens, error, etc.)
- **Frontend should NOT update status** - Lambda owns this field

### Audience Targeting

Supported audience formats:
- `{ all: true }` - Send to all users in project
- `{ uids: ['user1', 'user2'] }` - Send to specific users
- `{ topic: 'topic-name' }` - Send to topic subscribers (future)

Lambda handles token collection based on audience type.

## Troubleshooting

### Notification not appearing in DynamoDB
- Check browser console for errors
- Verify AWS credentials are configured
- Check network tab for DynamoDB API calls

### Lambda not processing notification
- Check DynamoDB Stream is enabled on `projects__notifications` table
- Verify Lambda function has Stream trigger configured
- Check Lambda execution role has DynamoDB and FCM permissions
- Review CloudWatch logs for errors

### Tokens not registering
- Check browser console for token registration errors
- Verify user is authenticated before token registration
- Check DynamoDB permissions for `userTokens` table
- Review `fcmService.js` logs for token retrieval issues

### Notifications not delivered
- Verify tokens exist in `userTokens` table for target users
- Check Lambda logs for FCM sending errors
- Verify FCM project credentials in Lambda environment
- Check notification status in DynamoDB (should be "sent", not "failed")

## Files Modified

- ✅ `src/services/notificationsAwsService.js` (NEW)
- ✅ `src/services/tokenRegistrationService.js` (NEW)
- ✅ `src/services/fcmService.js` (updated - token registration)
- ✅ `src/aws/dynamodbClient.js` (updated - security warnings)

## Migration Status

- ✅ Notification creation service created
- ✅ Token registration service created and integrated
- ✅ IAM credential warnings added
- ✅ Console logging optimized (new services use logger pattern)
- ⏳ Admin UI integration (pending - notification UI location to be determined)

When admin notification UI is found, replace Firebase calls with `notificationsAwsService.createNotification()`.

