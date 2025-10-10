/**
 * Firestore Migration Script: Convert existing data to bilingual format
 * 
 * This script migrates existing Firestore documents to support bilingual content (English + Arabic).
 * It uses Google Cloud Translation API to automatically translate English content to Arabic.
 * 
 * Usage:
 * 1. Set up environment variables for Firebase and Google Cloud Translation API
 * 2. Run: node migrate-to-bilingual.js
 * 
 * Environment Variables Required:
 * - GOOGLE_TRANSLATE_API_KEY: Your Google Cloud Translation API key
 * - Or use GOOGLE_APPLICATION_CREDENTIALS for service account authentication
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore'
import axios from 'axios'

// Firebase configuration - Update with your config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Google Cloud Translation API configuration
const TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || ''
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'

// Configuration: Collections and fields to migrate
const MIGRATION_CONFIG = {
  // Service Categories
  serviceCategories: {
    collectionPath: (projectId) => `projects/${projectId}/serviceCategories`,
    fields: ['name', 'description', 'details']
  },
  
  // Services
  services: {
    collectionPath: (projectId, categoryId) => `projects/${projectId}/serviceCategories/${categoryId}/services`,
    fields: ['name', 'description', 'details']
  },
  
  // Request Categories
  requestCategories: {
    collectionPath: (projectId) => `projects/${projectId}/requestCategories`,
    fields: ['name', 'description', 'details']
  },
  
  // Stores
  stores: {
    collectionPath: (projectId) => `projects/${projectId}/stores`,
    fields: ['name', 'description']
  },
  
  // Products
  products: {
    collectionPath: (projectId, storeId) => `projects/${projectId}/stores/${storeId}/products`,
    fields: ['name', 'description', 'category']
  },
  
  // News
  news: {
    collectionPath: (projectId) => `projects/${projectId}/news`,
    fields: ['title', 'content', 'summary']
  },
  
  // Academy Programs
  academyPrograms: {
    collectionPath: (projectId, academyId) => `projects/${projectId}/academies/${academyId}/programs`,
    fields: ['name', 'description', 'details']
  },
  
  // Courts
  courts: {
    collectionPath: (projectId) => `projects/${projectId}/courts`,
    fields: ['name', 'description', 'type']
  }
}

/**
 * Translate text from English to Arabic using Google Cloud Translation API
 */
async function translateToArabic(text) {
  if (!text || typeof text !== 'string') return text
  
  try {
    const response = await axios.post(
      TRANSLATE_API_URL,
      {
        q: text,
        source: 'en',
        target: 'ar',
        format: 'text'
      },
      {
        params: {
          key: TRANSLATE_API_KEY
        }
      }
    )
    
    return response.data.data.translations[0].translatedText
  } catch (error) {
    console.error(`❌ Translation error for text "${text}":`, error.message)
    return text // Return original text if translation fails
  }
}

/**
 * Check if a field is already bilingual
 */
function isBilingual(field) {
  return (
    field &&
    typeof field === 'object' &&
    !Array.isArray(field) &&
    ('en' in field && 'ar' in field)
  )
}

/**
 * Migrate a single document to bilingual format
 */
