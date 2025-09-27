import { db, isNative } from '../boot/firebase'
import errorHandlingService from './errorHandlingService'
import collectionQueryService from './collectionQueryService'
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
        errorHandlingService.handleFirestoreError(error, 'FirestoreService.initialize')
        throw error
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
        console.log('🔍 FirestoreService getDoc result:', result)
        
        // Check if the snapshot exists and has data
        const exists = result.snapshot && result.snapshot.data && Object.keys(result.snapshot.data).length > 0
        
        return {
          exists: () => exists,
          data: () => result.snapshot.data || {},
          id: result.snapshot.id || path.split('/').pop()
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
      console.log('FirestoreService: Getting collection docs for:', collectionPath)
      
      // Always use Firebase Web SDK for collection queries
      // since Capacitor Firebase Firestore plugin doesn't support getDocuments
      return await collectionQueryService.getCollectionDocs(collectionPath, queryConstraints)
    } catch (error) {
      console.error('Get documents error:', error)
      errorHandlingService.handleFirestoreError(error, `getDocs(${collectionPath})`)
      throw error
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
}

// Create and export singleton instance
const firestoreService = new FirestoreService()
export default firestoreService