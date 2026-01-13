import { ref } from 'vue'
import optimizedAuthService from '../services/optimizedAuthService'
import { getUserById } from '../services/dynamoDBUsersService'

export function useDocumentVerification() {
  const showDocumentModal = ref(false)
  const missingDocuments = ref({
    profilePicture: false,
    frontId: false,
    backId: false
  })
  const isChecking = ref(false)
  
  let checkInterval = null
  let currentUserId = null

  /**
   * Check if user has all required documents from DynamoDB
   */
  const checkUserDocuments = async (userId) => {
    if (!userId || isChecking.value) return

    isChecking.value = true
    currentUserId = userId
    
    try {
      console.log('[DocumentVerification] Checking documents for user:', userId)

      // Get user from DynamoDB
      const user = await getUserById(userId)
      
      if (!user) {
        console.log('[DocumentVerification] User document does not exist')
        isChecking.value = false
        return
      }

      const documents = user.documents || {}

      console.log('[DocumentVerification] User documents object:', documents)
      console.log('[DocumentVerification] User documents check:', {
        hasProfilePicture: !!documents.profilePictureUrl,
        hasFrontId: !!documents.frontIdUrl,
        hasBackId: !!documents.backIdUrl,
        profilePictureUrl: documents.profilePictureUrl || 'MISSING',
        frontIdUrl: documents.frontIdUrl || 'MISSING',
        backIdUrl: documents.backIdUrl || 'MISSING'
      })

      // Check which documents are missing
      const missing = {
        profilePicture: !documents.profilePictureUrl,
        frontId: !documents.frontIdUrl,
        backId: !documents.backIdUrl
      }

      // Only show modal if at least one document is missing
      const hasAnyMissing = missing.profilePicture || missing.frontId || missing.backId

      console.log('[DocumentVerification] Missing documents check:', {
        missing,
        hasAnyMissing,
        willShowModal: hasAnyMissing
      })

      if (hasAnyMissing) {
        console.log('[DocumentVerification] ✅ Missing documents detected - SHOWING MODAL:', missing)
        missingDocuments.value = missing
        showDocumentModal.value = true
        console.log('[DocumentVerification] Modal state updated:', {
          showDocumentModal: showDocumentModal.value,
          missingDocuments: missingDocuments.value
        })
      } else {
        console.log('[DocumentVerification] ✅ All documents present - HIDING MODAL')
        showDocumentModal.value = false
      }

      isChecking.value = false
    } catch (error) {
      console.error('[DocumentVerification] Error checking user documents:', error)
      isChecking.value = false
    }
  }

  /**
   * Handle when documents are uploaded
   */
  const handleDocumentsUploaded = () => {
    console.log('[DocumentVerification] Documents uploaded, rechecking...')
    // Recheck documents after upload
    if (currentUserId) {
      setTimeout(() => {
        checkUserDocuments(currentUserId)
      }, 1000)
    }
  }

  /**
   * Initialize document verification on auth state change
   */
  const initializeDocumentVerification = async () => {
    console.log('[DocumentVerification] Initializing document verification...')

    // Check for authenticated user
    const checkAuth = async () => {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser()
        if (currentUser) {
          // Get Cognito sub (DynamoDB user ID) - priority: attributes.sub > cognitoAttributes.sub > userSub > id > uid
          const userId = currentUser.attributes?.sub || 
                        currentUser.cognitoAttributes?.sub || 
                        currentUser.userSub || 
                        currentUser.id || 
                        currentUser.uid ||
                        currentUser.username
          
          if (!userId) {
            console.warn('[DocumentVerification] No user ID found in user object')
            return
          }
          
          console.log('[DocumentVerification] User authenticated:', userId)
          
          // Check user documents immediately (services should be ready by now)
          await checkUserDocuments(userId)
          
          // Set up periodic check (every 30 seconds) to catch document updates
          if (checkInterval) {
            clearInterval(checkInterval)
          }
          checkInterval = setInterval(() => {
            if (currentUserId) {
              checkUserDocuments(currentUserId)
            }
          }, 30000)
        } else {
          console.log('[DocumentVerification] User not authenticated, hiding modal')
          showDocumentModal.value = false
          currentUserId = null
          
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
        }
      } catch (error) {
        console.error('[DocumentVerification] Error checking auth:', error)
      }
    }

    // Initial check - run immediately
    checkAuth().catch(error => {
      console.error('[DocumentVerification] Error in initial auth check:', error)
    })

    // Set up periodic auth check (every 5 seconds)
    const authCheckInterval = setInterval(checkAuth, 5000)

    // Store interval for cleanup
    if (checkInterval) {
      clearInterval(checkInterval)
    }
    checkInterval = authCheckInterval
  }

  /**
   * Cleanup listeners
   */
  const cleanup = () => {
    console.log('[DocumentVerification] Cleaning up listeners...')
    
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    
    currentUserId = null
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

