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
  serverTimestamp
} from 'firebase/firestore'

class FirestoreService {
  constructor() {
    this.isNative = isNative
    this.db = db
    this.auth = auth
    this.capacitorFirestore = null
    this.initialized = false
    this.activeListeners = new Map() // Track active listeners to prevent duplicates
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
    if (!this.isNative) return true

    try {
      console.log('🔐 FirestoreService: Ensuring authentication context...')

      // Import the authentication service
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')

      // Get the current user to ensure auth context is set
      const currentUser = await FirebaseAuthentication.getCurrentUser()

      if (currentUser.user) {
        console.log('✅ FirestoreService: Authentication context verified for user:', currentUser.user.uid)

        // Also check the optimized auth service for consistency
        try {
          const { optimizedAuthService } = await import('./optimizedAuthService')
          const optimizedUser = await optimizedAuthService.getCurrentUser()

          if (optimizedUser && optimizedUser.uid === currentUser.user.uid) {
            console.log('✅ FirestoreService: Authentication context is consistent between services')
          } else {
            console.warn('⚠️ FirestoreService: Authentication context mismatch between services')
          }
        } catch (authError) {
          console.warn('⚠️ FirestoreService: Could not verify with optimized auth service:', authError)
        }

        // iOS-specific: Longer delay to ensure auth context is fully propagated
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const delay = isIOS ? 500 : 200;
        await new Promise(resolve => setTimeout(resolve, delay))

        return true
      } else {
        console.warn('⚠️ FirestoreService: No authenticated user found')
        return false
      }
    } catch (error) {
      console.error('❌ FirestoreService: Failed to ensure authentication context:', error)

      // iOS-specific: Try fallback authentication check
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        try {
          console.log('📱 iOS: Trying fallback authentication check...')
          const { optimizedAuthService } = await import('./optimizedAuthService')
          const fallbackUser = await optimizedAuthService.getCurrentUser()

          if (fallbackUser && fallbackUser.uid) {
            console.log('✅ iOS: Fallback authentication successful for user:', fallbackUser.uid)
            return true
          }
        } catch (fallbackError) {
          console.warn('⚠️ iOS: Fallback authentication also failed:', fallbackError)
        }
      }

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

        // Serialize data for Capacitor (convert Date objects to ISO strings)
        const serializedData = this.serializeDataForCapacitor(data)

        // Convert serverTimestamp for native
        if (options.merge) {
          await this.capacitorFirestore.setDocument({
            reference: path,
            data: serializedData,
            merge: true
          })
        } else {
          await this.capacitorFirestore.setDocument({
            reference: path,
            data: serializedData
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

        // Serialize data for Capacitor (convert Date objects to ISO strings)
        const serializedData = this.serializeDataForCapacitor(data)

        await this.capacitorFirestore.updateDocument({
          reference: path,
          data: serializedData
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
  /**
   * Serialize data for Capacitor Firebase
   * Converts Date objects to ISO strings and handles nested objects
   */
  serializeDataForCapacitor(data) {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.serializeDataForCapacitor(item));
    }

    if (typeof data === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeDataForCapacitor(value);
      }
      return serialized;
    }

    return data;
  }

  async addDoc(collectionPath, data) {
    try {
      console.log('🔍 FirestoreService.addDoc called:', { collectionPath, dataKeys: Object.keys(data) });

      if (this.isNative) {
        console.log('🔍 Using native Capacitor Firebase for addDoc...');
        await this.initialize()

        // Serialize data for Capacitor (convert Date objects to ISO strings)
        const serializedData = this.serializeDataForCapacitor(data);
        console.log('🔍 Data serialized for Capacitor');

        console.log('🔍 Calling capacitorFirestore.addDocument...');

        // Add timeout to prevent hanging
        const timeoutMs = 15000; // 15 seconds
        const addDocPromise = this.capacitorFirestore.addDocument({
          reference: collectionPath,
          data: serializedData
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('addDocument operation timed out')), timeoutMs)
        );

        const result = await Promise.race([addDocPromise, timeoutPromise]);

        console.log('✅ Native addDoc result:', result);

        // Invalidate cache for this collection to ensure fresh reads
        cacheService.invalidatePattern(`collection:${collectionPath}`);

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

        // Invalidate cache for this collection to ensure fresh reads
        cacheService.invalidatePattern(`collection:${collectionPath}`);

        return {
          id: docRef.id,
          documentId: docRef.id // Add documentId for compatibility
        }
      }
    } catch (error) {
      console.error('❌ Add document error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      })
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
        const authContextValid = await this.ensureAuthContext()
        console.log('🔐 FirestoreService: Auth context valid:', authContextValid)

        if (!authContextValid) {
          console.warn('⚠️ FirestoreService: Authentication context invalid, but proceeding with query')
        }

        // For fines and complaints collections, use Web SDK directly on iOS to avoid auth issues
        if (collectionPath.includes('/fines') || collectionPath.includes('/complaints')) {
          console.log('🔄 FirestoreService: Using Web SDK directly for', collectionPath.includes('/fines') ? 'fines' : 'complaints', 'collection (iOS compatibility)')

          try {
            const { collection, query, getDocs, where, orderBy, limit } = await import('firebase/firestore')
            const { db } = await import('../boot/firebase')

            console.log('🔍 FirestoreService: Web SDK imports successful, db instance:', !!db)
            console.log('🔍 FirestoreService: Web SDK db type:', typeof db)
            console.log('🔍 FirestoreService: Web SDK db app:', db?.app?.name)

            const colRef = collection(db, collectionPath)
            let queryConstraints = []

            // Apply filters
            if (queryOptions && queryOptions.filters) {
              queryOptions.filters.forEach(filter => {
                queryConstraints.push(where(filter.field, filter.operator, filter.value))
              })
            }

            // Apply ordering
            if (queryOptions && queryOptions.orderBy) {
              if (Array.isArray(queryOptions.orderBy)) {
                queryOptions.orderBy.forEach(order => {
                  queryConstraints.push(orderBy(order.field, order.direction))
                })
              } else {
                queryConstraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction))
              }
            }

            // Apply limit
            if (queryOptions && queryOptions.limit) {
              queryConstraints.push(limit(queryOptions.limit))
            }

            const q = query(colRef, ...queryConstraints)
            console.log('🔍 FirestoreService: Executing Web SDK query with constraints:', queryConstraints.length)
            console.log('🔍 FirestoreService: Query constraints details:', queryConstraints.map(c => ({ field: c.field, operator: c.operator, value: c.value })))

            // Add timeout for Web SDK query (increased timeout for iOS compatibility)
            const webSDKTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Web SDK query timeout')), Math.min(timeoutMs, 15000)) // Maximum 15 seconds for iOS
            })

            console.log('🔍 FirestoreService: Starting Web SDK query execution...')
            const startTime = Date.now()

            const querySnapshot = await Promise.race([
              getDocs(q),
              webSDKTimeoutPromise
            ])

            const executionTime = Date.now() - startTime
            console.log('🔍 FirestoreService: Web SDK query completed, snapshot size:', querySnapshot.size, 'execution time:', executionTime + 'ms')

            const docs = querySnapshot.docs.map(doc => ({
              id: doc.id,
              data: () => doc.data()
            }))

            const collectionData = {
              docs,
              empty: docs.length === 0,
              size: docs.length
            }

            console.log('✅ FirestoreService: Web SDK query successful for', collectionPath.includes('/fines') ? 'fines' : 'complaints', ':', { empty: collectionData.empty, size: collectionData.size })

            // Cache the result
            cacheService.set(cacheKey, collectionData, 2 * 60 * 1000) // 2 minutes cache

            return collectionData
          } catch (webSDKError) {
            console.warn('⚠️ FirestoreService: Web SDK query failed for', collectionPath.includes('/fines') ? 'fines' : 'complaints', ':', webSDKError.message)

              // If Web SDK fails, try Capacitor Firebase as fallback
              console.log('🔄 FirestoreService: Falling back to Capacitor Firebase for', collectionPath.includes('/fines') ? 'fines' : 'complaints')

              try {
                const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')

                console.log('🔍 FirestoreService: Using Capacitor Firebase fallback for', collectionPath)

                const result = await FirebaseFirestore.getCollection({
                  reference: collectionPath,
                  compositeFilter: queryOptions?.filters ? {
                    filters: queryOptions.filters.map(filter => ({
                      fieldPath: filter.field,
                      op: filter.operator,
                      value: { stringValue: filter.value }
                    }))
                  } : undefined,
                  orderBy: queryOptions?.orderBy ? [{
                    fieldPath: queryOptions.orderBy.field,
                    direction: queryOptions.orderBy.direction
                  }] : undefined,
                  limit: queryOptions?.limit || 100
                })

                console.log('✅ FirestoreService: Capacitor Firebase fallback successful:', { empty: result.snapshots.length === 0, size: result.snapshots.length })

                const collectionData = {
                  docs: result.snapshots.map(doc => ({
                    id: doc.id,
                    data: () => doc.data
                  })),
                  empty: result.snapshots.length === 0,
                  size: result.snapshots.length
                }

                // Cache the fallback result
                cacheService.set(cacheKey, collectionData, 2 * 60 * 1000) // 2 minutes cache

                return collectionData
              } catch (capacitorError) {
                console.error('❌ FirestoreService: Both Web SDK and Capacitor Firebase failed for', collectionPath.includes('/fines') ? 'fines' : 'complaints', ':', capacitorError.message)

                // Return empty result as final fallback
                const emptyResult = {
                  docs: [],
                  empty: true,
                  size: 0
                }

                // Cache empty result for shorter time
                cacheService.set(cacheKey, emptyResult, 30 * 1000) // 30 seconds cache

                return emptyResult
              }
            }
          }

          // Use Capacitor Firebase Firestore plugin for other collections
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
  async onSnapshot(path) {
      try {
        console.log('🔍 onSnapshot called for path:', path)

        // For now, return a simple no-op unsubscribe function to prevent issues
        // TODO: Implement proper real-time listening later
        console.log('⚠️ onSnapshot temporarily disabled to prevent app hanging')
        return () => {
          console.log('Unsubscribed from listener (no-op)')
        }

      } catch (error) {
        console.error('Error setting up listener:', error)
        return () => { } // Return no-op unsubscribe function
      }
    }
  }

  // Create and export singleton instance
  const firestoreService = new FirestoreService()
export default firestoreService