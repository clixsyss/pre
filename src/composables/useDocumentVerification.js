import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../boot/firebase'

export function useDocumentVerification() {
  const showDocumentModal = ref(false)
  const missingDocuments = ref({
    profilePicture: false,
    frontId: false,
    backId: false
  })
  const isChecking = ref(false)
  
  let unsubscribeAuth = null
  let unsubscribeFirestore = null

  /**
   * Check if user has all required documents
   */
  const checkUserDocuments = async (userId) => {
    if (!userId || isChecking.value) return

    isChecking.value = true
    
    try {
      console.log('[DocumentVerification] Checking documents for user:', userId)

      // Listen to real-time updates on user document
      const userDocRef = doc(db, 'users', userId)
      
      unsubscribeFirestore = onSnapshot(userDocRef, (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log('[DocumentVerification] User document does not exist')
          isChecking.value = false
          return
        }

        const userData = docSnapshot.data()
        const documents = userData.documents || {}

        console.log('[DocumentVerification] User documents:', {
          hasProfilePicture: !!documents.profilePictureUrl,
          hasFrontId: !!documents.frontIdUrl,
          hasBackId: !!documents.backIdUrl
        })

        // Check which documents are missing
        const missing = {
          profilePicture: !documents.profilePictureUrl,
          frontId: !documents.frontIdUrl,
          backId: !documents.backIdUrl
        }

        // Only show modal if at least one document is missing
        const hasAnyMissing = missing.profilePicture || missing.frontId || missing.backId

        if (hasAnyMissing) {
          console.log('[DocumentVerification] Missing documents detected:', missing)
          missingDocuments.value = missing
          showDocumentModal.value = true
        } else {
          console.log('[DocumentVerification] All documents present')
          showDocumentModal.value = false
        }

        isChecking.value = false
      }, (error) => {
        console.error('[DocumentVerification] Error listening to user document:', error)
        isChecking.value = false
      })
    } catch (error) {
      console.error('[DocumentVerification] Error checking user documents:', error)
      isChecking.value = false
    }
  }

  /**
   * Handle when documents are uploaded
   */
  const handleDocumentsUploaded = () => {
    console.log('[DocumentVerification] Documents uploaded, hiding modal')
    showDocumentModal.value = false
  }

  /**
   * Initialize document verification on auth state change
   */
  const initializeDocumentVerification = () => {
    console.log('[DocumentVerification] Initializing document verification...')

    // Listen to auth state changes
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('[DocumentVerification] User authenticated:', user.uid)
        
        // Small delay to ensure Firestore is ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check user documents
        await checkUserDocuments(user.uid)
      } else {
        console.log('[DocumentVerification] User not authenticated, hiding modal')
        showDocumentModal.value = false
        
        // Cleanup Firestore listener
        if (unsubscribeFirestore) {
          unsubscribeFirestore()
          unsubscribeFirestore = null
        }
      }
    })
  }

  /**
   * Cleanup listeners
   */
  const cleanup = () => {
    console.log('[DocumentVerification] Cleaning up listeners...')
    
    if (unsubscribeAuth) {
      unsubscribeAuth()
      unsubscribeAuth = null
    }
    
    if (unsubscribeFirestore) {
      unsubscribeFirestore()
      unsubscribeFirestore = null
    }
  }

  return {
    showDocumentModal,
    missingDocuments,
    isChecking,
    initializeDocumentVerification,
    handleDocumentsUploaded,
    cleanup
  }
}

