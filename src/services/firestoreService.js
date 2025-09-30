import { db, auth, isNative } from '../boot/firebase'
import errorHandlingService from './errorHandlingService'
import cacheService from './cacheService'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'

class FirestoreService {
  constructor() {
    this.isNative = isNative
    this.db = db
    this.auth = auth
    this.capacitorFirestore = null
    this.initialized = false
  }

  async initialize() {
    console.log('🔧 FirestoreService.initialize called:', { isNative: this.isNative, initialized: this.initialized })
    if (this.isNative && !this.initialized) {
      try {
        console.log('📦 Importing Capacitor Firebase Firestore...')
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        this.capacitorFirestore = FirebaseFirestore
        this.initialized = true
        console.log('✅ FirestoreService: Capacitor Firebase Firestore initialized successfully')
        
        // Ensure authentication context is properly set
        await this.ensureAuthContext()
      } catch (error) {
        console.error('❌ FirestoreService: Failed to initialize Capacitor Firebase Firestore:', error)
        errorHandlingService.handleFirestoreError(error, 'FirestoreService.initialize')
        throw error
      }
    } else {
      console.log('⏭️ FirestoreService: Skipping initialization - not native or already initialized')
    }
  }

  /**
   * Ensure authentication context is properly set for Firestore queries
   */
  async ensureAuthContext() {
    if (!this.isNative) return

    try {
      console.log('🔐 FirestoreService: Ensuring authentication context...')
      
      // Import the authentication service
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
      
      // Get the current user to ensure auth context is set
      const currentUser = await FirebaseAuthentication.getCurrentUser()
      
      if (currentUser.user) {
        console.log('✅ FirestoreService: Authentication context verified for user:', currentUser.user.uid)
        
        // Force a small delay to ensure auth context is fully propagated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        return true
      } else {
        console.warn('⚠️ FirestoreService: No authenticated user found')
        return false
      }
    } catch (error) {
      console.error('❌ FirestoreService: Failed to ensure authentication context:', error)
      return false
    }
  }

