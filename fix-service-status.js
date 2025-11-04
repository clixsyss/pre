/**
 * Script to check and fix service/request category status
 * This will update all 'draft' items to 'available' so they show in the app
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpYVhP_uLDecqds0VD7g409N_AMj-OMF8",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "329221699138",
  appId: "1:329221699138:web:b89ce5ffe2e7e0e20c37a4",
  measurementId: "G-BBQCQDZMKX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndFixServices(projectId) {
  console.log(`\n🔍 Checking services for project: ${projectId}\n`);
  
  try {
    // Check Service Categories
    console.log('📋 Checking Service Categories...');
    const serviceCategoriesRef = collection(db, `projects/${projectId}/serviceCategories`);
    const serviceSnapshot = await getDocs(serviceCategoriesRef);
    
    console.log(`Found ${serviceSnapshot.size} service categories`);
    
    let updatedServices = 0;
    for (const docSnap of serviceSnapshot.docs) {
      const data = docSnap.data();
      console.log(`  - ${docSnap.id}: "${data.englishTitle || 'No title'}" (status: ${data.status || 'undefined'})`);
      
      if (data.status === 'draft' || !data.status) {
        console.log(`    ⚠️  Updating to 'available'...`);
        await updateDoc(doc(db, `projects/${projectId}/serviceCategories/${docSnap.id}`), {
          status: 'available'
        });
        updatedServices++;
        console.log(`    ✅ Updated!`);
      }
    }
    
    console.log(`\n✅ Service Categories: ${updatedServices} updated to 'available'\n`);
    
    // Check Request Categories
    console.log('📋 Checking Request Categories...');
    const requestCategoriesRef = collection(db, `projects/${projectId}/requestCategories`);
    const requestSnapshot = await getDocs(requestCategoriesRef);
    
    console.log(`Found ${requestSnapshot.size} request categories`);
    
    let updatedRequests = 0;
    for (const docSnap of requestSnapshot.docs) {
      const data = docSnap.data();
      console.log(`  - ${docSnap.id}: "${data.englishTitle || 'No title'}" (status: ${data.status || 'undefined'})`);
      
      if (data.status === 'draft' || !data.status) {
        console.log(`    ⚠️  Updating to 'available'...`);
        await updateDoc(doc(db, `projects/${projectId}/requestCategories/${docSnap.id}`), {
          status: 'available'
        });
        updatedRequests++;
        console.log(`    ✅ Updated!`);
      }
    }
    
    console.log(`\n✅ Request Categories: ${updatedRequests} updated to 'available'\n`);
    
    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`Service Categories: ${serviceSnapshot.size} found, ${updatedServices} updated`);
    console.log(`Request Categories: ${requestSnapshot.size} found, ${updatedRequests} updated`);
    console.log('═══════════════════════════════════════════\n');
    
    if (updatedServices > 0 || updatedRequests > 0) {
      console.log('✅ SUCCESS! Your services should now appear in the app.');
      console.log('📱 Reload the app to see your services.');
    } else {
      console.log('ℹ️  All items were already set to "available".');
      console.log('🔍 If services still don\'t show, check:');
      console.log('   1. Firestore security rules are deployed');
      console.log('   2. User has access to the project');
      console.log('   3. App cache is cleared');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  PERMISSION DENIED ERROR');
      console.error('This script needs admin access to update Firestore.');
      console.error('Please update the services manually via Firebase Console:');
      console.error(`1. Go to: https://console.firebase.google.com/project/pre-group/firestore`);
      console.error(`2. Navigate to: projects/${projectId}/serviceCategories`);
      console.error('3. Edit each document and change "status" to "available"');
    }
  }
}

// Run for your project - CHANGE THIS to your project ID
const PROJECT_ID = 'BiHENuiMdDrivwbPccNE'; // Stone Residence

console.log('🚀 Service Status Fix Script');
console.log('═══════════════════════════════════════════\n');

checkAndFixServices(PROJECT_ID)
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

