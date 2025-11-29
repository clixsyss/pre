import { db, isNative } from '../boot/firebase'

class UnifiedFirestoreService {
  constructor() {
    this.isNative = isNative
    this.webDb = db
    this.capacitorFirestore = null
    this.initialized = false
  }

  async initialize() {
    if (this.isNative && !this.initialized) {
      try {
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        this.capacitorFirestore = FirebaseFirestore
        this.initialized = true
        console.log('UnifiedFirestoreService: Capacitor Firebase Firestore initialized')
      } catch (error) {
        console.error('UnifiedFirestoreService: Failed to initialize Capacitor Firebase Firestore:', error)
        throw error
      }
    }
  }

  // Get a single document
  async getDoc(path) {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorFirestore.getDocument({
          reference: path
        })
        
        return {
          exists: () => result.snapshot?.data ? true : false,
          data: () => result.snapshot?.data || {},
          id: result.snapshot?.id || path.split('/').pop()
        }
      } else {
        // Use Web SDK
        const { doc, getDoc } = await import('firebase/firestore')
        const docRef = doc(this.webDb, path)
        return await getDoc(docRef)
      }
    } catch (error) {
      console.error('Get document error:', error)
      throw error
    }
  }

  // Get documents from collection
  async getDocs(collectionPath, queryConstraints = []) {
    try {
      if (this.isNative) {
        await this.initialize()
        
        // For Capacitor plugin, we need to convert query constraints
        const nativeQuery = {
          reference: collectionPath
        }

        // Add where clauses
        const whereClauses = queryConstraints.filter(c => c._type === 'where')
        if (whereClauses.length > 0) {
          nativeQuery.where = whereClauses.map(w => ({
            fieldPath: w.field.segments[0], // Get the field name from segments
            opStr: w.op, // '==', '!=', '<', etc.
            value: w.value
          }))
        }

        // Add order by
        const orderByClause = queryConstraints.find(c => c._type === 'orderBy')
        if (orderByClause) {
          nativeQuery.orderBy = [{
            fieldPath: orderByClause.field.segments[0],
            direction: orderByClause.direction
          }]
        }

        // Add limit
        const limitClause = queryConstraints.find(c => c._type === 'limit')
        if (limitClause) {
          nativeQuery.limit = limitClause.limitCount
        }

        const result = await this.capacitorFirestore.getDocuments(nativeQuery)
        
        return {
          docs: result.snapshots?.map(snapshot => ({
            exists: () => snapshot.data ? true : false,
            data: () => snapshot.data || {},
            id: snapshot.id
          })) || [],
          empty: (result.snapshots?.length || 0) === 0,
          size: result.snapshots?.length || 0
        }
      } else {
        // Use Web SDK
        const { collection, query, getDocs } = await import('firebase/firestore')
        const colRef = collection(this.webDb, collectionPath)
        const q = query(colRef, ...queryConstraints)
        return await getDocs(q)
      }
    } catch (error) {
      console.error('Get documents error:', error)
      throw error
    }
  }

  // Set a document
  async setDoc(path, data, options = {}) {
    try {
      if (this.isNative) {
        await this.initialize()
        await this.capacitorFirestore.setDocument({
          reference: path,
          data: data,
          merge: options.merge || false
        })
      } else {
        const { doc, setDoc } = await import('firebase/firestore')
        const docRef = doc(this.webDb, path)
        await setDoc(docRef, data, options)
      }
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
          data: data
        })
      } else {
        const { doc, updateDoc } = await import('firebase/firestore')
        const docRef = doc(this.webDb, path)
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
        const { doc, deleteDoc } = await import('firebase/firestore')
        const docRef = doc(this.webDb, path)
        await deleteDoc(docRef)
      }
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  }

  // Add a document to a collection
  async addDoc(collectionPath, data) {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorFirestore.addDocument({
          reference: collectionPath,
          data: data
        })
        return { id: result.id }
      } else {
        const { collection, addDoc } = await import('firebase/firestore')
        const colRef = collection(this.webDb, collectionPath)
        return await addDoc(colRef, data)
      }
    } catch (error) {
      console.error('Add document error:', error)
      throw error
    }
  }

  // Helper methods for query constraints
  where(field, operator, value) {
    return { _type: 'where', field: { segments: [field] }, op: operator, value }
  }

  orderBy(field, direction = 'asc') {
    return { _type: 'orderBy', field: { segments: [field] }, direction }
  }

  limitToFirst(limitCount) {
    return { _type: 'limit', limitCount }
  }

  // Server timestamp
  serverTimestamp() {
    if (this.isNative) {
      // For Capacitor, we might need to handle this differently
      // For now, return current timestamp
      return new Date().toISOString()
    } else {
      const { serverTimestamp } = require('firebase/firestore')
      return serverTimestamp()
    }
  }

  // Real-time listeners
  async onSnapshot(path, callback, errorCallback) {
    try {
      if (this.isNative) {
        await this.initialize()
        
        // Determine if it's a document or collection
        const isDocument = path.split('/').length % 2 === 0
        
        if (isDocument) {
          // Document listener
          const listener = await this.capacitorFirestore.addSnapshotListener({
            reference: path,
            callback: (result) => {
              const snapshot = {
                exists: () => result.snapshot?.data ? true : false,
                data: () => result.snapshot?.data || {},
                id: result.snapshot?.id || path.split('/').pop()
              }
              callback(snapshot)
            }
          })
          return listener
        } else {
          // Collection listener
          const listener = await this.capacitorFirestore.addSnapshotListener({
            reference: path,
            callback: (result) => {
              const querySnapshot = {
                docs: result.snapshots?.map(snapshot => ({
                  exists: () => snapshot.data ? true : false,
                  data: () => snapshot.data || {},
                  id: snapshot.id
                })) || [],
                empty: (result.snapshots?.length || 0) === 0,
                size: result.snapshots?.length || 0
              }
              callback(querySnapshot)
            }
          })
          return listener
        }
      } else {
        // Use Web SDK
        const { doc, collection, onSnapshot } = await import('firebase/firestore')
        
        // Determine if it's a document or collection
        const isDocument = path.split('/').length % 2 === 0
        
        if (isDocument) {
          const docRef = doc(this.webDb, path)
          return onSnapshot(docRef, callback, errorCallback)
        } else {
          const colRef = collection(this.webDb, path)
          return onSnapshot(colRef, callback, errorCallback)
        }
      }
    } catch (error) {
      console.error('Snapshot listener error:', error)
      if (errorCallback) errorCallback(error)
      throw error
    }
  }

  // Unsubscribe from listener
  async unsubscribe(listener) {
    try {
      if (this.isNative) {
        await this.initialize()
        await this.capacitorFirestore.removeSnapshotListener({
          callbackId: listener.callbackId
        })
      } else {
        // Web SDK listener is a function, call it to unsubscribe
        listener()
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const unifiedFirestoreService = new UnifiedFirestoreService()
export default unifiedFirestoreService
