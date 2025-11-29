/**
 * FirestoreService - NOW USES DYNAMODB ONLY
 * 
 * This service maintains the same API as before but uses DynamoDB exclusively.
 * All Firebase/Firestore code has been removed.
 * 
 * IMPORTANT: This service now ONLY uses DynamoDB. No Firebase fallbacks.
 */

import errorHandlingService from './errorHandlingService'
import cacheService from './cacheService'
import dynamoDBAdapter from './dynamoDBAdapter'

class FirestoreService {
  constructor() {
    this.initialized = true // Always initialized since we don't need Firebase
  }

  /**
   * Get a single document
   * @param {string} path - Document path (e.g., 'projects/proj123' or 'users/user123')
   * @param {Object} options - Options (useCache, etc.)
   * @returns {Promise<Object>} Document snapshot with exists() and data() methods
   */
  async getDoc(path, options = {}) {
    try {
      const { useCache = true } = options
      
      console.log('🔍 FirestoreService.getDoc (DynamoDB only):', path)

      // Check cache first
      if (useCache) {
        const cachedData = cacheService.get(path)
        if (cachedData) {
          console.log('✅ FirestoreService: Using cached document:', path)
          return {
            exists: () => true,
            data: () => cachedData,
            id: path.split('/').pop()
          }
        }
      }

      // Use DynamoDB adapter
      const result = await dynamoDBAdapter.getDoc(path)
      
      // Cache the result
      if (useCache && result.exists()) {
        cacheService.set(path, result.data(), 2 * 60 * 1000) // 2 minutes cache
      }
      
      return result
    } catch (error) {
      console.error('❌ FirestoreService.getDoc error:', error)
      errorHandlingService.handleFirestoreError(error, 'getDoc', { path })
      
      // Return empty document on error (maintains API compatibility)
      return {
        exists: () => false,
        data: () => null,
        id: path.split('/').pop()
      }
    }
  }

  /**
   * Get documents from collection
   * @param {string} collectionPath - Collection path (e.g., 'projects' or 'projects/proj123/news')
   * @param {Object} queryOptions - Query options (constraints, limit, etc.)
   * @returns {Promise<Object>} Query snapshot with docs array
   */
  async getDocs(collectionPath, queryOptions = {}) {
    try {
      const { skipCache = false } = queryOptions

      console.log('🔍 FirestoreService.getDocs (DynamoDB only):', collectionPath)

      // Check cache first
      if (!skipCache) {
        // eslint-disable-next-line no-unused-vars
        const { skipCache: _, ...queryParamsWithoutSkipCache } = queryOptions || {}
        const queryParams = Object.keys(queryParamsWithoutSkipCache).length > 0 
          ? JSON.stringify(queryParamsWithoutSkipCache) 
          : 'no-params'
        const cacheKey = `collection:${collectionPath}:${queryParams}`
        
        const cachedData = cacheService.get(cacheKey)
        if (cachedData) {
          console.log('✅ FirestoreService: Using cached collection data:', collectionPath)
          return {
            docs: cachedData.docs || [],
            empty: cachedData.empty || false,
            size: cachedData.size || 0,
          }
        }
      }

      // Use DynamoDB adapter
      const result = await dynamoDBAdapter.getDocs(collectionPath, queryOptions)
      
      // Cache the result
      if (!skipCache) {
        // eslint-disable-next-line no-unused-vars
        const { skipCache: _, ...queryParamsWithoutSkipCache } = queryOptions || {}
        const queryParams = Object.keys(queryParamsWithoutSkipCache).length > 0 
          ? JSON.stringify(queryParamsWithoutSkipCache) 
          : 'no-params'
        const cacheKey = `collection:${collectionPath}:${queryParams}`
        cacheService.set(cacheKey, result, 2 * 60 * 1000) // 2 minutes cache
      }
      
      console.log('✅ FirestoreService: DynamoDB query successful:', {
        empty: result.empty,
        size: result.size
      })
      
      return result
    } catch (error) {
      console.error('❌ FirestoreService.getDocs error:', error)
      errorHandlingService.handleFirestoreError(error, 'getDocs')
      
      // Return empty result on error (maintains API compatibility)
      return {
        docs: [],
        empty: true,
        size: 0
      }
    }
  }

