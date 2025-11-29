# Firestore Bilingual Migration Script

This script migrates existing Firestore data to support bilingual content (English + Arabic).

## Prerequisites

1. **Google Cloud Translation API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Cloud Translation API
   - Create an API key or service account
   - Set the API key as an environment variable

2. **Firebase Configuration**
   - Ensure your Firebase configuration is set in environment variables
   - Or update the `firebaseConfig` object in the script

## Setup

### Option 1: Using API Key

```bash
export GOOGLE_TRANSLATE_API_KEY="your-api-key-here"
export VITE_FIREBASE_API_KEY="your-firebase-api-key"
export VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
export VITE_FIREBASE_PROJECT_ID="your-project-id"
export VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
export VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export VITE_FIREBASE_APP_ID="your-app-id"
```

### Option 2: Using Service Account

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
export VITE_FIREBASE_API_KEY="your-firebase-api-key"
# ... other Firebase env vars
```

## Running the Script

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre

# Install dependencies if needed
npm install

# Run the migration script
node scripts/migrate-to-bilingual.js
```

## What the Script Does

The script will:

1. **Fetch all projects** from your Firestore database
2. **Process each collection** in each project:
   - Service Categories
   - Services (nested under categories)
   - Request Categories
   - Stores
   - Products (nested under stores)
   - News
   - Academy Programs
   - Courts

3. **For each document**:
   - Check if fields are already bilingual
   - If not, translate English text to Arabic using Google Cloud Translation API
   - Update the document with bilingual format: `{ en: 'English text', ar: 'النص العربي' }`

4. **Show progress** and summary of migrated documents

## Bilingual Format

Before migration:
```json
{
  "name": "Swimming Pool",
  "description": "Olympic size swimming pool"
}
```

After migration:
```json
{
  "name": {
    "en": "Swimming Pool",
    "ar": "حمام السباحة"
  },
  "description": {
    "en": "Olympic size swimming pool",
    "ar": "حمام سباحة أولمبي الحجم"
  }
}
```

## Important Notes

1. **Backup First**: Always backup your Firestore database before running migrations
2. **API Costs**: Google Cloud Translation API charges per character translated
3. **Rate Limits**: The script includes delays to avoid hitting API rate limits
4. **Idempotent**: The script can be run multiple times safely - it skips already migrated fields
5. **Dry Run**: Consider testing on a development/staging environment first

## Customization

To add more collections or fields to migrate, edit the `MIGRATION_CONFIG` object in the script:

```javascript
const MIGRATION_CONFIG = {
  yourCollection: {
    collectionPath: (projectId) => `projects/${projectId}/yourCollection`,
    fields: ['name', 'description', 'otherField']
  }
}
```

## Troubleshooting

### "GOOGLE_TRANSLATE_API_KEY environment variable is not set"
Set the API key as shown in the Setup section above.

### "Translation error"
Check your API key is valid and the Translation API is enabled in your Google Cloud project.

### "Permission denied"
Ensure your Firebase credentials have write access to Firestore.

### "Quota exceeded"
You've hit the Translation API quota. Wait or increase your quota in Google Cloud Console.

## Manual Translation

If you prefer to manually translate content instead of using the API, you can:

1. Export your data to JSON
2. Translate the text manually
3. Update the `translateToArabic` function to use your manual translations:

```javascript
const manualTranslations = {
  'Swimming Pool': 'حمام السباحة',
  // ... more translations
}

async function translateToArabic(text) {
  return manualTranslations[text] || text
}
```

## Cost Estimation

Google Cloud Translation API pricing (as of 2024):
- $20 per million characters

To estimate costs:
1. Export your Firestore data
2. Calculate total characters in fields to be translated
3. Divide by 1,000,000 and multiply by $20

For a typical project with ~1000 documents and ~100 characters per field:
- 1000 docs × 3 fields × 100 chars = 300,000 characters
- Cost: ~$6

## Support

For issues or questions:
1. Check Firestore console for data integrity
2. Review script logs for specific errors
3. Contact the development team

