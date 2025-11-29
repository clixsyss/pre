// Examples of correct Capacitor Firebase Firestore usage

import { FirebaseFirestore } from '@capacitor-firebase/firestore'

class CapacitorFirestoreExamples {
  // 1. Reading a single document
  async getDocument(collectionPath, documentId) {
    try {
      const result = await FirebaseFirestore.getDocument({
        reference: `${collectionPath}/${documentId}`
      })
      
      return {
        exists: result.snapshot?.data ? true : false,
        data: () => result.snapshot?.data || {},
        id: result.snapshot?.id || documentId
      }
    } catch (error) {
      console.error('Error getting document:', error)
      throw error
    }
  }

  // 2. Reading all documents in a collection (simple query)
  async getCollection(collectionPath) {
    try {
      const result = await FirebaseFirestore.getDocuments({
        reference: collectionPath
      })
      
      return {
        docs: result.snapshots?.map(snapshot => ({
          exists: () => snapshot.data ? true : false,
          data: () => snapshot.data || {},
          id: snapshot.id
        })) || []
      }
    } catch (error) {
      console.error('Error getting collection:', error)
      throw error
    }
  }

  // 3. Adding a document
  async addDocument(collectionPath, data) {
    try {
      const result = await FirebaseFirestore.addDocument({
        reference: collectionPath,
        data: data
      })
      
      return { id: result.id }
    } catch (error) {
      console.error('Error adding document:', error)
      throw error
    }
  }

  // 4. Updating a document
  async updateDocument(collectionPath, documentId, data) {
    try {
      await FirebaseFirestore.updateDocument({
        reference: `${collectionPath}/${documentId}`,
        data: data
      })
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  // 5. Setting a document (create or update)
  async setDocument(collectionPath, documentId, data, merge = false) {
    try {
      await FirebaseFirestore.setDocument({
        reference: `${collectionPath}/${documentId}`,
        data: data,
        merge: merge
      })
    } catch (error) {
      console.error('Error setting document:', error)
      throw error
    }
  }

  // 6. Deleting a document
  async deleteDocument(collectionPath, documentId) {
    try {
      await FirebaseFirestore.deleteDocument({
        reference: `${collectionPath}/${documentId}`
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  // 7. Query with where clause (limited support)
  async queryWithWhere(collectionPath, field, operator, value) {
    try {
      const result = await FirebaseFirestore.getDocuments({
        reference: collectionPath,
        query: {
          where: [{
            fieldPath: field,
            opStr: operator, // '==', '!=', '<', '<=', '>', '>=', 'array-contains', etc.
            value: value
          }]
        }
      })
      
      return {
        docs: result.snapshots?.map(snapshot => ({
          exists: () => snapshot.data ? true : false,
          data: () => snapshot.data || {},
          id: snapshot.id
        })) || []
      }
    } catch (error) {
      console.error('Error querying with where:', error)
      throw error
    }
  }

  // 8. Real-time listeners (snapshots)
  async listenToDocument(collectionPath, documentId, callback) {
    try {
      const listener = await FirebaseFirestore.addSnapshotListener({
        reference: `${collectionPath}/${documentId}`,
        callback: (result) => {
          const snapshot = {
            exists: () => result.snapshot?.data ? true : false,
            data: () => result.snapshot?.data || {},
            id: result.snapshot?.id || documentId
          }
          callback(snapshot)
        }
      })
      
      return listener // Use this to unsubscribe later
    } catch (error) {
      console.error('Error listening to document:', error)
      throw error
    }
  }

  // 9. Listen to collection changes
  async listenToCollection(collectionPath, callback) {
    try {
      const listener = await FirebaseFirestore.addSnapshotListener({
        reference: collectionPath,
        callback: (result) => {
          const querySnapshot = {
            docs: result.snapshots?.map(snapshot => ({
              exists: () => snapshot.data ? true : false,
              data: () => snapshot.data || {},
              id: snapshot.id
            })) || []
          }
          callback(querySnapshot)
        }
      })
      
      return listener
    } catch (error) {
      console.error('Error listening to collection:', error)
      throw error
    }
  }

  // 10. Unsubscribe from listener
  async removeSnapshotListener(listener) {
    try {
      await FirebaseFirestore.removeSnapshotListener({
        callbackId: listener.callbackId
      })
    } catch (error) {
      console.error('Error removing listener:', error)
      throw error
    }
  }
}

export default new CapacitorFirestoreExamples()