  /**
   * Subscribe to a query for real-time updates (stub for DynamoDB)
   * Note: DynamoDB doesn't support real-time subscriptions like Firestore.
   * This method provides a stub that returns a no-op unsubscribe function.
   * For real-time updates, consider using polling or AWS AppSync.
   * @param {string} collectionPath - Collection path
   * @param {Object} queryOptions - Query options
   * @param {Function} onSnapshot - Callback function
   * @param {Function} onError - Error callback
   * @returns {Function} Unsubscribe function (no-op)
   */
  subscribeToQuery() {
    console.warn('⚠️ FirestoreService.subscribeToQuery: Real-time subscriptions not supported with DynamoDB. Use polling instead.')
    
    // Return a no-op unsubscribe function
    return () => {
      console.log('Unsubscribed from query (no-op for DynamoDB)')
    }
  }

  /**
   * Subscribe to real-time updates using polling (DynamoDB-compatible)
   * Note: DynamoDB doesn't support real-time subscriptions like Firestore.
   * This method uses polling to simulate real-time updates.
   * @param {string} path - Document or collection path
   * @param {Object|Function} queryOptionsOrCallback - Query options (for collections) or callback (for documents)
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onSnapshot(path, queryOptionsOrCallback, callback) {
    console.log('🔔 FirestoreService.onSnapshot: Setting up polling subscription for:', path)
    
    // Handle different call signatures:
    // - onSnapshot(docPath, callback) - for documents
    // - onSnapshot(collectionPath, queryOptions, callback) - for collections
    let queryOptions = null
    let onSnapshotCallback = null
    
    if (typeof queryOptionsOrCallback === 'function') {
      // Document subscription: onSnapshot(path, callback)
      onSnapshotCallback = queryOptionsOrCallback
    } else {
      // Collection subscription: onSnapshot(path, queryOptions, callback)
      queryOptions = queryOptionsOrCallback
      onSnapshotCallback = callback
    }
    
    if (!onSnapshotCallback) {
      console.error('❌ FirestoreService.onSnapshot: Callback function is required')
      return () => {}
    }
    
    // Determine if this is a document or collection path
    const isDocument = path.split('/').length % 2 === 0 // Documents have even number of segments
    
    let pollingInterval = null
    let lastData = null
    const POLL_INTERVAL = 2000 // Poll every 2 seconds
    
    const poll = async () => {
      try {
        if (isDocument) {
          // Poll document
          const result = await this.getDoc(path, { useCache: false })
          const exists = result.exists()
          const currentData = exists ? { id: result.id, ...result.data() } : null
          
          // Create snapshot-like object with data spread at top level (for compatibility)
          const snapshot = exists ? {
            ...currentData,
            exists: () => true,
            data: () => currentData,
            id: result.id
          } : {
            exists: () => false,
            data: () => undefined,
            id: result.id
          }
          
          // Only call callback if data changed
          if (JSON.stringify(currentData) !== JSON.stringify(lastData)) {
            lastData = currentData
            onSnapshotCallback(snapshot)
          }
        } else {
          // Poll collection
          const result = await this.getDocs(path, { ...queryOptions, skipCache: true })
          const docs = (result.docs || result).map(doc => ({
            id: doc.id,
            ...(typeof doc.data === 'function' ? doc.data() : doc.data || doc)
          }))
          
          // Only call callback if data changed
          const currentDataStr = JSON.stringify(docs)
          if (currentDataStr !== JSON.stringify(lastData)) {
            lastData = docs
            // Create a snapshot-like object with forEach method
            const snapshot = {
              docs: docs,
              forEach: (callback) => {
                docs.forEach((doc, index) => {
                  callback({
                    id: doc.id,
                    data: () => doc
                  }, index)
                })
              }
            }
            onSnapshotCallback(snapshot)
          }
        }
      } catch (error) {
        console.error('❌ FirestoreService.onSnapshot: Polling error:', error)
      }
    }
    
    // Start polling immediately
    poll()
    
    // Set up interval
    pollingInterval = setInterval(poll, POLL_INTERVAL)
    
    // Return unsubscribe function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        console.log('🔔 FirestoreService.onSnapshot: Unsubscribed from', path)
      }
    }
  }

  /**
   * Set/update a document
   * @param {string} path - Document path
   * @param {Object} data - Document data
   * @param {Object} options - Options (merge, etc.)
   * @returns {Promise<void>}
   */
  async setDoc(path, data, options = {}) {
    try {
      console.log('💾 FirestoreService.setDoc (DynamoDB only):', path)
      
      // Use DynamoDB adapter
      await dynamoDBAdapter.setDoc(path, data, options)
      
      // Clear cache for this document
      cacheService.delete(path)
      
      console.log('✅ FirestoreService: Document saved to DynamoDB:', path)
    } catch (error) {
      console.error('❌ FirestoreService.setDoc error:', error)
      errorHandlingService.handleFirestoreError(error, 'setDoc', { path })
      throw error
    }
  }

