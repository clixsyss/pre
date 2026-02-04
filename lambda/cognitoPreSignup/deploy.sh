#!/usr/bin/env bash
# Deploy Cognito Pre sign-up Lambda and attach to User Pool us-east-1_vuhaTK66l (rvfwv6)
set -e

REGION="${AWS_REGION:-us-east-1}"
USER_POOL_ID="${USER_POOL_ID:-us-east-1_vuhaTK66l}"
FUNCTION_NAME="${FUNCTION_NAME:-pre-cognito-pre-signup}"
ROLE_NAME="${LAMBDA_ROLE_NAME:-pre-cognito-pre-signup-role}"
RUNTIME="nodejs20.x"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP_PATH="${SCRIPT_DIR}/deploy.zip"

echo "==> Packaging Lambda (handler.js)..."
(cd "$SCRIPT_DIR" && zip -q -r "$ZIP_PATH" handler.js)

echo "==> Getting AWS account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)
if [ -z "$ACCOUNT_ID" ]; then
  echo "Error: AWS CLI not configured or no credentials. Run: aws configure"
  exit 1
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# Ensure Lambda execution role exists (for first-time deploy)
if ! aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
  echo "==> Creating IAM role for Lambda (if missing)..."
  if ! aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
    aws iam create-role \
      --role-name "$ROLE_NAME" \
      --assume-role-policy-document "file://${SCRIPT_DIR}/trust-policy.json" \
      --description "Lambda execution role for PRE Cognito Pre sign-up"
    aws iam attach-role-policy \
      --role-name "$ROLE_NAME" \
      --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    echo "    Role created. Waiting 10s for IAM propagation..."
    sleep 10
  else
    echo "    Role already exists."
  fi
fi

echo "==> Creating or updating Lambda function: $FUNCTION_NAME (region: $REGION)..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://${ZIP_PATH}" \
    --region "$REGION"
  echo "    Updated existing function."
else
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "$RUNTIME" \
    --handler "handler.handler" \
    --role "$ROLE_ARN" \
    --zip-file "fileb://${ZIP_PATH}" \
    --region "$REGION" \
    --description "Cognito Pre sign-up: auto-verify email and confirm user for PRE user pool (rvfwv6)"
  echo "    Created new function."
fi

echo "==> Allowing Cognito to invoke the Lambda..."
aws lambda add-permission \
  --function-name "$FUNCTION_NAME" \
  --statement-id "CognitoInvoke-PreSignUp" \
  --action "lambda:InvokeFunction" \
  --principal "cognito-idp.amazonaws.com" \
  --source-arn "arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID}" \
  --region "$REGION" 2>/dev/null || echo "    (Permission may already exist, continuing.)"

echo "==> Attaching Lambda to User Pool $USER_POOL_ID as Pre sign-up trigger..."
aws cognito-idp update-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --lambda-config "PreSignUp=$FUNCTION_ARN" \
  --region "$REGION"

echo ""
echo "Done. Pre sign-up trigger is now set for user pool $USER_POOL_ID (rvfwv6)."
echo "New sign-ups will have email auto-verified and can use Forgot password."

# Cleanup
rm -f "$ZIP_PATH"
