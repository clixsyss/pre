import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

/**
 * Centralized Guest Pass API
 *
 * This API provides the correct way to check user eligibility and create guest passes.
 * Always use these functions instead of direct Firebase queries to ensure consistency.
 */

/**
 * Check if a user is eligible to generate guest passes
 * @param {string} projectId - Project ID (optional for now)
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} Eligibility result
 */
export const checkUserEligibility = async (projectId, userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('🔍 Checking user eligibility via API')

    // Check if user exists and get their data
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return {
        success: false,
        error: 'User not found',
        message: 'User not found in the system',
        data: {
          canGenerate: false,
          reason: 'user_not_found',
          user: null,
        },
      }
    }

    const userData = userDoc.data()
    const guestPassData = userData.guestPassData || {}

    // Check if user is blocked
    if (guestPassData.blocked === true) {
      return {
        success: false,
        error: 'User blocked',
        message: 'User is blocked from generating passes',
        data: {
          canGenerate: false,
          reason: 'blocked',
          user: userData,
          blockingDetails: {
            reason: guestPassData.blockedReason || 'No reason provided',
            blockedBy: guestPassData.blockedBy || 'admin',
            blockedUntil: guestPassData.blockedUntil || null,
          },
        },
      }
    }

    // Check monthly limit
    const monthlyLimit = guestPassData.monthlyLimit || 10
    const usedThisMonth = guestPassData.usedThisMonth || 0

    if (usedThisMonth >= monthlyLimit) {
      return {
        success: false,
        error: 'Limit reached',
        message: `User has reached their monthly limit of ${monthlyLimit} passes`,
        data: {
          canGenerate: false,
          reason: 'limit_reached',
          user: userData,
          usedThisMonth,
          monthlyLimit,
        },
      }
    }

    // User is eligible
    return {
      success: true,
      error: null,
      message: 'User is eligible to generate passes',
      data: {
        canGenerate: true,
        reason: 'eligible',
        user: userData,
        usedThisMonth,
        monthlyLimit,
        remainingQuota: monthlyLimit - usedThisMonth,
      },
    }
  } catch (error) {
    console.error('❌ Error checking user eligibility:', error)
    return {
      success: false,
      error: 'Check failed',
      message: 'Unable to check user eligibility',
      data: {
        canGenerate: false,
        reason: 'error',
        user: null,
      },
    }
  }
}

/**
 * Create a guest pass record in Firebase
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID creating the pass
 * @param {string} userName - Name of the user creating the pass
 * @param {string} guestName - Name of the guest
 * @param {string} purpose - Purpose of the visit
 * @param {string} validUntil - Valid until date
 * @param {string} phoneNumber - Phone number for WhatsApp (optional)
 * @returns {Promise<Object>} Created pass data
 */
export const createGuestPass = async (
  projectId,
  userId,
  userName,
  guestName,
  purpose,
  validUntil,
  phoneNumber = null,
) => {
  try {
    // First check eligibility
    const eligibility = await checkUserEligibility(projectId, userId)

    if (!eligibility.success || !eligibility.data.canGenerate) {
      throw new Error(eligibility.message)
    }

    // Generate unique pass ID
    const passId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()

    // Create pass record in Firebase
    const passRef = await addDoc(collection(db, 'guestPasses'), {
      id: passId,
      projectId: projectId,
      userId: userId,
      userName: userName,
      guestName: guestName,
      purpose: purpose,
      validUntil: new Date(validUntil),
      phoneNumber: phoneNumber,
      createdAt: serverTimestamp(),
      sentStatus: false,
      sentAt: null,
      qrCodeUrl: null, // Will be set by mobile app
      updatedAt: serverTimestamp(),
    })

    // Update user's usage count
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const guestPassData = userData.guestPassData || {}

      await updateDoc(userDocRef, {
        guestPassData: {
          ...guestPassData,
          usedThisMonth: (guestPassData.usedThisMonth || 0) + 1,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })
    }

    console.log('✅ Guest pass created successfully:', passId)

    return {
      success: true,
      passId: passId,
      passRef: passRef.id,
      data: {
        id: passId,
        projectId: projectId,
        userId: userId,
        userName: userName,
        guestName: guestName,
        purpose: purpose,
        validUntil: validUntil,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      },
    }
  } catch (error) {
    console.error('❌ Error creating guest pass:', error)
    throw error
  }
}

/**
 * Mark a pass as sent (after WhatsApp delivery)
 * @param {string} passRefId - Firebase document ID of the pass
 * @returns {Promise<boolean>} Success status
 */
export const markPassAsSent = async (passRefId) => {
  try {
    const passRef = doc(db, 'guestPasses', passRefId)

    await updateDoc(passRef, {
      sentStatus: true,
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log('✅ Pass marked as sent successfully')
    return true
  } catch (error) {
    console.error('❌ Error marking pass as sent:', error)
    throw error
  }
}

/**
 * Get user status and limits
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User status
 */
export const getUserStatus = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const guestPassData = userData.guestPassData || {}

    return {
      success: true,
      data: {
        userId: userId,
        name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        blocked: guestPassData.blocked || false,
        monthlyLimit: guestPassData.monthlyLimit || 10,
        usedThisMonth: guestPassData.usedThisMonth || 0,
        remainingQuota: (guestPassData.monthlyLimit || 10) - (guestPassData.usedThisMonth || 0),
      },
    }
  } catch (error) {
    console.error('❌ Error getting user status:', error)
    throw error
  }
}

/**
 * Initialize user with guest pass data (call when user first accesses guest passes)
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} Success status
 */
export const initializeUser = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const guestPassData = userData.guestPassData || {}

    // Only initialize if not already initialized
    if (!guestPassData.monthlyLimit) {
      await updateDoc(userDocRef, {
        guestPassData: {
          ...guestPassData,
          monthlyLimit: 10,
          usedThisMonth: 0,
          blocked: false,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })

      console.log('✅ User initialized with guest pass data')
    }

    return true
  } catch (error) {
    console.error('❌ Error initializing user:', error)
    throw error
  }
}
