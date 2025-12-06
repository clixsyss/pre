# S3 Upload Credentials Setup

## Problem
Files are still uploading to Firebase because S3 uploads are failing due to missing AWS credentials.

## Solution Options

### Option 1: Environment Variables (Quickest for Development)

Create a `.env` file in the project root with your AWS credentials:

```env
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
VITE_AWS_REGION=us-east-1
```

**Important**: 
- Restart your dev server after adding these
- Never commit `.env` to git (add to `.gitignore`)
- These credentials will be visible in the browser (only use for development)

### Option 2: Cognito Identity Pool (Recommended for Production)

1. **Create Cognito Identity Pool** in AWS Console:
   - Go to AWS Cognito → Identity Pools
   - Create new identity pool
   - Name: `pre-app-identity-pool`
   - Enable "Enable access to unauthenticated identities" (for sign-up)
   - Note the Identity Pool ID (format: `us-east-1:xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

2. **Configure IAM Roles**:
   - Authenticated role: Allow S3 PutObject, GetObject, DeleteObject on `pre-app-user-images/users/*`
   - Unauthenticated role: Allow S3 PutObject, GetObject, DeleteObject on `pre-app-user-images/users/*`

3. **Update Amplify Config** in `src/boot/amplify.js`:
   ```javascript
   Amplify.configure({
     Auth: {
       region: 'us-east-1',
       userPoolId: 'us-east-1_vuhaTK66l',
       userPoolWebClientId: 'abst7l599fa2fnp0aq6a87lud',
       authenticationFlowType: 'USER_PASSWORD_AUTH',
     },
     aws_project_region: 'us-east-1',
     aws_cognito_identity_pool_id: 'us-east-1:YOUR_IDENTITY_POOL_ID', // Add this
     aws_cognito_region: 'us-east-1',
   })
   ```

### Option 3: Backend API (Most Secure)

Create a backend API endpoint that handles S3 uploads using server-side credentials.

## IAM Policy for S3 Bucket

The IAM role needs these permissions:

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

## Testing

After setting up credentials:
1. Clear browser cache
2. Restart dev server
3. Try signing up a new user
4. Check browser console for S3 upload logs
5. Verify files appear in S3 bucket: `s3://pre-app-user-images/users/{userId}/`

