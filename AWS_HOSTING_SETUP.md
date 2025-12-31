# AWS Hosting Setup for Guest Pass Page

## Overview

The guest pass public viewing page needs to be hosted on AWS instead of Firebase. This guide covers setting up AWS hosting for the Quasar SPA.

## Option 1: AWS Amplify Hosting (Recommended)

AWS Amplify Hosting is the easiest way to host a Quasar SPA on AWS.

### Steps:

1. **Build the Quasar app:**
   ```bash
   cd /Users/hady/Documents/Work/ClixSys/Projects/pre
   quasar build
   ```

2. **Install AWS Amplify CLI:**
   ```bash
   npm install -g @aws-amplify/cli
   ```

3. **Initialize Amplify:**
   ```bash
   amplify init
   ```
   - Choose your AWS profile
   - Select region (e.g., `us-east-1`)
   - Choose "Hosting with Amplify Console"

4. **Add hosting:**
   ```bash
   amplify add hosting
   ```
   - Choose "Hosting with Amplify Console"
   - Select "Manual deploy"

5. **Deploy:**
   ```bash
   amplify publish
   ```

6. **Get your Amplify URL:**
   After deployment, Amplify will provide a URL like:
   `https://main.xxxxxxxxxxxx.amplifyapp.com`

7. **Set environment variable:**
   Add to your `.env` file:
   ```env
   VITE_GUEST_PASS_BASE_URL=https://main.xxxxxxxxxxxx.amplifyapp.com
   ```

## Option 2: S3 + CloudFront (More Control)

For more control and custom domain support.

### Steps:

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://pre-group-guest-pass --region us-east-1
   ```

2. **Enable Static Website Hosting:**
   - Go to S3 Console → Your bucket → Properties
   - Enable "Static website hosting"
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

3. **Set Bucket Policy (Public Read):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::pre-group-guest-pass/*"
       }
     ]
   }
   ```

4. **Build and Upload:**
   ```bash
   quasar build
   aws s3 sync dist/spa s3://pre-group-guest-pass --delete
   ```

5. **Create CloudFront Distribution:**
   - Origin: S3 bucket (or S3 website endpoint)
   - Default root object: `index.html`
   - Error pages: Return `index.html` for 404 (for SPA routing)

6. **Get CloudFront URL:**
   After deployment, CloudFront will provide a URL like:
   `https://dxxxxxxxxxxxxx.cloudfront.net`

7. **Set environment variable:**
   Add to your `.env` file:
   ```env
   VITE_GUEST_PASS_BASE_URL=https://dxxxxxxxxxxxxx.cloudfront.net
   ```

## Option 3: AWS Amplify Console (Web UI)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist/spa
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Deploy and get your URL
6. Set environment variable in Amplify Console → App settings → Environment variables:
   ```
   VITE_GUEST_PASS_BASE_URL=https://your-amplify-url.amplifyapp.com
   ```

## Environment Variable Configuration

After setting up AWS hosting, add the base URL to your environment:

### For Local Development (.env file):
```env
VITE_GUEST_PASS_BASE_URL=https://your-aws-url.amplifyapp.com
```

### For Production:
- **Amplify Console**: Add in App settings → Environment variables
- **S3/CloudFront**: Set in your deployment script or CI/CD pipeline

## Custom Domain (Optional)

### With Amplify:
1. Go to Amplify Console → App → Domain management
2. Add your custom domain
3. Follow DNS setup instructions

### With CloudFront:
1. Request SSL certificate in AWS Certificate Manager
2. Add alternate domain name in CloudFront distribution
3. Update DNS records to point to CloudFront

## Testing

After deployment:
1. Generate a new guest pass
2. Check the shared link - it should use your AWS URL
3. Verify the guest pass page loads correctly
4. Confirm QR code displays from S3

## Public Guest Pass Page Hosting

The standalone `public-guest-pass/index.html` page needs to be hosted separately. This page calls an AWS API Gateway endpoint to fetch pass data.

### Quick Setup:

1. **Deploy Lambda Function:**
   ```bash
   cd /Users/hady/Documents/Work/ClixSys/Projects/pre-dashboard-test/lambda/getGuestPass
   ./deploy.sh
   ```

2. **Create API Gateway Endpoint:**
   - Create REST API
   - Resource: `/guest-pass/{projectId}/{passId}`
   - GET method → Lambda: `production-get-guest-pass`
   - Enable CORS
   - Deploy to `prod` stage

3. **Update HTML with API URL:**
   In `public-guest-pass/index.html`, set:
   ```javascript
   const API_BASE_URL = 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod';
   ```

4. **Host HTML on S3/CloudFront:**
   ```bash
   aws s3 cp public-guest-pass/index.html s3://pre-group-guest-pass/index.html
   # Then create CloudFront distribution
   ```

5. **Update Sharing Service:**
   Set `VITE_GUEST_PASS_BASE_URL` to your CloudFront/Amplify URL

See `public-guest-pass/README.md` for detailed instructions.

## Migration Notes

- Old passes shared before migration will still have Firebase URLs
- New passes will use AWS URLs
- Both URLs will work during the transition period
- Consider redirecting Firebase URLs to AWS if needed

## Troubleshooting

### SPA Routing Issues:
- Ensure error pages return `index.html` for 404 errors
- CloudFront: Add custom error response (404 → 200 → index.html)
- Amplify: Configure redirects/rewrites for SPA

### CORS Issues:
- Ensure S3 bucket CORS policy allows your app domain
- CloudFront: Configure CORS headers in response headers policy

### Environment Variables Not Working:
- Restart dev server after adding `.env` variables
- Ensure variables are prefixed with `VITE_`
- Check that variables are available in `import.meta.env`

