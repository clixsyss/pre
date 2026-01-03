import { smartMirrorDb as db, detectPlatformFromUrl } from '../boot/smartMirrorFirebase'
const { isNative } = detectPlatformFromUrl()
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore
} from 'firebase/firestore'

class CollectionQueryService {
  constructor() {
    this.isNative = isNative
    this.db = db
    this.initialized = false
  }

  async ensureInitialized() {
    if (this.isNative && !this.initialized) {
      try {
        // Wait a bit for Capacitor Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Ensure we have a valid db instance
        if (!this.db) {
          console.warn('CollectionQueryService: Firebase Web SDK db not available, trying to reinitialize...')
          // Try to reinitialize Firebase Web SDK
          const { getFirestore } = await import('firebase/firestore')
          const { smartMirrorApp } = await import('../boot/smartMirrorFirebase')
          this.db = getFirestore(smartMirrorApp)
          console.log('CollectionQueryService: Reinitialized Firebase Web SDK db')
        }
        
        this.initialized = true
        console.log('CollectionQueryService: Initialized for native platform')
      } catch (error) {
        console.error('CollectionQueryService: Initialization error:', error)
      }
    }
  }

  /**
   * Get all documents from a collection using Firebase Web SDK
   * This method always uses Web SDK for collection queries since Capacitor plugin doesn't support getDocuments
   * @param {string} collectionPath - The collection path (e.g., 'projects/projectId/ads')
   * @param {Array} queryConstraints - Array of query constraints (where, orderBy, limit, etc.)
   * @returns {Promise<QuerySnapshot>} Firebase QuerySnapshot
   */
  async getCollectionDocs(collectionPath, queryConstraints = []) {
    try {
      await this.ensureInitialized()
      
      console.log('CollectionQueryService: Getting collection docs for:', collectionPath)
      console.log('CollectionQueryService: Query constraints:', queryConstraints)
      console.log('CollectionQueryService: DB instance available:', !!this.db)
      
      // Check if db is available
      if (!this.db) {
        console.warn('CollectionQueryService: Firebase Web SDK db instance not available, returning empty result')
        return {
          docs: [],
          empty: true,
          size: 0
        }
      }
      
      console.log('CollectionQueryService: Creating collection reference...')
      const colRef = collection(this.db, collectionPath)
      
      console.log('CollectionQueryService: Creating query...')
      const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef
      
      console.log('CollectionQueryService: Executing getDocs...')
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      })
      
      const queryPromise = getDocs(q)
      
      const snapshot = await Promise.race([queryPromise, timeoutPromise])
      
