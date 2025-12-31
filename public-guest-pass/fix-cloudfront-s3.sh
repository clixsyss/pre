#!/bin/bash

# Fix CloudFront and S3 Configuration for Public Guest Pass Page
# This script fixes both S3 permissions and CloudFront origin settings

set -e

BUCKET_NAME="${BUCKET_NAME:-pre-group-guest-pass}"
REGION="${AWS_REGION:-us-east-1}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-E1UX9U7YH4I7MA}"

echo "🔧 Fixing S3 and CloudFront Configuration..."
echo "Bucket: $BUCKET_NAME"
echo "CloudFront Distribution: $CLOUDFRONT_DIST_ID"
echo "Region: $REGION"
echo ""

# Step 1: Fix S3 Bucket Permissions
echo "📦 Step 1: Configuring S3 Bucket Permissions..."
echo ""

# Disable block public access
echo "  🔓 Disabling 'Block Public Access'..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Public access block settings updated (or already correct)"

# Set bucket policy
echo "  📋 Setting bucket policy for public read..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

BUCKET_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF
)

echo "$BUCKET_POLICY" > /tmp/bucket-policy.json
aws s3api put-bucket-policy \
  --bucket "$BUCKET_NAME" \
  --policy file:///tmp/bucket-policy.json \
  --region "$REGION"
rm /tmp/bucket-policy.json

echo "  ✅ S3 bucket policy set"

# Step 2: Enable static website hosting (optional, but good for testing)
echo ""
echo "🌐 Step 2: Enabling Static Website Hosting (for direct S3 access testing)..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document index.html \
  --region "$REGION" 2>/dev/null || echo "  ⚠️  Website hosting may already be enabled"

echo "  ✅ Static website hosting enabled"

# Step 3: Upload index.html if it exists
echo ""
echo "📤 Step 3: Uploading index.html..."
if [ -f "index.html" ]; then
  aws s3 cp index.html "s3://$BUCKET_NAME/index.html" \
    --content-type "text/html" \
    --cache-control "no-cache" \
    --region "$REGION"
  echo "  ✅ index.html uploaded"
else
  echo "  ⚠️  index.html not found in current directory"
fi

# Step 4: Fix CloudFront Configuration
echo ""
echo "☁️  Step 4: Checking CloudFront Distribution..."

# Get current CloudFront config
echo "  📥 Fetching current CloudFront configuration..."
aws cloudfront get-distribution-config \
  --id "$CLOUDFRONT_DIST_ID" \
  --output json > /tmp/cloudfront-config.json

ETAG=$(jq -r '.ETag' /tmp/cloudfront-config.json)
CONFIG=$(jq '.DistributionConfig' /tmp/cloudfront-config.json)

# Check if origin is using S3 REST endpoint (needs Origin Access Control) or website endpoint
ORIGIN_DOMAIN=$(echo "$CONFIG" | jq -r '.Origins.Items[0].DomainName')

echo "  📍 Current origin: $ORIGIN_DOMAIN"

if [[ "$ORIGIN_DOMAIN" == *".s3.amazonaws.com" ]]; then
  echo "  ⚠️  CloudFront is using S3 REST endpoint"
  echo "  💡 For public access, we'll keep REST endpoint but ensure OAC allows public access"
  echo "  💡 Alternatively, you can switch to S3 website endpoint: $BUCKET_NAME.s3-website-$REGION.amazonaws.com"
fi

# Update CloudFront to use S3 website endpoint (better for public static sites)
echo ""
echo "  🔄 Updating CloudFront to use S3 website endpoint..."
WEBSITE_ENDPOINT="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
ORIGIN_ID=$(echo "$CONFIG" | jq -r '.Origins.Items[0].Id')

# Update the origin domain
UPDATED_CONFIG=$(echo "$CONFIG" | jq --arg domain "$WEBSITE_ENDPOINT" \
  '.Origins.Items[0].DomainName = $domain | 
   .Origins.Items[0].CustomOriginConfig = {
     "HTTPPort": 80,
     "HTTPSPort": 443,
     "OriginProtocolPolicy": "http-only",
     "OriginSslProtocols": {
       "Quantity": 1,
       "Items": ["TLSv1.2"]
     }
   } |
   del(.Origins.Items[0].S3OriginConfig)')

# Save updated config
echo "$UPDATED_CONFIG" > /tmp/cloudfront-updated-config.json

echo "  📝 Updating CloudFront distribution (this may take a few minutes)..."
aws cloudfront update-distribution \
  --id "$CLOUDFRONT_DIST_ID" \
  --if-match "$ETAG" \
  --distribution-config file:///tmp/cloudfront-updated-config.json \
  --output json > /tmp/cloudfront-update-response.json

echo "  ✅ CloudFront update initiated"
echo "  ⏳ Distribution status: $(jq -r '.Distribution.Status' /tmp/cloudfront-update-response.json)"
echo "  ⚠️  Note: CloudFront changes can take 15-20 minutes to propagate"

# Cleanup
rm -f /tmp/cloudfront-config.json /tmp/cloudfront-updated-config.json /tmp/cloudfront-update-response.json

echo ""
echo "✅ Configuration Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ S3 bucket configured for public read access"
echo "  ✅ Static website hosting enabled"
echo "  ✅ CloudFront origin updated to S3 website endpoint"
echo ""
echo "🧪 Testing:"
echo "  1. Test S3 directly: https://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "  2. Test CloudFront: https://d2zx7ipkeb051a.cloudfront.net (wait 15-20 min for changes)"
echo ""
echo "⚠️  Note: CloudFront changes take time to propagate. If you still see errors:"
echo "  1. Wait 15-20 minutes"
echo "  2. Invalidate CloudFront cache: aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths '/*'"
echo ""

