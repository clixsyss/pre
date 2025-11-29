# DynamoDB Projects Integration Instructions

## ✅ Service Created

A new service has been created at:
**`src/services/dynamoDBProjectsService.js`**

This service handles all DynamoDB interactions for the projects table and requires **NO UI changes**.

## 📋 Main Function

The service exposes a single main function:

```javascript
import { getProjects } from '@/services/dynamoDBProjectsService'

const projects = await getProjects()
```

This function:
- ✅ Uses Amplify Auth to get authenticated AWS credentials from Cognito
- ✅ Creates a DynamoDB client using these credentials
- ✅ Fetches all items from the DynamoDB projects table using Scan operation
- ✅ Converts DynamoDB item structure to normal JavaScript objects
- ✅ Returns a clean JSON array of projects

## 🎯 Where to Use It

### Primary Location: `src/stores/projectStore.js`

**File**: `src/stores/projectStore.js`  
**Function**: `fetchAvailableProjects()`

This is the main place where projects are fetched for the application. Currently it uses Firestore, but you can replace it with the DynamoDB service.

**Current code location** (around line 180-212):
```javascript
const fetchAvailableProjects = async () => {
  // Currently uses firestoreService.getDocs('projects', ...)
  // Replace with: const projects = await getProjects()
}
```

### Secondary Location: `src/composables/useAppData.js`

**File**: `src/composables/useAppData.js`  
**Function**: `useProjectsData().fetchProjects()`

This composable is used throughout the app for cached project data.

**Current code location** (around line 136-186):
```javascript
const fetchProjects = async (forceRefresh = false) => {
  // Currently uses firestoreService.getDocs('projects', ...)
  // Replace with: const projects = await getProjects()
}
```

### Other Potential Locations:

1. **`src/pages/unauth/Register.vue`** (line ~600)
   - Fetches projects during registration
   - Currently uses Capacitor Firebase Firestore

2. **`src/pages/unauth/SignIn.vue`** (line ~385)
   - Loads projects for sign-in flow

## 🔧 How to Integrate

### Step 1: Import the Service

Add this import at the top of the file:

```javascript
import { getProjects } from '@/services/dynamoDBProjectsService'
// or
import { getProjects } from '../services/dynamoDBProjectsService'
```

### Step 2: Replace Firestore Call

Replace the existing Firestore query with:

```javascript
// OLD (Firestore):
const snapshot = await firestoreService.getDocs('projects', { 
  constraints: queryConstraints 
})
const projects = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))

// NEW (DynamoDB):
const projects = await getProjects({ limit: 50 })
```

### Step 3: Handle Errors

The service throws errors if:
- User is not authenticated
- AWS credentials are not available
- DynamoDB query fails

Wrap in try-catch:

```javascript
try {
  const projects = await getProjects()
  // Use projects...
} catch (error) {
  console.error('Failed to load projects:', error)
  // Handle error (show message, fallback to Firestore, etc.)
}
```

## ✅ Service Features

The service is **self-contained** and includes:

- ✅ Amplify Auth integration for credentials
- ✅ DynamoDB client initialization
- ✅ Automatic conversion of DynamoDB attribute format to JS objects
- ✅ Error handling
- ✅ Authentication checks
- ✅ Logging for debugging

## 🚀 Usage Examples

See **`src/examples/dynamoDBProjectsUsageExample.js`** for complete usage examples including:
- Fetching all projects
- Fetching with limits
- Fetching single project by ID
- Vue component usage pattern
- Pinia store usage pattern

## ⚙️ Configuration Required

### 1. AWS Credentials

The service uses AWS SDK's default credential provider chain. Configure one of:

**Option A: Environment Variables** (Development)
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Option B: Cognito Identity Pool** (Production - Recommended)
1. Create a Cognito Identity Pool in AWS Console
2. Configure IAM roles with DynamoDB permissions
3. Update `src/boot/amplify.js`:
   ```javascript
   aws_cognito_identity_pool_id: 'us-east-1:xxxxx',
   ```

**Option C: IAM Role** (If running on EC2/Lambda)
- Attach IAM role with DynamoDB permissions

### 2. IAM Permissions

The IAM role/user needs:
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:Scan",
    "dynamodb:GetItem"
  ],
  "Resource": "arn:aws:dynamodb:us-east-1:530222925071:table/projects"
}
```

### 3. Table Schema

The service assumes:
- **Table Name**: `projects`
- **Primary Key**: `id` (String)

If your table uses a different primary key, update `getProjectById()` in the service.

## 🧪 Testing

1. Ensure user is authenticated (Cognito)
2. Verify AWS credentials are configured
3. Check browser console for logs:
   - `[DynamoDBProjectsService] ✅ DynamoDB client initialized`
   - `[DynamoDBProjectsService] ✅ Scanned X projects from DynamoDB`

## 📝 Notes

- The service **does NOT modify any UI files**
- It can be used from **any component** without further setup
- It includes **automatic fallback** handling (though you may want to add Firestore fallback in UI)
- All DynamoDB attribute format conversion is handled automatically
- The service is **ready to use** - just import and call `getProjects()`

## 🔄 Migration Strategy

1. **Phase 1**: Add DynamoDB service alongside Firestore (current state)
2. **Phase 2**: Update `projectStore.js` to use DynamoDB with Firestore fallback
3. **Phase 3**: Test thoroughly with real data
4. **Phase 4**: Remove Firestore fallback once stable

## ❓ Troubleshooting

**"User must be authenticated"**
- Ensure user is logged in via Cognito
- Check `Auth.currentAuthenticatedUser()` works

**"Failed to get AWS credentials"**
- Configure AWS credentials (see Configuration section)
- Check IAM permissions

**"Access Denied"**
- Verify IAM role has DynamoDB permissions
- Check table ARN matches: `arn:aws:dynamodb:us-east-1:530222925071:table/projects`

**Empty results**
- Verify table has data
- Check table name is correct (`projects`)
- Verify primary key field is `id`