      console.log('CollectionQueryService: Successfully retrieved', snapshot.docs.length, 'documents')
      return snapshot
    } catch (error) {
      console.error('CollectionQueryService: Error getting collection docs:', error)
      console.error('CollectionQueryService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      
      // Try fallback with Capacitor Firebase plugin
      if (this.isNative) {
        console.log('CollectionQueryService: Trying fallback with Capacitor Firebase plugin...')
        try {
          const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
          
          // For queries with constraints, we'll get all documents and filter client-side
          // This is not ideal but better than no data
          const result = await FirebaseFirestore.getDocuments({
            reference: collectionPath
          })
          
          console.log('CollectionQueryService: Fallback got', result.documents.length, 'documents, applying client-side filtering...')
          
          // Apply client-side filtering based on constraints
          let filteredDocs = result.documents
          
          // Apply where constraints
          queryConstraints.forEach(constraint => {
            if (constraint.type === 'where') {
              const field = constraint._field.segments[0]
              const operator = constraint._op
              const value = constraint._value
              
              filteredDocs = filteredDocs.filter(doc => {
                const docValue = doc.data[field]
                switch (operator) {
                  case '==':
                    return docValue === value
                  case '!=':
                    return docValue !== value
                  case '<':
                    return docValue < value
                  case '<=':
                    return docValue <= value
                  case '>':
                    return docValue > value
                  case '>=':
                    return docValue >= value
                  default:
                    return true
                }
              })
            }
          })
          
          // Apply orderBy constraints
          queryConstraints.forEach(constraint => {
            if (constraint.type === 'orderBy') {
              const field = constraint._field.segments[0]
              const direction = constraint._direction
              
              filteredDocs.sort((a, b) => {
                const aVal = a.data[field]
                const bVal = b.data[field]
                
                if (aVal < bVal) return direction === 'asc' ? -1 : 1
                if (aVal > bVal) return direction === 'asc' ? 1 : -1
                return 0
              })
            }
          })
          
          // Apply limit constraints
          queryConstraints.forEach(constraint => {
            if (constraint.type === 'limit') {
              const limit = constraint._limit
              filteredDocs = filteredDocs.slice(0, limit)
            }
          })
          
          console.log('CollectionQueryService: Fallback successful, filtered to', filteredDocs.length, 'documents')
          return {
            docs: filteredDocs.map(doc => ({
              id: doc.id,
              data: () => doc.data,
              exists: () => true
            })),
            empty: filteredDocs.length === 0,
            size: filteredDocs.length
          }
        } catch (fallbackError) {
          console.error('CollectionQueryService: Fallback also failed:', fallbackError)
        }
      }
      
      // Return empty result instead of throwing to prevent white screen
      console.warn('CollectionQueryService: Returning empty result due to error')
      return {
        docs: [],
        empty: true,
        size: 0
      }
    }
  }

  /**
   * Get documents with a where clause
   * @param {string} collectionPath - The collection path
   * @param {string} field - Field to filter on
   * @param {string} operator - Comparison operator ('==', '!=', '<', '<=', '>', '>=', 'array-contains', etc.)
   * @param {*} value - Value to compare against
   * @param {Array} additionalConstraints - Additional query constraints
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsWhere(collectionPath, field, operator, value, additionalConstraints = []) {
    try {
      await this.ensureInitialized()
      const whereConstraint = where(field, operator, value)
      const constraints = [whereConstraint, ...additionalConstraints]
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsWhere:', error)
      throw error
    }
  }

  /**
   * Get documents ordered by a field
   * @param {string} collectionPath - The collection path
   * @param {string} field - Field to order by
   * @param {string} direction - 'asc' or 'desc'
   * @param {Array} additionalConstraints - Additional query constraints
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsOrderedBy(collectionPath, field, direction = 'asc', additionalConstraints = []) {
    try {
      const orderByConstraint = orderBy(field, direction)
      const constraints = [orderByConstraint, ...additionalConstraints]
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsOrderedBy:', error)
      throw error
    }
  }

  /**
   * Get documents with limit
   * @param {string} collectionPath - The collection path
   * @param {number} limitCount - Maximum number of documents to return
   * @param {Array} additionalConstraints - Additional query constraints
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsLimited(collectionPath, limitCount, additionalConstraints = []) {
    try {
      const limitConstraint = limit(limitCount)
      const constraints = [limitConstraint, ...additionalConstraints]
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsLimited:', error)
      throw error
    }
  }

  /**
   * Get documents with pagination (startAfter)
   * @param {string} collectionPath - The collection path
   * @param {*} lastDoc - The last document from previous page
   * @param {Array} additionalConstraints - Additional query constraints
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsPaginated(collectionPath, lastDoc, additionalConstraints = []) {
    try {
      const startAfterConstraint = startAfter(lastDoc)
      const constraints = [startAfterConstraint, ...additionalConstraints]
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsPaginated:', error)
      throw error
    }
  }

  /**
   * Get documents with range (startAfter and endBefore)
   * @param {string} collectionPath - The collection path
   * @param {*} startDoc - Starting document
   * @param {*} endDoc - Ending document
   * @param {Array} additionalConstraints - Additional query constraints
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsInRange(collectionPath, startDoc, endDoc, additionalConstraints = []) {
    try {
      const startAfterConstraint = startAfter(startDoc)
      const endBeforeConstraint = endBefore(endDoc)
      const constraints = [startAfterConstraint, endBeforeConstraint, ...additionalConstraints]
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsInRange:', error)
      throw error
    }
  }

  /**
   * Helper method to create common query constraints
   */
  createConstraints(options = {}) {
    const constraints = []

    // Add where clauses
    if (options.where) {
      options.where.forEach(w => {
        constraints.push(where(w.field, w.operator, w.value))
      })
    }

    // Add order by
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'))
    }

    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    // Add startAfter for pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter))
    }

    // Add endBefore for range queries
    if (options.endBefore) {
      constraints.push(endBefore(options.endBefore))
    }

    return constraints
  }

  /**
   * Get documents with a complex query using options object
   * @param {string} collectionPath - The collection path
   * @param {Object} options - Query options
   * @param {Array} options.where - Array of where clauses [{field, operator, value}]
   * @param {Object} options.orderBy - Order by options {field, direction}
   * @param {number} options.limit - Limit number of results
   * @param {*} options.startAfter - Start after this document (pagination)
   * @param {*} options.endBefore - End before this document (range)
   * @returns {Promise<QuerySnapshot>}
   */
  async getDocsWithOptions(collectionPath, options = {}) {
    try {
      await this.ensureInitialized()
      const constraints = this.createConstraints(options)
      return await this.getCollectionDocs(collectionPath, constraints)
    } catch (error) {
      console.error('CollectionQueryService: Error in getDocsWithOptions:', error)
      throw error
    }
  }

  /**
   * Listen to collection changes in real-time
   * @param {string} collectionPath - The collection path
   * @param {Function} callback - Callback function for changes
   * @param {Function} errorCallback - Error callback
   * @param {Array} queryConstraints - Query constraints
   * @returns {Function} Unsubscribe function
   */
  onCollectionSnapshot(collectionPath, callback, errorCallback, queryConstraints = []) {
    try {
      console.log('CollectionQueryService: Setting up real-time listener for:', collectionPath)
      
      const colRef = collection(this.db, collectionPath)
      const q = query(colRef, ...queryConstraints)
      
      // Import onSnapshot dynamically to avoid issues
      return import('firebase/firestore').then(({ onSnapshot }) => {
        return onSnapshot(q, callback, errorCallback)
      })
    } catch (error) {
      console.error('CollectionQueryService: Error setting up collection listener:', error)
      if (errorCallback) errorCallback(error)
      throw error
    }
  }
}

// Create and export singleton instance
const collectionQueryService = new CollectionQueryService()
export default collectionQueryService
