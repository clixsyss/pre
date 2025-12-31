#!/bin/bash

# Update CloudFront Origin to Use S3 Website Endpoint
# This fixes the "Access Denied" error by using the public website endpoint

set -e

BUCKET_NAME="${BUCKET_NAME:-pre-group-guest-pass}"
REGION="${AWS_REGION:-us-east-1}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-E1UX9U7YH4I7MA}"

echo "☁️  Updating CloudFront Origin to S3 Website Endpoint..."
echo "Distribution ID: $CLOUDFRONT_DIST_ID"
echo "Bucket: $BUCKET_NAME"
echo ""

# Get current CloudFront config
echo "📥 Fetching current CloudFront configuration..."
aws cloudfront get-distribution-config \
  --id "$CLOUDFRONT_DIST_ID" \
  --output json > /tmp/cloudfront-config.json

ETAG=$(jq -r '.ETag' /tmp/cloudfront-config.json)
CONFIG=$(jq '.DistributionConfig' /tmp/cloudfront-config.json)

ORIGIN_ID=$(echo "$CONFIG" | jq -r '.Origins.Items[0].Id')
CURRENT_DOMAIN=$(echo "$CONFIG" | jq -r '.Origins.Items[0].DomainName')
WEBSITE_ENDPOINT="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "📍 Current origin: $CURRENT_DOMAIN"
echo "🔄 Updating to: $WEBSITE_ENDPOINT"
echo ""

# Update the origin to use S3 website endpoint
UPDATED_CONFIG=$(echo "$CONFIG" | jq --arg domain "$WEBSITE_ENDPOINT" \
  '.Origins.Items[0].DomainName = $domain | 
   .Origins.Items[0].CustomOriginConfig = {
     "HTTPPort": 80,
     "HTTPSPort": 443,
     "OriginProtocolPolicy": "http-only",
     "OriginSslProtocols": {
       "Quantity": 1,
       "Items": ["TLSv1.2"]
     },
     "OriginReadTimeout": 30,
     "OriginKeepaliveTimeout": 5
   } |
   del(.Origins.Items[0].S3OriginConfig) |
   del(.Origins.Items[0].OriginAccessControlId) |
   del(.Origins.Items[0].OriginAccessIdentity)')

# Save updated config
echo "$UPDATED_CONFIG" > /tmp/cloudfront-updated-config.json

echo "📝 Updating CloudFront distribution..."
echo "⏳ This may take a few minutes..."
aws cloudfront update-distribution \
  --id "$CLOUDFRONT_DIST_ID" \
  --if-match "$ETAG" \
  --distribution-config file:///tmp/cloudfront-updated-config.json \
  --output json > /tmp/cloudfront-update-response.json

STATUS=$(jq -r '.Distribution.Status' /tmp/cloudfront-update-response.json)
DIST_ARN=$(jq -r '.Distribution.ARN' /tmp/cloudfront-update-response.json)

echo ""
echo "✅ CloudFront update initiated!"
echo "   Status: $STATUS"
echo "   Distribution: $DIST_ARN"
echo ""
echo "⏳ CloudFront changes take 15-20 minutes to propagate globally."
echo ""
echo "🧪 After propagation, test:"
echo "   https://d2zx7ipkeb051a.cloudfront.net"
echo ""
echo "💡 To check status:"
echo "   aws cloudfront get-distribution --id $CLOUDFRONT_DIST_ID --query 'Distribution.Status'"
echo ""

# Cleanup
rm -f /tmp/cloudfront-config.json /tmp/cloudfront-updated-config.json /tmp/cloudfront-update-response.json

