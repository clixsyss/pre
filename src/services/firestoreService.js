import { db, isNative } from '../boot/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore'

class FirestoreService {
  constructor() {
    this.isNative = isNative
    this.db = db
    this.capacitorFirestore = null
    this.initialized = false
  }

  async initialize() {
    if (this.isNative && !this.initialized) {
      try {
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        this.capacitorFirestore = FirebaseFirestore
        this.initialized = true
        console.log('FirestoreService: Capacitor Firebase Firestore initialized')
      } catch (error) {
        console.error('FirestoreService: Failed to initialize Capacitor Firebase Firestore:', error)
      }
    }
  }

  // Get a document
  async getDoc(path) {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorFirestore.getDocument({
          reference: path
        })
        return {
          exists: () => result.snapshot.exists,
          data: () => result.snapshot.data,
          id: result.snapshot.id
        }
      } else {
        const docRef = doc(this.db, path)
        return await getDoc(docRef)
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
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorFirestore.addDocument({
          reference: collectionPath,
          data
        })
        return {
          id: result.id
        }
      } else {
        const collectionRef = collection(this.db, collectionPath)
        return await addDoc(collectionRef, data)
      }
    } catch (error) {
      console.error('Add document error:', error)
      throw error
    }
  }

  // Get documents from collection
  async getDocs(collectionPath, queryConstraints = []) {
    try {
      if (this.isNative) {
        await this.initialize()
        
        // Convert query constraints to native format
        const nativeQuery = {
          reference: collectionPath
        }

        // Add where clauses
        const whereClauses = queryConstraints.filter(c => c.type === 'where')
        if (whereClauses.length > 0) {
          nativeQuery.where = whereClauses.map(w => ({
            fieldPath: w.field,
            opStr: w.operator,
            value: w.value
          }))
        }

        // Add order by
        const orderByClause = queryConstraints.find(c => c.type === 'orderBy')
        if (orderByClause) {
          nativeQuery.orderBy = [{
            fieldPath: orderByClause.field,
            direction: orderByClause.direction
          }]
        }

        // Add limit
        const limitClause = queryConstraints.find(c => c.type === 'limit')
        if (limitClause) {
          nativeQuery.limit = limitClause.limit
        }

        const result = await this.capacitorFirestore.getDocuments(nativeQuery)
        
        return {
          docs: result.snapshots.map(snapshot => ({
            exists: () => snapshot.exists,
            data: () => snapshot.data,
            id: snapshot.id
          })),
          empty: result.snapshots.length === 0,
          size: result.snapshots.length
        }
      } else {
        const collectionRef = collection(this.db, collectionPath)
        const q = query(collectionRef, ...queryConstraints)
        return await getDocs(q)
      }
    } catch (error) {
      console.error('Get documents error:', error)
      throw error
    }
  }

  // Helper methods for common queries
  where(field, operator, value) {
    return { type: 'where', field, operator, value }
  }

  orderBy(field, direction = 'asc') {
    return { type: 'orderBy', field, direction }
  }

  limitToFirst(limitCount) {
    return { type: 'limit', limit: limitCount }
  }

  // Server timestamp helper
  serverTimestamp() {
    if (this.isNative) {
      return new Date().toISOString() // Fallback for native
    } else {
      return serverTimestamp()
    }
  }
}

// Create and export singleton instance
const firestoreService = new FirestoreService()
export default firestoreService