import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../boot/firebase'

/**
 * Input validation and sanitization utilities
 */
const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID')
  }
  // Firebase UIDs are typically 28 characters and alphanumeric
  if (!/^[a-zA-Z0-9]{28}$/.test(userId)) {
    throw new Error('Invalid user ID format')
  }
  return true
}

const validateAdminId = (adminId) => {
  if (!adminId || typeof adminId !== 'string') {
    throw new Error('Invalid admin ID')
  }
  if (!/^[a-zA-Z0-9]{28}$/.test(adminId)) {
    throw new Error('Invalid admin ID format')
  }
  return true
}

const sanitizeString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') {
    return ''
  }
  // Remove potentially dangerous characters and limit length
  return str
    .replace(/[<>"'&]/g, '')
    .substring(0, maxLength)
    .trim()
}

const validateReason = (reason) => {
  const sanitized = sanitizeString(reason, 500)
  if (sanitized.length < 3) {
    throw new Error('Reason must be at least 3 characters long')
  }
  return sanitized
}

/**
 * User Blocking Service
 * Handles user blocking functionality for gate pass generation
 */
class UserBlockingService {
  /**
   * Check if a user is blocked from generating gate passes
   * @param {string} userId - Firebase Auth UID
   * @returns {Promise<Object>} - Blocking status and details
   */
  async checkUserBlockingStatus(userId) {
    try {
      // Validate input
      validateUserId(userId)

      console.log('🔍 Checking blocking status for user')

      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        console.log('⚠️ User document not found')
        return {
          isBlocked: false,
          blockingDetails: null,
          error: 'User not found',
        }
      }

      const userData = userDoc.data()

      // Check if user is blocked from generating gate passes
      const isBlocked = userData.blockedFromGatePasses === true

      if (isBlocked) {
        const blockingDetails = {
          blockedAt: userData.blockedFromGatePassesAt,
          blockedBy: userData.blockedFromGatePassesBy,
          reason: sanitizeString(userData.blockedFromGatePassesReason) || 'No reason provided',
          blockedUntil: userData.blockedFromGatePassesUntil || null,
        }

        // Check if temporary blocking has expired
        if (blockingDetails.blockedUntil) {
          const blockedUntilDate = blockingDetails.blockedUntil.toDate
            ? blockingDetails.blockedUntil.toDate()
            : new Date(blockingDetails.blockedUntil)

          if (new Date() > blockedUntilDate) {
            // Blocking has expired, automatically unblock
            await this.unblockUserFromGatePasses(userId, 'system', 'Blocking period expired')
            return {
              isBlocked: false,
              blockingDetails: null,
            }
          }
        }

        console.log('🚫 User is blocked from generating gate passes')
        return {
          isBlocked: true,
          blockingDetails,
        }
      }

      console.log('✅ User is not blocked from generating gate passes')
      return {
        isBlocked: false,
        blockingDetails: null,
      }
    } catch {
      console.error('❌ Error checking user blocking status')
      return {
        isBlocked: false,
        blockingDetails: null,
        error: 'Unable to check blocking status',
      }
    }
  }

  /**
   * Block a user from generating gate passes (admin only)
   * @param {string} userId - Firebase Auth UID
   * @param {string} adminId - Admin who is blocking the user
   * @param {string} reason - Reason for blocking
   * @param {Date} blockedUntil - Optional end date for temporary blocking
   * @returns {Promise<boolean>} - Success status
   */
  async blockUserFromGatePasses(userId, adminId, reason, blockedUntil = null) {
    try {
      // Validate inputs
      validateUserId(userId)
      validateAdminId(adminId)
      const sanitizedReason = validateReason(reason)

      console.log('🚫 Blocking user from gate passes')

      // TODO: Add admin authorization check here
      // This should verify that adminId is actually an admin

      const userDocRef = doc(db, 'users', userId)
      const updateData = {
        blockedFromGatePasses: true,
        blockedFromGatePassesAt: serverTimestamp(),
        blockedFromGatePassesBy: adminId,
        blockedFromGatePassesReason: sanitizedReason,
        updatedAt: serverTimestamp(),
      }

      if (blockedUntil) {
        updateData.blockedFromGatePassesUntil = blockedUntil
      }

      await updateDoc(userDocRef, updateData)

      console.log('✅ User blocked from gate passes successfully')
      return true
    } catch {
      console.error('❌ Error blocking user from gate passes')
      throw new Error('Failed to block user')
    }
  }

  /**
   * Unblock a user from generating gate passes (admin only)
   * @param {string} userId - Firebase Auth UID
   * @param {string} adminId - Admin who is unblocking the user
   * @param {string} reason - Reason for unblocking
   * @returns {Promise<boolean>} - Success status
   */
  async unblockUserFromGatePasses(userId, adminId, reason) {
    try {
      // Validate inputs
      validateUserId(userId)
      validateAdminId(adminId)
      const sanitizedReason = validateReason(reason)

      console.log('✅ Unblocking user from gate passes')

      // TODO: Add admin authorization check here
      // This should verify that adminId is actually an admin

      const userDocRef = doc(db, 'users', userId)
      const updateData = {
        blockedFromGatePasses: false,
        unblockedFromGatePassesAt: serverTimestamp(),
        unblockedFromGatePassesBy: adminId,
        unblockedFromGatePassesReason: sanitizedReason,
        blockedFromGatePassesAt: null,
        blockedFromGatePassesBy: null,
        blockedFromGatePassesReason: null,
        blockedFromGatePassesUntil: null,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(userDocRef, updateData)

      console.log('✅ User unblocked from gate passes successfully')
      return true
    } catch {
      console.error('❌ Error unblocking user from gate passes')
      throw new Error('Failed to unblock user')
    }
  }

  /**
   * Check user eligibility for generating guest passes (matches API approach)
   * @param {string} userId - Firebase Auth UID
   * @param {string} projectId - Optional project ID for scoping
   * @returns {Promise<Object>} - Eligibility status with detailed response
   */
  async checkUserEligibility(userId) {
    try {
      validateUserId(userId)

      console.log('🔍 Checking user eligibility for guest passes')

      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
          data: {
            canGenerate: false,
            reason: 'user_not_found',
            user: null,
          },
        }
      }

      const userData = userDoc.data()

      // Check if user is blocked
      if (userData.blockedFromGatePasses === true) {
        return {
          success: false,
          error: 'User blocked',
          message: 'User is blocked from generating passes',
          data: {
            canGenerate: false,
            reason: 'blocked',
            user: userData,
          },
        }
      }

      // User is eligible (no monthly limits in original system)
      return {
        success: true,
        error: null,
        message: 'User is eligible to generate passes',
        data: {
          canGenerate: true,
          reason: 'eligible',
          user: userData,
        },
      }
    } catch {
      console.error('❌ Error checking user eligibility')
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
   * Get blocking message for display to user
   * @param {Object} blockingDetails - Blocking details from checkUserBlockingStatus
   * @returns {Object} - Formatted message for display
   */
  getBlockingMessage(blockingDetails) {
    if (!blockingDetails) {
      return {
        title: 'Access Denied',
        message: 'You are not allowed to generate gate passes at this time.',
        type: 'warning',
      }
    }

    const { reason, blockedUntil } = blockingDetails
    let message = `You are blocked from generating gate passes.\n\nReason: ${reason}`

    if (blockedUntil) {
      const endDate = blockedUntil.toDate ? blockedUntil.toDate() : new Date(blockedUntil)
      message += `\n\nBlocking will end on: ${endDate.toLocaleString()}`
    } else {
      message += '\n\nThis is a permanent block.'
    }

    message += '\n\nYou can still use your existing gate passes and access the gate directly.'

    return {
      title: 'Gate Pass Generation Blocked',
      message: message,
      type: 'warning',
    }
  }
}

// Export singleton instance
export default new UserBlockingService()
