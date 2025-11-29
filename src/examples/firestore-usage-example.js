// Example of how to use the unified Firestore service in components

import { ref, onUnmounted } from 'vue'
import unifiedFirestoreService from '../services/unifiedFirestoreService'
import errorHandlingService from '../services/errorHandlingService'

export function useFirestoreExample() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref([])
  let unsubscribeListener = null

  // Example: Fetch news items
  const fetchNews = async (projectId) => {
    try {
      loading.value = true
      error.value = null

      // Use the unified service
      const snapshot = await unifiedFirestoreService.getDocs(
        `projects/${projectId}/news`,
        [
          unifiedFirestoreService.where('isPublished', '==', true),
          unifiedFirestoreService.orderBy('createdAt', 'desc')
        ]
      )

      data.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

    } catch (err) {
      error.value = errorHandlingService.handleFirestoreError(err, 'fetchNews')
    } finally {
      loading.value = false
    }
  }

  // Example: Listen to real-time updates
  const listenToNews = (projectId) => {
    try {
      unsubscribeListener = unifiedFirestoreService.onSnapshot(
        `projects/${projectId}/news`,
        (snapshot) => {
          data.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        },
        (error) => {
          errorHandlingService.handleFirestoreError(error, 'listenToNews')
        }
      )
    } catch (err) {
      errorHandlingService.handleFirestoreError(err, 'listenToNews')
    }
  }

  // Example: Create a new document
  const createNewsItem = async (projectId, newsData) => {
    try {
      loading.value = true

      const docRef = await unifiedFirestoreService.addDoc(
        `projects/${projectId}/news`,
        {
          ...newsData,
          createdAt: unifiedFirestoreService.serverTimestamp(),
          updatedAt: unifiedFirestoreService.serverTimestamp()
        }
      )

      console.log('News item created with ID:', docRef.id)
      return docRef.id

    } catch (err) {
      error.value = errorHandlingService.handleFirestoreError(err, 'createNewsItem')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Example: Update a document
  const updateNewsItem = async (projectId, newsId, updates) => {
    try {
      loading.value = true

      await unifiedFirestoreService.updateDoc(
        `projects/${projectId}/news/${newsId}`,
        {
          ...updates,
          updatedAt: unifiedFirestoreService.serverTimestamp()
        }
      )

      console.log('News item updated:', newsId)

    } catch (err) {
      error.value = errorHandlingService.handleFirestoreError(err, 'updateNewsItem')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Example: Delete a document
  const deleteNewsItem = async (projectId, newsId) => {
    try {
      loading.value = true

      await unifiedFirestoreService.deleteDoc(
        `projects/${projectId}/news/${newsId}`
      )

      console.log('News item deleted:', newsId)

    } catch (err) {
      error.value = errorHandlingService.handleFirestoreError(err, 'deleteNewsItem')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    if (unsubscribeListener) {
      unifiedFirestoreService.unsubscribe(unsubscribeListener)
    }
  })

  return {
    loading,
    error,
    data,
    fetchNews,
    listenToNews,
    createNewsItem,
    updateNewsItem,
    deleteNewsItem
  }
}
