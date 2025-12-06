# S3 Upload Migration - User Documents

## ✅ What Was Changed

The user document upload system has been migrated from **Firebase Storage** to **AWS S3**.

### Files Modified
- `src/services/fileUploadService.js` - Complete rewrite to use S3 instead of Firebase

### Dependencies Added
- `@aws-sdk/client-s3` - AWS S3 client for file uploads

---

## 📍 S3 Configuration

### Bucket Details
- **Bucket Name**: `pre-app-user-images`
- **Region**: `us-east-1` (default, configurable via environment variables)
- **Path Structure**: `users/{userId}/`

### File Naming Convention
Each user's folder contains:
- `national-id-front.{ext}` - Front National ID image
- `national-id-back.{ext}` - Back National ID image  
- `profile-picture.{ext}` - Profile picture

### Example S3 Paths
```
s3://pre-app-user-images/users/user123/national-id-front.jpg
s3://pre-app-user-images/users/user123/national-id-back.jpg
s3://pre-app-user-images/users/user123/profile-picture.jpg
```

### Generated URLs
Files are accessible via:
```
https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/{userId}/national-id-front.jpg
https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/{userId}/national-id-back.jpg
https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/{userId}/profile-picture.jpg
```

---

## 🔧 Implementation Details

### S3 Client Initialization
The service uses AWS SDK v3 with automatic credential resolution:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. IAM roles (if running on EC2/Lambda)
3. AWS credentials file (`~/.aws/credentials`)
4. Cognito Identity Pool (if configured)

### Upload Flow
1. **File Validation**: Checks file type (JPEG, PNG, WebP) and size (max 10MB)
2. **S3 Upload**: Uses `PutObjectCommand` to upload to S3
3. **URL Generation**: Returns public S3 URL for the uploaded file

### Platform Support
- ✅ **Web**: Uses AWS SDK directly
- ✅ **iOS**: Uses AWS SDK (works with Capacitor)
- ✅ **Android**: Uses AWS SDK (works with Capacitor)

---

## 🔐 AWS Credentials Setup

### Option 1: Environment Variables (Development/Server)
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

Or in `.env` file:
```
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_REGION=us-east-1
```

### Option 2: Cognito Identity Pool (Recommended for Production)
For browser/client-side usage, set up a Cognito Identity Pool:

1. **Create Cognito Identity Pool** in AWS Console
2. **Configure IAM Roles** with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::pre-app-user-images/users/*"
       }
     ]
   }
   ```
3. **Update Amplify Config** in `src/boot/amplify.js`:
   ```javascript
   Amplify.configure({
     Auth: { /* existing config */ },
     aws_cognito_identity_pool_id: 'us-east-1:xxxxx',
     aws_cognito_region: 'us-east-1',
   })
   ```

---

## 📝 Usage

### During Sign Up
The `uploadUserDocuments` method is called automatically during registration in `PersonalDetails.vue`:

```javascript
const uploadedDocuments = await fileUploadService.uploadUserDocuments(
  userId,
  frontIdFile.value,
  backIdFile.value,
  profilePictureFile.value
)
```

### Result
Returns an object with S3 URLs:
```javascript
{
  frontId: "https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/user123/national-id-front.jpg",
  backId: "https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/user123/national-id-back.jpg",
  profilePicture: "https://pre-app-user-images.s3.us-east-1.amazonaws.com/users/user123/profile-picture.jpg"
}
```

---

## 🔄 Migration Notes

### Existing Firebase URLs
- Existing users with Firebase Storage URLs will continue to work
- New uploads will use S3 URLs
- Consider migrating existing files if needed

### Database Storage
- URLs are stored in DynamoDB `users` table under `documents` field:
  ```json
  {
    "documents": {
      "frontIdUrl": "https://...",
      "backIdUrl": "https://...",
      "profilePictureUrl": "https://..."
    }
  }
  ```

### No Component Changes Required
- Components display URLs directly (no changes needed)
- `ProfilePage.vue`, `EditProfileDialog.vue` work with both Firebase and S3 URLs

---

## 🛠️ S3 Bucket Setup

### Required Bucket Configuration

1. **Create S3 Bucket**: `pre-app-user-images` in `us-east-1`

2. **Bucket Policy** (for public read access):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::pre-app-user-images/*"
       }
     ]
   }
   ```

3. **CORS Configuration** (if needed for web uploads):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

4. **Block Public ACLs**: Disable if you want public read access

---

## ✅ Testing Checklist

- [ ] S3 bucket `pre-app-user-images` exists
- [ ] AWS credentials configured (env vars or Cognito Identity Pool)
- [ ] Test sign up flow with image uploads
- [ ] Verify files appear in S3: `s3://pre-app-user-images/users/{userId}/`
- [ ] Verify URLs are accessible and images display correctly
- [ ] Test on web platform
- [ ] Test on iOS (if applicable)
- [ ] Test on Android (if applicable)

---

## 🐛 Troubleshooting

### Upload Fails with "Access Denied"
- Check AWS credentials are configured correctly
- Verify IAM role has `s3:PutObject` permission
- Check bucket policy allows uploads

### Files Not Accessible
- Verify bucket policy allows public read (or use signed URLs)
- Check CORS configuration if uploading from browser
- Verify S3 URLs are correctly formatted

### Credentials Not Found
- For browser: Set up Cognito Identity Pool
- For server: Set environment variables
- Check AWS SDK credential provider chain

---

## 📚 Related Files

- `src/services/fileUploadService.js` - Main upload service
- `src/pages/unauth/PersonalDetails.vue` - Sign up form
- `src/components/EditProfileDialog.vue` - Profile picture update
- `src/boot/amplify.js` - AWS/Amplify configuration

---

**Migration Complete** ✅

All user document uploads (National ID front/back and profile pictures) now use AWS S3 instead of Firebase Storage.

