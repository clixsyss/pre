#!/bin/bash

# Fix S3 Bucket Permissions for Public Guest Pass Page
# This script configures the S3 bucket to allow public read access

set -e

BUCKET_NAME="${BUCKET_NAME:-pre-group-guest-pass}"
REGION="${AWS_REGION:-us-east-1}"

echo "🔧 Fixing S3 Bucket Permissions for Public Access..."
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if bucket exists
if ! aws s3 ls "s3://$BUCKET_NAME" >/dev/null 2>&1; then
  echo "📦 Bucket does not exist. Creating it..."
  aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
  echo "✅ Bucket created!"
else
  echo "✅ Bucket exists: $BUCKET_NAME"
fi

echo ""
echo "🔓 Step 1: Disabling 'Block Public Access' settings..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region "$REGION" || echo "⚠️  Note: Some settings may already be configured"

echo "✅ Public access block disabled"

echo ""
echo "🌐 Step 2: Enabling Static Website Hosting..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document index.html \
  --region "$REGION"

echo "✅ Static website hosting enabled"

echo ""
echo "📋 Step 3: Setting Bucket Policy for Public Read Access..."

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

echo "✅ Bucket policy set for public read access"

echo ""
echo "📤 Step 4: Uploading index.html (if it exists)..."
if [ -f "index.html" ]; then
  aws s3 cp index.html "s3://$BUCKET_NAME/index.html" \
    --content-type "text/html" \
    --region "$REGION"
  echo "✅ index.html uploaded"
else
  echo "⚠️  index.html not found in current directory"
  echo "   Upload it manually: aws s3 cp index.html s3://$BUCKET_NAME/index.html"
fi

echo ""
echo "✅ S3 Bucket Configuration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Get your S3 website endpoint:"
echo "   aws s3api get-bucket-website --bucket $BUCKET_NAME --region $REGION"
echo ""
echo "2. Update CloudFront distribution origin to use S3 website endpoint:"
echo "   Origin: $BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   (NOT: $BUCKET_NAME.s3.amazonaws.com)"
echo ""
echo "3. Test access:"
echo "   https://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""

