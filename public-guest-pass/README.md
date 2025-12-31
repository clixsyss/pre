# Public Guest Pass Page - AWS Hosting

This standalone HTML page displays guest passes for public viewing. It's designed to be hosted on AWS (S3 + CloudFront) and calls an AWS API Gateway endpoint to fetch pass data from DynamoDB.

## Architecture

- **Frontend**: Static HTML page (this file)
- **Backend**: AWS Lambda + API Gateway
- **Database**: DynamoDB (`projects__guestPasses` table)
- **Storage**: S3 for QR code images

## Setup Instructions

### 1. Deploy Lambda Function

See `/lambda/getGuestPass/README.md` for Lambda deployment instructions.

### 2. Create API Gateway Endpoint

1. Create REST API in API Gateway
2. Create resource: `/guest-pass/{projectId}/{passId}`
3. Create GET method pointing to Lambda function
4. Enable CORS
5. Deploy to stage (e.g., `prod`)
6. Get your API Gateway URL (e.g., `https://xxxxx.execute-api.us-east-1.amazonaws.com/prod`)

### 3. Update API URL in HTML

Before deploying, update the API URL in `index.html`:

```javascript
const API_BASE_URL = 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod';
```

Or use a build script to inject the URL during deployment.

### 4. Host on AWS

#### Option A: S3 + CloudFront (Recommended)

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://pre-group-guest-pass --region us-east-1
   ```

2. **Enable Static Website Hosting:**
   - S3 Console → Bucket → Properties → Static website hosting
   - Index document: `index.html`
   - Error document: `index.html` (for SPA routing)

3. **Set Bucket Policy (Public Read):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::pre-group-guest-pass/*"
       }
     ]
   }
   ```

4. **Upload HTML:**
   ```bash
   aws s3 cp index.html s3://pre-group-guest-pass/index.html
   ```

5. **Create CloudFront Distribution:**
   - Origin: S3 bucket website endpoint
   - Default root object: `index.html`
   - Custom error responses: 404 → 200 → `index.html` (for routing)

6. **Get CloudFront URL:**
   After deployment: `https://dxxxxxxxxxxxxx.cloudfront.net`

#### Option B: AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Upload this folder or connect Git repo
4. Get Amplify URL: `https://main.xxxxx.amplifyapp.com`

### 5. Update Sharing Service

Update `src/services/whatsappService.js` to use your AWS-hosted URL:

```javascript
const baseUrl = 'https://dxxxxxxxxxxxxx.cloudfront.net'; // Your CloudFront URL
// or
const baseUrl = 'https://main.xxxxx.amplifyapp.com'; // Your Amplify URL
```

Or set environment variable:
```env
VITE_GUEST_PASS_BASE_URL=https://your-aws-url.cloudfront.net
```

## URL Formats Supported

The page supports both URL formats:

1. **Hash format:** `https://your-domain.com/#/guest-pass/{projectId}/{passId}`
2. **Path format:** `https://your-domain.com/guest-pass/{projectId}/{passId}`

## Features

- ✅ Fetches pass data from DynamoDB via AWS API Gateway
- ✅ Displays QR code from S3 (not Firebase)
- ✅ Shows pass status (Active, Expired, Used)
- ✅ Responsive design
- ✅ CORS-enabled for public access
- ✅ No authentication required (public endpoint)

## Troubleshooting

### "Access Denied" Error from CloudFront

If you see an XML error with "Access Denied":

1. **Check S3 Bucket Permissions:**
   ```bash
   cd /Users/hady/Documents/Work/ClixSys/Projects/pre/public-guest-pass
   ./fix-s3-permissions.sh
   ```

2. **Update CloudFront Origin:**
   ```bash
   ./update-cloudfront-origin.sh
   ```
   This updates CloudFront to use the S3 website endpoint instead of the REST endpoint.

3. **Wait for Propagation:**
   CloudFront changes take 15-20 minutes to propagate globally.

4. **Check Account-Level Public Access Block:**
   If still not working, check AWS account-level S3 public access settings:
   - AWS Console → S3 → Block Public Access settings for this account
   - May need admin access to change account-level settings

5. **Invalidate CloudFront Cache:**
   ```bash
   aws cloudfront create-invalidation --distribution-id E1UX9U7YH4I7MA --paths "/*"
   ```

### "Pass Not Found" Error

1. Check Lambda function logs in CloudWatch
2. Verify DynamoDB table name matches `GUEST_PASSES_TABLE` environment variable
3. Verify pass exists in DynamoDB with correct `parentId` and `id`
4. Check API Gateway endpoint is correctly configured

### CORS Errors

1. Ensure API Gateway has CORS enabled
2. Check Lambda function returns CORS headers
3. Verify CloudFront/S3 allows CORS if needed

### QR Code Not Loading

1. Verify QR code URL is from S3 (not Firebase)
2. Check S3 bucket permissions (public read)
3. Verify CloudFront distribution includes S3 bucket

🏘️ *PRE Group - Guest Pass*

Dear Testt,

You have been invited as a guest to PRE Group community.

📋 *Pass Details:*
👤 Guest: Testt
📅 Valid Until: Wednesday, December 31, 2025 at 10:22 PM
🎯 Purpose: Guest Visit

🔗 *Your Guest Pass:*
https://d2zx7ipkeb051a.cloudfront.net/#/guest-pass/BiHENuiMdDrivwbPccNE/GP-1767205343714-2B0MK

✅ *Instructions:*
Open the link above to view your QR code. Present the QR code at the main gate for entry. The security team will scan it for verification.

Thank you for visiting PRE Group! 🌟

_This is an automated message from PRE Group Management System._