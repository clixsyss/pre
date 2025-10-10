# Environment Variables Setup

## For PRE App

Create a `.env.local` file in the `/pre` directory with these variables:

### Required (Firebase Configuration)

```bash
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

You should already have these configured for your Firebase project.

### Optional (Only for Migration Script)

```bash
GOOGLE_TRANSLATE_API_KEY=your-translation-api-key-here
```

**When do you need this?**
- ❌ NOT needed for the app to run
- ❌ NOT needed for normal development
- ✅ ONLY if you want to automatically translate existing English data to Arabic
- ✅ ONLY for running the migration script one time

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Cloud Translation API"
3. Create an API key under "Credentials"
4. Set it as environment variable when running migration:
   ```bash
   export GOOGLE_TRANSLATE_API_KEY="your-key"
   node scripts/migrate-to-bilingual.js
   ```

---

## For PRE Dashboard

Create a `.env.local` file in the `/pre-dashboard` directory:

```bash
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**No Translation API key needed** - The dashboard uses manual bilingual input via `BilingualInput` components.

---

## Summary

**TL;DR:**
- ✅ You already have Firebase env vars configured
- ❌ You DON'T need a Translation API key for the app to work
- ✅ Translation API key is ONLY for the optional migration script
- 💡 Best practice: Manually enter bilingual content in dashboard (free & more accurate)

