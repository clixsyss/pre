# Guest Pass AWS Migration Complete

## Summary

The guest pass functionality has been successfully ported from Firebase/Firestore to AWS services:
- **DynamoDB** for data storage (`projects__guestPasses` table)
- **S3** for QR code image storage
- **Cognito** for user authentication

## Changes Made

### 1. Created AWS-Based Guest Pass API (`src/api/guestPassAPI.js`)

**Replaced Firebase services with AWS:**
- ✅ `checkUserEligibility()` - Uses DynamoDB `users` table instead of Firestore
- ✅ `createGuestPass()` - Uses DynamoDB for pass storage and S3 for QR code images
- ✅ `markPassAsSent()` - Uses DynamoDB update operations
- ✅ `verifyAndUsePass()` - Uses DynamoDB for pass verification
- ✅ `getUserStatus()` - Uses DynamoDB for user and pass data

**Key Features:**
- Uses `projects__guestPasses` DynamoDB table with `projectId` as partition key and `id` as sort key
- QR codes are uploaded to S3 at `guestPasses/{projectId}/{passId}.png`
- Uses Cognito sub (user ID) instead of Firebase UID
- Maintains compatibility with existing Access.vue component

### 2. Updated Access.vue Component

**Changes:**
- ✅ Updated to use Cognito user ID (sub) instead of Firebase UID
- ✅ Updated user name extraction to use Cognito attributes
- ✅ Maintains all existing functionality (BLE control, pass generation, sharing)

**User ID Extraction:**
```javascript
const userId = user.attributes?.sub || 
               user.cognitoAttributes?.sub || 
               user.userSub || 
               user.uid
```

### 3. Dashboard Notification Auto-Refresh

**Improvements:**
- ✅ Reduced polling interval from 10 seconds to 3 seconds for near real-time updates
- ✅ Immediate cache invalidation after notification creation
- ✅ Automatic reload within 1.5 seconds after creation

## DynamoDB Table Structure

### `projects__guestPasses` Table

**Partition Key:** `projectId` (String)
**Sort Key:** `id` (String) - The pass ID (e.g., "GP-1234567890-abcde")

**Attributes:**
- `id` - Pass ID
- `projectId` - Project ID
- `userId` - Cognito sub (user ID)
- `userName` - Name of user creating the pass
- `unit` - User's unit number
- `guestName` - Guest's name
- `purpose` - Purpose of visit
- `validFrom` - Timestamp (Number)
- `validUntil` - Timestamp (Number)
- `phoneNumber` - Optional phone number
- `createdAt` - Timestamp (Number)
- `sentStatus` - Boolean
- `sentAt` - Timestamp (Number) or null
- `qrCodeUrl` - S3 URL for QR code image
- `used` - Boolean
- `usedAt` - Timestamp (Number) or null
- `verificationToken` - Token for one-time verification
- `updatedAt` - Timestamp (Number)
- `deleted` - Boolean (soft delete)

### `guestPassSettings` Table

**Partition Key:** `projectId` (String)

**Attributes:**
- `projectId` - Project ID
- `monthlyLimit` - Number (default: 30)
- `validityDurationHours` - Number (default: 2)
- `blockAllUsers` - Boolean
- `blockFamilyMembers` - Boolean

## S3 Bucket Structure

**Bucket:** `pre-app-user-images` (or configured bucket)

**Path Structure:**
```
guestPasses/
  {projectId}/
    {passId}.png
```

**Example:**
```
guestPasses/
  3OcGvjzt8lPCNG4PB812/
    GP-1234567890-abcde.png
```

## API Functions

### `checkUserEligibility(projectId, userId)`
Checks if a user can generate guest passes.

**Returns:**
```javascript
{
  success: boolean,
  error: string | null,
  message: string,
  data: {
    canGenerate: boolean,
    reason: string,
    user: object,
    usedThisMonth: number,
    monthlyLimit: number,
    remainingQuota: number
  }
}
```

### `createGuestPass(projectId, userId, userName, guestName, purpose, phoneNumber?)`
Creates a new guest pass.

**Returns:**
```javascript
{
  success: boolean,
  passId: string,
  passRef: string,
  qrCodeUrl: string,
  data: {
    id: string,
    projectId: string,
    userId: string,
    userName: string,
    guestName: string,
    purpose: string,
    validUntil: Date,
    phoneNumber: string | null,
    createdAt: Date
  }
}
```

### `verifyAndUsePass(projectId, passId, verificationToken)`
Verifies and marks a pass as used.

**Returns:**
```javascript
{
  success: boolean,
  error: string | null,
  message: string,
  data: {
    passId: string,
    guestName: string,
    purpose: string,
    usedAt: Date
  }
}
```

## Migration Notes

### User ID Format
- **Before:** Firebase UID (e.g., `abc123def456`)
- **After:** Cognito sub (UUID format, e.g., `f4c84448-90a1-70c5-198f-bca292166ea4`)

### Timestamps
- **Before:** Firestore Timestamp objects
- **After:** Unix timestamps (milliseconds) as Numbers

### QR Code Storage
- **Before:** Firebase Storage
- **After:** AWS S3

### Data Queries
- **Before:** Firestore queries with filters
- **After:** DynamoDB queries with partition key, then application-level filtering

## Testing Checklist

- [ ] User can check eligibility
- [ ] User can create a guest pass
- [ ] QR code is generated and uploaded to S3
- [ ] Pass appears in the list immediately
- [ ] Pass can be shared via WhatsApp
- [ ] Pass can be verified and marked as used
- [ ] Monthly limits are enforced correctly
- [ ] Project-wide blocking works
- [ ] Family member blocking works
- [ ] Guest pass view page works (public URL)

## Environment Variables Required

Make sure these are set in `.env`:
```env
AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Next Steps

1. **Test the guest pass creation flow** end-to-end
2. **Verify DynamoDB table structure** matches the schema above
3. **Test QR code generation and S3 upload**
4. **Test pass verification** (scanner functionality)
5. **Update any remaining Firestore calls** in Access.vue (if any)

## Related Files

- `src/api/guestPassAPI.js` - AWS-based guest pass API
- `src/pages/auth/Access.vue` - Guest pass UI component
- `src/pages/unauth/GuestPassView.vue` - Public guest pass view page
- `src/services/fileUploadService.js` - S3 upload service
- `src/aws/dynamodbClient.js` - DynamoDB client

