# Database Migration Guide: Split Court and Academy Bookings

## Current Problem
- Court and academy bookings are mixed in the same `bookings` collection
- This causes user ID confusion and makes data management difficult
- Different data structures for different booking types

## Proposed Solution
Split into two separate collections:
1. `courtBookings` - for court reservations
2. `academyBookings` - for academy registrations

## Migration Steps

### 1. Create New Collections Structure

```javascript
// New structure in Firestore
projects/{projectId}/
├── courtBookings/          // New collection
│   └── {bookingId}/
│       ├── userId
│       ├── courtId
│       ├── courtName
│       ├── courtType
│       ├── courtLocation
│       ├── sport
│       ├── date
│       ├── timeSlots
│       ├── status
│       ├── totalPrice
│       └── createdAt
│
├── academyBookings/        // New collection
│   └── {bookingId}/
│       ├── userId
│       ├── academyId
│       ├── academyName
│       ├── programId
│       ├── programName
│       ├── studentName
│       ├── studentAge
│       ├── parentName
│       ├── phone
│       ├── email
│       ├── category
│       ├── ageGroup
│       ├── duration
│       ├── pricingType
│       ├── price
│       ├── totalCost
│       ├── status
│       └── createdAt
│
└── bookings/               // Old collection (to be removed after migration)
    └── {bookingId}/
        └── ... (mixed data)
```

### 2. Migration Script

Create a Firebase function to migrate existing data:

```javascript
// functions/migrateBookings.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.migrateBookings = functions.https.onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    
    // Get all projects
    const projectsSnapshot = await db.collection('projects').get();
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;
      console.log(`Migrating project: ${projectId}`);
      
      // Get all bookings for this project
      const bookingsSnapshot = await db.collection(`projects/${projectId}/bookings`).get();
      
      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const bookingId = bookingDoc.id;
        
        if (bookingData.type === 'court') {
          // Move to courtBookings collection
          await db.collection(`projects/${projectId}/courtBookings`).doc(bookingId).set(bookingData);
          console.log(`Moved court booking ${bookingId}`);
        } else if (bookingData.type === 'academy') {
          // Move to academyBookings collection
          await db.collection(`projects/${projectId}/academyBookings`).doc(bookingId).set(bookingData);
          console.log(`Moved academy booking ${bookingId}`);
        }
        
        // Delete from old collection
        await db.collection(`projects/${projectId}/bookings`).doc(bookingId).delete();
      }
    }
    
    res.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Update Frontend Code

#### Update Academy Store
```javascript
// src/stores/academyStore.js
const fetchUserBookings = async (userId, projectId) => {
  try {
    // Fetch from both collections
    const [courtBookings, academyBookings] = await Promise.all([
      getDocs(query(
        collection(db, `projects/${projectId}/courtBookings`),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )),
      getDocs(query(
        collection(db, `projects/${projectId}/academyBookings`),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      ))
    ]);
    
    // Combine and format
    const allBookings = [];
    
    courtBookings.forEach(doc => {
      allBookings.push({ id: doc.id, type: 'court', ...doc.data() });
    });
    
    academyBookings.forEach(doc => {
      allBookings.push({ id: doc.id, type: 'academy', ...doc.data() });
    });
    
    // Sort by creation date
    allBookings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    
    userBookings.value = allBookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};
```

#### Update Academy Registration
```javascript
// src/pages/auth/AcademyRegistration.vue
const submitRegistration = async () => {
  // ... validation ...
  
  const registrationData = {
    userId: getCurrentUserId(),
    projectId: currentProject.value.id,
    academyId: academy.value.id,
    academyName: academy.value.name,
    // ... other fields ...
  };
  
  // Save to academyBookings collection
  const academyBookingsRef = collection(db, `projects/${currentProject.value.id}/academyBookings`);
  const docRef = await addDoc(academyBookingsRef, registrationData);
  
  // ... success handling ...
};
```

### 4. Benefits of This Approach

1. **Cleaner Data Structure**: Each collection has a specific purpose
2. **Better Performance**: Queries are more targeted
3. **Easier Maintenance**: Separate logic for different booking types
4. **Scalability**: Can add type-specific fields without affecting other types
5. **User ID Consistency**: Each collection can have its own user management

### 5. Rollback Plan

If migration fails:
1. Keep the old `bookings` collection as backup
2. Update frontend to fall back to old collection
3. Fix migration script and retry

### 6. Testing

1. Test migration on a development project first
2. Verify all data is moved correctly
3. Test frontend functionality with new collections
4. Monitor for any data loss or corruption

## Immediate Fix (Without Migration)

If you want to keep the current structure for now, the updated code should:
1. Use the correct user ID from existing court bookings
2. Display both court and academy bookings correctly
3. Handle the mixed data structure properly

## Recommendation

**Split the collections** - it's the right long-term solution and will prevent these issues in the future.
