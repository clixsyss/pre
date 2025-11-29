# DynamoDB Integration for Projects

## Overview
This document describes the DynamoDB integration for the projects table that has been added to the application.

## What Was Done

### 1. Installed AWS SDK Dependencies
- `@aws-sdk/client-dynamodb` - Core DynamoDB client
- `@aws-sdk/lib-dynamodb` - Document client for easier data handling

### 2. Created Services

#### `src/services/dynamoDBService.js`
- Generic DynamoDB service that handles all DynamoDB operations
- Methods: `getItem`, `scan`, `query`, `putItem`, `updateItem`, `deleteItem`
- Uses AWS SDK v3 with automatic credential resolution

#### `src/services/projectsService.js`
- Project-specific service that uses DynamoDB service
- Methods: `getProject`, `getProjectsByIds`, `getAllProjects`, `queryProjects`
- Provides a clean interface for project operations

### 3. Updated Components

#### `src/stores/projectStore.js`
- Updated `fetchUserProjects()` to use DynamoDB first, with Firestore fallback
- Updated `fetchAvailableProjects()` to use DynamoDB first, with Firestore fallback
- Maintains backward compatibility with Firestore

#### `src/composables/useAppData.js`
- Updated `useProjectsData()` to use DynamoDB first, with Firestore fallback

## DynamoDB Table Information

- **Table Name**: `projects`
- **Region**: `us-east-1`
- **ARN**: `arn:aws:dynamodb:us-east-1:530222925071:table/projects`

## Required Configuration

### 1. AWS Credentials
The DynamoDB client uses AWS SDK's default credential provider chain, which checks in this order:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. IAM roles (if running on EC2/Lambda)
3. AWS credentials file (`~/.aws/credentials`)
4. Amplify's credential provider (if configured with Identity Pool)

### 2. Cognito Identity Pool (Recommended)
For production, you should set up a Cognito Identity Pool to provide temporary AWS credentials to authenticated users:

1. Create a Cognito Identity Pool in AWS Console
2. Configure IAM roles for authenticated users with DynamoDB permissions
3. Update `src/boot/amplify.js` with:
   ```javascript
   aws_cognito_identity_pool_id: 'us-east-1:xxxxx',
   ```

### 3. IAM Permissions
The IAM role/user needs the following DynamoDB permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:530222925071:table/projects"
    }
  ]
}
```

## Table Schema Assumptions

The code assumes the following DynamoDB table structure:
- **Primary Key**: `id` (String)
- **Attributes**: Standard project fields (name, description, location, status, type, etc.)

If your table uses a different primary key name or structure, update `src/services/projectsService.js` accordingly.

## Fallback Behavior

The implementation includes automatic fallback to Firestore if:
- DynamoDB query fails
- Project not found in DynamoDB
- Credentials are not available

This ensures the app continues to work during migration.

## Testing

To test the integration:

1. Ensure AWS credentials are configured
2. Verify the `projects` table exists in DynamoDB
3. Check browser console for DynamoDB operation logs
4. Verify projects are loading from DynamoDB (check console logs)

## Next Steps

1. **Configure Cognito Identity Pool** for production use
2. **Verify table schema** matches the code assumptions
3. **Test with real data** to ensure compatibility
4. **Monitor performance** and adjust as needed
5. **Remove Firestore fallback** once DynamoDB is fully tested

## Troubleshooting

### "Failed to get AWS credentials"
- Ensure AWS credentials are configured (environment variables or IAM role)
- Check that user is authenticated with Cognito
- Verify Identity Pool is configured if using Amplify credentials

### "Access Denied" errors
- Check IAM permissions for DynamoDB
- Verify the table ARN matches your configuration
- Ensure the IAM role/user has access to the `projects` table

### Projects not loading
- Check browser console for errors
- Verify table name is correct (`projects`)
- Check that primary key field is `id`
- Ensure table has data

