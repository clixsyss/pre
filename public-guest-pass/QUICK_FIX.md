# Quick Fix for "Access Denied" Error

If you're seeing an "Access Denied" XML error when accessing the guest pass page, follow these steps:

## Step 1: Fix S3 Bucket Permissions

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/pre/public-guest-pass
./fix-s3-permissions.sh
```

This will:
- Set bucket policy for public read access
- Enable static website hosting
- Upload index.html if it exists

## Step 2: Update CloudFront Origin

```bash
./update-cloudfront-origin.sh
```

This updates CloudFront to use the S3 website endpoint (`s3-website.amazonaws.com`) instead of the REST endpoint (`s3.amazonaws.com`), which is required for public access.

## Step 3: Wait for Propagation

CloudFront changes take **15-20 minutes** to propagate globally. You can check status:

```bash
aws cloudfront get-distribution --id E1UX9U7YH4I7MA --query 'Distribution.Status'
```

When status is `Deployed`, the changes are live.

## Step 4: Invalidate Cache (Optional)

If you want to force immediate cache refresh:

```bash
aws cloudfront create-invalidation --distribution-id E1UX9U7YH4I7MA --paths "/*"
```

## Still Not Working?

1. **Check Account-Level Public Access Block:**
   - Go to AWS Console → S3 → Block Public Access settings
   - If account-level blocking is enabled, you may need admin access to disable it
   - This is separate from bucket-level settings

2. **Verify Bucket Policy:**
   ```bash
   aws s3api get-bucket-policy --bucket pre-group-guest-pass
   ```
   Should show a policy allowing `s3:GetObject` for `Principal: "*"`

3. **Test S3 Website Endpoint Directly:**
   ```bash
   curl https://pre-group-guest-pass.s3-website-us-east-1.amazonaws.com
   ```
   If this works but CloudFront doesn't, wait for CloudFront propagation.

4. **Check CloudFront Origin:**
   ```bash
   aws cloudfront get-distribution --id E1UX9U7YH4I7MA --query 'Distribution.DistributionConfig.Origins.Items[0].DomainName'
   ```
   Should be: `pre-group-guest-pass.s3-website-us-east-1.amazonaws.com`

## Current Configuration

- **Bucket:** `pre-group-guest-pass`
- **CloudFront Distribution ID:** `E1UX9U7YH4I7MA`
- **CloudFront URL:** `https://d2zx7ipkeb051a.cloudfront.net`
- **API Gateway URL:** `https://e7o3k0a160.execute-api.us-east-1.amazonaws.com/prod`

🏘️ *PRE Group - Guest Pass*

Dear Test,

You have been invited as a guest to PRE Group community.

📋 *Pass Details:*
👤 Guest: Test
📅 Valid Until: Wednesday, December 31, 2025 at 10:58 PM
🎯 Purpose: Guest Visit

🔗 *Your Guest Pass:*
https://d2zx7ipkeb051a.cloudfront.net/#/guest-pass/BiHENuiMdDrivwbPccNE/GP-1767207520944-IO64E

✅ *Instructions:*
Open the link above to view your QR code. Present the QR code at the main gate for entry. The security team will scan it for verification.

Thank you for visiting PRE Group! 🌟

_This is an automated message from PRE Group Management System._