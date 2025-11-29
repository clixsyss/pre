# Service Status Fix - Services Not Showing in App

## Problem

Services and request categories created in the dashboard were **not appearing in the mobile app**, even though:
- They existed in Firestore
- Firestore security rules were fixed
- The app code was correct

## Root Cause

**Status Mismatch between Dashboard and App**

### Dashboard Default
When creating services/requests in the dashboard, they were created with:
```javascript
status: 'draft'  // Default status
```

### App Filter
The app only displays items with:
```javascript
status: 'available'  // Only shows available items
```

**Result**: Services created in dashboard stayed in "draft" status and were filtered out by the app!

## Logs Showing the Issue

From your console:
```javascript
⚡️  [log] - Services availability check: {
  "dynamicCategories": 0,  // ← Should show your services!
  "hasCourts": false,
  "hasAcademies": false,
  "hasStores": false,
  "isSmartHomeConnected": false,
  "hasAnyServices": false
}

// App was filtering for 'available' status:
if (availableOnly) {
  categories = categories.filter(cat => cat.status === 'available')  // ← Filtering out 'draft' items
}
```

## Solutions Applied

### 1. Fixed Dashboard Defaults (Permanent Fix)

Changed default status from `'draft'` to `'available'` in:

**ServiceCategoriesManagement.js**
```javascript
status: 'available', // Was: 'draft'
```

**IndividualServicesManagement.js**
```javascript
status: 'available', // Was: 'draft'
```

**RequestCategoriesManagement.js**
```javascript
status: 'available', // Was: 'draft'
```

**Result**: New services/requests will now appear in the app immediately after creation!

### 2. For Existing Services (Manual Fix Required)

**Existing services that are already "draft" need to be updated:**

#### Option A: Update via Dashboard UI
1. Open the dashboard
2. Navigate to Service Categories / Request Categories
3. Edit each existing category
4. Change status from "Draft" to "Available"
5. Save

#### Option B: Update via Firebase Console
1. Go to Firebase Console → Firestore Database
2. Navigate to: `projects/{projectId}/serviceCategories`
3. Find your service categories
4. Edit each document
5. Change `status` field from `"draft"` to `"available"`
6. Save

#### Option C: Bulk Update Script (for many services)

Create a script to update all draft services:

```javascript
// update-service-status.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateServiceStatuses(projectId) {
  // Update service categories
  const serviceCategoriesRef = collection(db, `projects/${projectId}/serviceCategories`);
  const serviceSnapshot = await getDocs(serviceCategoriesRef);
  
  for (const docSnap of serviceSnapshot.docs) {
    if (docSnap.data().status === 'draft') {
      await updateDoc(doc(db, `projects/${projectId}/serviceCategories/${docSnap.id}`), {
        status: 'available'
      });
      console.log(`Updated service category: ${docSnap.id}`);
    }
  }
  
  // Update request categories
  const requestCategoriesRef = collection(db, `projects/${projectId}/requestCategories`);
  const requestSnapshot = await getDocs(requestCategoriesRef);
  
  for (const docSnap of requestSnapshot.docs) {
    if (docSnap.data().status === 'draft') {
      await updateDoc(doc(db, `projects/${projectId}/requestCategories/${docSnap.id}`), {
        status: 'available'
      });
      console.log(`Updated request category: ${docSnap.id}`);
    }
  }
  
  console.log('✅ All draft items updated to available!');
}

// Run for your project
updateServiceStatuses('YOUR_PROJECT_ID');
```

## Verification

After fixing:

1. **Clear app cache** or force reload
2. **Check console logs** in the app:
```javascript
Services availability check: {
  "dynamicCategories": 1,  // ← Should now show count!
  "hasAnyServices": true
}
```

3. **Services should now be visible** in the app's Services page

## Why This Happened

The dashboard was designed with a workflow in mind:
1. Create service as "draft" (not visible to users)
2. Configure and test it
3. When ready, change status to "available" (visible to users)

However, this workflow wasn't clear, causing services to stay in draft mode unintentionally.

## Prevention

Going forward:
- ✅ **New services default to "available"** (fixed in dashboard)
- ✅ **Clear visual indicators** in dashboard showing status
- ✅ **Easy toggle** to switch between draft/available
- ℹ️ **Consider**: Add tooltip/warning in dashboard explaining that "draft" services won't appear in app

## Related Files Changed

### Dashboard
- `/pre-dashboard/src/components/ServiceCategoriesManagement.js`
- `/pre-dashboard/src/components/IndividualServicesManagement.js`
- `/pre-dashboard/src/components/RequestCategoriesManagement.js`

### App (no changes needed - was working correctly)
- `/pre/src/services/serviceCategoriesService.js`
- `/pre/src/services/fastCollectionService.js`

## Testing

1. ✅ Create a new service category in dashboard
2. ✅ Verify it has `status: "available"` in Firestore
3. ✅ Check it appears immediately in the app
4. ✅ Toggle status to "draft" in dashboard
5. ✅ Verify it disappears from app
6. ✅ Toggle back to "available"
7. ✅ Verify it reappears in app