async function migrateDocument(docRef, docData, fieldsToMigrate) {
  const updates = {}
  let needsUpdate = false
  
  for (const fieldName of fieldsToMigrate) {
    const fieldValue = docData[fieldName]
    
    // Skip if field doesn't exist or is empty
    if (!fieldValue) continue
    
    // Skip if already bilingual
    if (isBilingual(fieldValue)) {
      console.log(`   ✓ Field "${fieldName}" already bilingual`)
      continue
    }
    
    // If it's a string, convert to bilingual
    if (typeof fieldValue === 'string') {
      console.log(`   📝 Translating field "${fieldName}": ${fieldValue.substring(0, 50)}...`)
      
      const arabicText = await translateToArabic(fieldValue)
      
      updates[fieldName] = {
        en: fieldValue,
        ar: arabicText
      }
      
      needsUpdate = true
      console.log(`   ✓ Translated to: ${arabicText.substring(0, 50)}...`)
      
      // Add delay to avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  if (needsUpdate) {
    try {
      await updateDoc(docRef, updates)
      console.log(`   ✅ Document updated successfully`)
      return true
    } catch (error) {
      console.error(`   ❌ Error updating document:`, error.message)
      return false
    }
  }
  
  return false
}

/**
 * Migrate a collection to bilingual format
 */
async function migrateCollection(collectionRef, fieldsToMigrate, collectionName) {
  console.log(`\n📚 Migrating collection: ${collectionName}`)
  
  try {
    const snapshot = await getDocs(collectionRef)
    
    if (snapshot.empty) {
      console.log(`   ℹ️  No documents found`)
      return { total: 0, migrated: 0, skipped: 0 }
    }
    
    console.log(`   Found ${snapshot.docs.length} documents`)
    
    let migrated = 0
    let skipped = 0
    
    for (const docSnap of snapshot.docs) {
      console.log(`\n   📄 Processing document: ${docSnap.id}`)
      
      const wasUpdated = await migrateDocument(
        doc(db, collectionRef.path, docSnap.id),
        docSnap.data(),
        fieldsToMigrate
      )
      
      if (wasUpdated) {
        migrated++
      } else {
        skipped++
      }
    }
    
    return { total: snapshot.docs.length, migrated, skipped }
  } catch (error) {
    console.error(`   ❌ Error migrating collection:`, error.message)
    return { total: 0, migrated: 0, skipped: 0, error: error.message }
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Firestore Bilingual Migration')
  console.log('=========================================\n')
  
  if (!TRANSLATE_API_KEY) {
    console.error('❌ GOOGLE_TRANSLATE_API_KEY environment variable is not set')
    console.error('   Please set it before running the migration script')
    process.exit(1)
  }
  
  try {
    // Get all projects first
    const projectsSnapshot = await getDocs(collection(db, 'projects'))
    
    if (projectsSnapshot.empty) {
      console.log('ℹ️  No projects found')
      return
    }
    
    console.log(`Found ${projectsSnapshot.docs.length} projects\n`)
    
    const results = {}
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id
      const projectData = projectDoc.data()
      
      console.log(`\n🏢 Processing Project: ${projectData.name || projectId}`)
      console.log('='.repeat(60))
      
      results[projectId] = {}
      
      // Migrate Service Categories
      const serviceCategoriesRef = collection(db, `projects/${projectId}/serviceCategories`)
      results[projectId].serviceCategories = await migrateCollection(
        serviceCategoriesRef,
        MIGRATION_CONFIG.serviceCategories.fields,
        'Service Categories'
      )
      
      // Migrate Request Categories
      const requestCategoriesRef = collection(db, `projects/${projectId}/requestCategories`)
      results[projectId].requestCategories = await migrateCollection(
        requestCategoriesRef,
        MIGRATION_CONFIG.requestCategories.fields,
        'Request Categories'
      )
      
      // Migrate Stores
      const storesRef = collection(db, `projects/${projectId}/stores`)
      results[projectId].stores = await migrateCollection(
        storesRef,
        MIGRATION_CONFIG.stores.fields,
        'Stores'
      )
      
      // Migrate News
      const newsRef = collection(db, `projects/${projectId}/news`)
      results[projectId].news = await migrateCollection(
        newsRef,
        MIGRATION_CONFIG.news.fields,
        'News'
      )
      
      // Migrate Courts
      const courtsRef = collection(db, `projects/${projectId}/courts`)
      results[projectId].courts = await migrateCollection(
        courtsRef,
        MIGRATION_CONFIG.courts.fields,
        'Courts'
      )
    }
    
    // Print summary
    console.log('\n\n📊 Migration Summary')
    console.log('='.repeat(60))
    
    Object.entries(results).forEach(([projectId, projectResults]) => {
      console.log(`\nProject: ${projectId}`)
      
      Object.entries(projectResults).forEach(([collectionName, stats]) => {
        if (stats.error) {
          console.log(`  ❌ ${collectionName}: Error - ${stats.error}`)
        } else {
          console.log(`  ✅ ${collectionName}: ${stats.migrated}/${stats.total} migrated, ${stats.skipped} skipped`)
        }
      })
    })
    
    console.log('\n\n✅ Migration completed!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n👋 Exiting...')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