  /**
   * Update a document
   * @param {string} path - Document path
   * @param {Object} data - Update data
   * @returns {Promise<void>}
   */
  async updateDoc(path, data) {
    try {
      console.log('🔄 FirestoreService.updateDoc (DynamoDB only):', path)
      
      // Use DynamoDB adapter
      await dynamoDBAdapter.updateDoc(path, data)
      
      // Clear cache for this document
      cacheService.delete(path)
      
      console.log('✅ FirestoreService: Document updated in DynamoDB:', path)
    } catch (error) {
      console.error('❌ FirestoreService.updateDoc error:', error)
      errorHandlingService.handleFirestoreError(error, 'updateDoc', { path })
      throw error
    }
  }

  /**
   * Delete a document
   * @param {string} path - Document path
   * @returns {Promise<void>}
   */
  async deleteDoc(path) {
    try {
      console.log('🗑️ FirestoreService.deleteDoc (DynamoDB only):', path)
      
      // Use DynamoDB adapter
      await dynamoDBAdapter.deleteDoc(path)
      
      // Clear cache for this document
      cacheService.delete(path)
      
      console.log('✅ FirestoreService: Document deleted from DynamoDB:', path)
    } catch (error) {
      console.error('❌ FirestoreService.deleteDoc error:', error)
      errorHandlingService.handleFirestoreError(error, 'deleteDoc', { path })
      throw error
    }
  }

  /**
   * Add a new document (auto-generates ID)
   * @param {string} collectionPath - Collection path
   * @param {Object} data - Document data
   * @returns {Promise<string>} Generated document ID
   */
  async addDoc(collectionPath, data) {
    try {
      console.log('➕ FirestoreService.addDoc (DynamoDB only):', collectionPath)
      
      // Use DynamoDB adapter
      const result = await dynamoDBAdapter.addDoc(collectionPath, data)
      
      // Clear cache for this collection
      cacheService.delete(`collection:${collectionPath}`)
      
      // Return result in format expected by calling code
      // result is { id, documentId } from dynamoDBAdapter
      const docId = result?.id || result?.documentId || result
      console.log('✅ FirestoreService: Document added to DynamoDB:', docId)
      return { id: docId, documentId: docId }
    } catch (error) {
      console.error('❌ FirestoreService.addDoc error:', error)
      errorHandlingService.handleFirestoreError(error, 'addDoc', { collectionPath })
      throw error
    }
  }

  /**
   * Initialize (no-op for DynamoDB, maintained for API compatibility)
   */
  async initialize() {
    this.initialized = true
    return Promise.resolve()
  }

  /**
   * Ensure auth context (no-op for DynamoDB, maintained for API compatibility)
   */
  async ensureAuthContext() {
    return Promise.resolve(true)
  }

  /**
   * Check if iOS native (no-op, maintained for API compatibility)
   */
  async isIOSNative() {
    return false
  }
}

// Export singleton instance
export default new FirestoreService()