  // Get a document with caching
  async getDoc(path, useCache = true) {
    try {
      // Check cache first
      if (useCache) {
        const cachedData = cacheService.get(path)
        if (cachedData) {
          return {
            exists: () => cachedData !== null,
            data: () => cachedData,
            id: path.split('/').pop()
          }
        }
      }

      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorFirestore.getDocument({
          reference: path
        })
        console.log('🔍 FirestoreService getDoc result:', result)
        
        // Check if the snapshot exists and has data
        const exists = result.snapshot && result.snapshot.data && Object.keys(result.snapshot.data).length > 0
        const data = result.snapshot.data || {}
        
        // Cache the result
        if (useCache && exists) {
          cacheService.set(path, data)
        }
        
        return {
          exists: () => exists,
          data: () => data,
          id: result.snapshot.id || path.split('/').pop()
        }
      } else {
        const docRef = doc(this.db, path)
        const result = await getDoc(docRef)
        
        // Cache the result
        if (useCache && result.exists()) {
          cacheService.set(path, result.data())
        }
        
        return result
      }
    } catch (error) {
      console.error('Get document error:', error)
      throw error
    }
  }

  // Set a document
  async setDoc(path, data, options = {}) {
    try {
      if (this.isNative) {
        await this.initialize()
        const docData = { ...data }
        
        // Convert serverTimestamp for native
        if (options.merge) {
          await this.capacitorFirestore.setDocument({
            reference: path,
            data: docData,
            merge: true
          })
        } else {
          await this.capacitorFirestore.setDocument({
            reference: path,
            data: docData
          })
        }
      } else {
        const docRef = doc(this.db, path)
        if (options.merge) {
          await setDoc(docRef, data, { merge: true })
        } else {
          await setDoc(docRef, data)
        }
      }
      
      // Invalidate cache for this document
      cacheService.delete(path)
    } catch (error) {
      console.error('Set document error:', error)
      throw error
    }
  }

  // Update a document
  async updateDoc(path, data) {
    try {
      if (this.isNative) {
        await this.initialize()
        await this.capacitorFirestore.updateDocument({
          reference: path,
          data
        })
      } else {
        const docRef = doc(this.db, path)
        await updateDoc(docRef, data)
      }
    } catch (error) {
      console.error('Update document error:', error)
      throw error
    }
  }

  // Delete a document
  async deleteDoc(path) {
    try {
      if (this.isNative) {
        await this.initialize()
        await this.capacitorFirestore.deleteDocument({
          reference: path
        })
      } else {
        const docRef = doc(this.db, path)
        await deleteDoc(docRef)
      }
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  }

  // Add a document
  async addDoc(collectionPath, data) {
    try {
      console.log('🔍 FirestoreService.addDoc called:', { collectionPath, dataKeys: Object.keys(data) });
      
      if (this.isNative) {
        console.log('🔍 Using native Capacitor Firebase for addDoc...');
        await this.initialize()
        
        console.log('🔍 Calling capacitorFirestore.addDocument...');
        
        // Add a direct timeout to the Capacitor Firebase call
        const capacitorTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Capacitor Firebase addDocument timeout')), 10000); // 10 second timeout
        });
        
        const result = await Promise.race([
          this.capacitorFirestore.addDocument({
            reference: collectionPath,
            data
          }),
          capacitorTimeout
        ]);
        
        console.log('🔍 Native addDoc result:', result);
        return {
          id: result.id,
          documentId: result.id // Add documentId for compatibility
        }
      } else {
        console.log('🔍 Using Web SDK for addDoc...');
        const collectionRef = collection(this.db, collectionPath)
        console.log('🔍 Calling Web SDK addDoc...');
        const docRef = await addDoc(collectionRef, data)
        console.log('🔍 Web addDoc result:', docRef);
        return {
          id: docRef.id,
          documentId: docRef.id // Add documentId for compatibility
        }
      }
    } catch (error) {
      console.error('❌ Add document error:', error)
      throw error
    }
  }

  // Helper method to get nested values from objects
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  // Get documents from collection with timeout and fallback
  async getDocs(collectionPath, queryOptions = {}) {
    try {
      // Extract timeout from queryOptions or use default
      const timeoutMs = queryOptions.timeoutMs || 8000
      
      console.log('🔍 FirestoreService.getDocs called with:', { 
        collectionPath, 
        queryOptions,
        timeoutMs, 
        isNative: this.isNative, 
        initialized: this.initialized,
        hasCapacitorFirestore: !!this.capacitorFirestore
      })
      console.log('🚀 FirestoreService: Getting collection docs for:', collectionPath)
      
      // Check cache first
      // Create a cache key that includes query parameters to avoid cache conflicts
      const queryParams = queryOptions ? JSON.stringify(queryOptions) : 'no-params'
      const cacheKey = `collection:${collectionPath}:${queryParams}`
      const cachedData = cacheService.get(cacheKey)
      if (cachedData) {
        console.log('FirestoreService: Using cached collection data for:', collectionPath)
        return {
          docs: cachedData.docs || [],
          empty: cachedData.empty || false,
          size: cachedData.size || 0
        }
      }

      if (this.isNative) {
        await this.initialize()
        
        // Ensure authentication context is properly set before making queries
        await this.ensureAuthContext()
        
        // Use Capacitor Firebase Firestore plugin for all collections on native platforms
        // This ensures proper authentication context for security rules
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
        })
        
        // Create the actual query promise
        // Note: Capacitor Firebase plugin doesn't support complex queries with filters
        // We'll get all documents and filter client-side
        const queryPromise = this.capacitorFirestore.getCollection({
          reference: collectionPath
        })
        
        try {
          // Race between query and timeout
          const result = await Promise.race([queryPromise, timeoutPromise])
          
          console.log('FirestoreService: Collection query successful for:', collectionPath)
          console.log('FirestoreService: Raw result:', result)
          
          const docs = result.snapshots || []
          console.log('FirestoreService: Raw docs count:', docs.length)
          console.log('FirestoreService: First doc sample:', docs[0])
          
          let filteredDocs = docs
          
          // Apply client-side filtering if queryOptions has filters
          if (queryOptions.filters && Array.isArray(queryOptions.filters)) {
            console.log('FirestoreService: Applying filters:', queryOptions.filters)
            filteredDocs = docs.filter(doc => {
              return queryOptions.filters.every(filter => {
                // Handle different data structures from Capacitor Firebase
                const docData = doc.data || doc
                const fieldValue = this.getNestedValue(docData, filter.field)
                console.log('FirestoreService: Filter check:', { field: filter.field, value: fieldValue, expected: filter.value, operator: filter.operator })
                
                // Don't skip filters for undefined values - this was causing the date filter to be ignored
                if (fieldValue === undefined || fieldValue === null) {
                  console.log('FirestoreService: Field not found or null, filter fails:', filter.field)
                  return false
                }
                
                switch (filter.operator) {
                  case '==':
                    return fieldValue === filter.value
                  case '!=':
                    return fieldValue !== filter.value
                  case '>':
                    return fieldValue > filter.value
                  case '>=':
                    return fieldValue >= filter.value
                  case '<':
                    return fieldValue < filter.value
                  case '<=':
                    return fieldValue <= filter.value
                  case 'in':
                    return Array.isArray(filter.value) && filter.value.includes(fieldValue)
                  case 'not-in':
                    return Array.isArray(filter.value) && !filter.value.includes(fieldValue)
                  case 'array-contains':
                    return Array.isArray(fieldValue) && fieldValue.includes(filter.value)
                  case 'array-contains-any':
                    return Array.isArray(fieldValue) && filter.value.some(v => fieldValue.includes(v))
                  default:
                    return true
                }
              })
            })
          } else {
            console.log('FirestoreService: No filters applied, returning all docs')
          }
          
          // Apply client-side ordering if queryOptions has orderBy
          if (queryOptions.orderBy && Array.isArray(queryOptions.orderBy)) {
            filteredDocs.sort((a, b) => {
              for (const order of queryOptions.orderBy) {
                const aValue = this.getNestedValue(a.data, order.field)
                const bValue = this.getNestedValue(b.data, order.field)
                
                if (aValue < bValue) return order.direction === 'asc' ? -1 : 1
                if (aValue > bValue) return order.direction === 'asc' ? 1 : -1
              }
              return 0
            })
          }
          
          // Apply limit if specified
          if (queryOptions.limit) {
            filteredDocs = filteredDocs.slice(0, queryOptions.limit)
          }
          
          console.log('FirestoreService: After filtering, docs count:', filteredDocs.length)
          
          const collectionData = {
            docs: filteredDocs.map(doc => {
              // Handle different data structures from Capacitor Firebase
              const docData = doc.data || doc
              return {
                id: doc.id,
                data: () => docData || {}
              }
            }),
            empty: filteredDocs.length === 0,
            size: filteredDocs.length
          }
          
          console.log('FirestoreService: Final collection data:', { empty: collectionData.empty, size: collectionData.size })
          
          // Cache the result
          cacheService.set(cacheKey, collectionData, 2 * 60 * 1000) // 2 minutes cache
          
          return collectionData
        } catch (queryError) {
          console.error('FirestoreService: Collection query failed for:', collectionPath)
          console.error('FirestoreService: Error details:', {
            code: queryError.code,
            message: queryError.message,
            errorMessage: queryError.errorMessage,
            fullError: queryError
          })
          
          // Check if it's a permission error specifically
          if (queryError.code === 'firestore/permission-denied' || 
              queryError.message?.includes('permission') ||
              queryError.errorMessage?.includes('permission')) {
            console.error('🚨 PERMISSION ERROR: This suggests the Firestore rules are not working properly')
            
            // Get current user from optimized auth service for native platforms
            try {
              const { default: optimizedAuthService } = await import('./optimizedAuthService.js')
              const currentUser = await optimizedAuthService.getCurrentUser()
              console.error('🚨 Current user auth state:', currentUser?.uid || 'undefined')
            } catch (authError) {
              console.error('🚨 Could not get current user:', authError.message)
            }
            
            console.error('🚨 Collection path:', collectionPath)
          }
          
          // Return empty result instead of throwing
          const emptyResult = {
            docs: [],
            empty: true,
            size: 0
          }
          
          // Cache empty result for shorter time to allow retries
          cacheService.set(cacheKey, emptyResult, 30 * 1000) // 30 seconds cache
          
          return emptyResult
        }
      } else {
        // Web SDK - use regular collection query
        const { getDocs, collection } = await import('firebase/firestore')
        const collectionRef = collection(this.db, collectionPath)
        const result = await getDocs(collectionRef)
        
        const collectionData = {
          docs: result.docs,
          empty: result.empty,
          size: result.size
        }
        
        // Cache the result
        cacheService.set(cacheKey, collectionData, 2 * 60 * 1000) // 2 minutes cache
        
        return collectionData
      }
    } catch (error) {
      console.error('Get documents error:', error)
      errorHandlingService.handleFirestoreError(error, `getDocs(${collectionPath})`)
      
      // Return empty result instead of throwing to prevent app crashes
      return {
        docs: [],
        empty: true,
        size: 0
      }
    }
  }

  // Helper methods for common queries
  async where(field, operator, value) {
    // Always use Firebase Web SDK functions for consistency
    const { where } = await import('firebase/firestore')
    return where(field, operator, value)
  }

  async orderBy(field, direction = 'asc') {
    // Always use Firebase Web SDK functions for consistency
    const { orderBy } = await import('firebase/firestore')
    return orderBy(field, direction)
  }

  async limitToFirst(limitCount) {
    // Always use Firebase Web SDK functions for consistency
    const { limit } = await import('firebase/firestore')
    return limit(limitCount)
  }

  // Server timestamp helper
  serverTimestamp() {
    if (this.isNative) {
      // For iOS, use Firebase Web SDK functions
      return new Date().toISOString() // Fallback for native
    } else {
      return serverTimestamp()
    }
  }

  // Listen to document or collection changes (for real-time updates)
  async onSnapshot(path, callback) {
    try {
      // Determine if it's a document or collection path
      const isDocument = path.split('/').length % 2 === 0
      
      if (this.isNative) {
        await this.initialize()
        
        if (this.capacitorFirestore) {
          console.log('🔍 Setting up real-time listener for native platform:', path, 'Type:', isDocument ? 'document' : 'collection')
          
          // Use Capacitor Firebase plugin for real-time listening
          // For now, we'll implement a polling mechanism since Capacitor Firebase plugin
          // doesn't have direct onSnapshot equivalent
          
          let isListening = true
          let lastData = null
          
          const pollForChanges = async () => {
            if (!isListening) return
            
            try {
              if (isDocument) {
                // Use getDocument for document paths
                const result = await this.capacitorFirestore.getDocument({
                  reference: path
                })
                
                if (result && result.snapshot) {
                  // Only call callback if data has changed
                  const currentData = JSON.stringify(result.snapshot.data)
                  if (currentData !== lastData) {
                    lastData = currentData
                    
                    // Call callback with document data
                    callback({
                      id: result.snapshot.id,
                      data: () => result.snapshot.data,
                      exists: () => !!result.snapshot.data
                    })
                  }
                }
              } else {
                // Use getCollection for collection paths
                const result = await this.capacitorFirestore.getCollection({
                  reference: path
                })
                
                if (result && result.snapshots) {
                  // Only call callback if data has changed
                  const currentData = JSON.stringify(result.snapshots.map(s => s.data))
                  if (currentData !== lastData) {
                    lastData = currentData
                    
                    // Call callback with each document in the collection
                    result.snapshots.forEach(snapshot => {
                      callback({
                        id: snapshot.id,
                        data: () => snapshot.data,
                        exists: () => !!snapshot.data
                      })
                    })
                  }
                }
              }
              
              // Continue polling every 2 seconds
              setTimeout(pollForChanges, 2000)
            } catch (error) {
              console.error('Error polling for changes:', error)
              // Continue polling even on error
              setTimeout(pollForChanges, 5000)
            }
          }
          
          // Start polling
          pollForChanges()
          
          // Return unsubscribe function
          return () => {
            console.log('Unsubscribed from native listener')
            isListening = false
          }
        } else {
          console.warn('Capacitor Firestore not available for real-time listening')
          return () => {}
        }
      } else {
        // Use Web SDK for web platforms
        if (isDocument) {
          const docRef = doc(this.db, path)
          return onSnapshot(docRef, (docSnapshot) => {
            callback({
              id: docSnapshot.id,
              data: () => docSnapshot.data(),
              exists: () => docSnapshot.exists()
            })
          })
        } else {
          const collectionRef = collection(this.db, path)
          return onSnapshot(collectionRef, (snapshot) => {
            snapshot.docs.forEach(doc => {
              callback({
                id: doc.id,
                data: () => doc.data(),
                exists: () => doc.exists()
              })
            })
          })
        }
      }
    } catch (error) {
      console.error('Error setting up listener:', error)
      return () => {} // Return no-op unsubscribe function
    }
  }
}

// Create and export singleton instance
const firestoreService = new FirestoreService()
export default firestoreService