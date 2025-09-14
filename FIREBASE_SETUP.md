# Firebase Integration Guide

This project has been successfully integrated with Firebase. Here's how to use it:

## What's Been Set Up

1. **Firebase Boot File** (`src/boot/firebase.js`)
   - Initializes Firebase with your configuration
   - Sets up Authentication, Firestore, and Storage services
   - Makes services available globally in Vue components

2. **Configuration Added to Quasar**
   - Firebase boot file is registered in `quasar.config.js`
   - Services are automatically initialized when the app starts

3. **Example Component** (`src/components/FirebaseExample.vue`)
   - Demonstrates authentication, database operations, and file storage
   - Shows best practices for using Firebase in Vue components

## Available Firebase Services

### Authentication (`$auth`)
- User sign up, sign in, sign out
- Authentication state management
- User profile information

### Firestore Database (`$db`)
- Real-time database operations
- CRUD operations for documents
- Real-time listeners for data changes

### Storage (`$storage`)
- File upload and download
- File management
- Secure file access

## How to Use in Your Components

### Option 1: Global Properties (Options API)
```vue
<template>
  <div>
    <button @click="signIn">Sign In</button>
    <p v-if="$auth.currentUser">Welcome, {{ $auth.currentUser.email }}</p>
  </div>
</template>

<script>
export default {
  methods: {
    async signIn() {
      try {
        await this.$auth.signInWithEmailAndPassword(email, password)
      } catch (error) {
        console.error('Sign in error:', error)
      }
    }
  }
}
</script>
```

### Option 2: Direct Imports (Composition API - Recommended)
```vue
<script setup>
import { auth, db, storage } from '../boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    console.error('Sign in error:', error)
  }
}

const saveData = async (data) => {
  try {
    await addDoc(collection(db, 'collection-name'), data)
  } catch (error) {
    console.error('Save error:', error)
  }
}
</script>
```

## Firebase Configuration

Your Firebase configuration is set up in `src/boot/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "871778209250",
  appId: "1:871778209250:web:79e726a4f5b5579bfc7dbb"
}
```

## Security Rules

Make sure to set up proper security rules in your Firebase console:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing the Integration

1. Run your development server: `npm run dev`
2. Navigate to a page that includes the `FirebaseExample` component
3. Test authentication, database operations, and file uploads
4. Check the browser console for any errors

## Common Firebase Operations

### Authentication
```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

// Sign in
await signInWithEmailAndPassword(auth, email, password)

// Sign up
await createUserWithEmailAndPassword(auth, email, password)

// Sign out
await signOut(auth)
```

### Firestore
```javascript
import { collection, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'

// Add document
const docRef = await addDoc(collection(db, 'collection-name'), data)

// Get documents
const querySnapshot = await getDocs(collection(db, 'collection-name'))

// Update document
await updateDoc(docRef, { field: 'new value' })

// Delete document
await deleteDoc(docRef)
```

### Storage
```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Upload file
const storageRef = ref(storage, 'path/to/file')
await uploadBytes(storageRef, file)

// Get download URL
const downloadURL = await getDownloadURL(storageRef)
```

## Troubleshooting

1. **Firebase not initialized**: Check that the boot file is properly registered in `quasar.config.js`
2. **Authentication errors**: Verify your Firebase project settings and enable Email/Password authentication
3. **Database permission errors**: Check your Firestore security rules
4. **Storage errors**: Verify your Storage security rules and bucket configuration

## Next Steps

1. Customize the Firebase configuration for your specific needs
2. Set up proper security rules in the Firebase console
3. Create your own components using the Firebase services
4. Implement user management and data persistence
5. Add real-time features using Firestore listeners
