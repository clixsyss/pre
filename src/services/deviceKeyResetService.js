import firestoreService from './firestoreService'
import { Timestamp } from 'firebase/firestore'

/**
 * Service for managing device key reset requests
 */
const deviceKeyResetService = {
  /**
   * Submit a device key reset request
   * @param {string} userId - The user's ID
   * @param {string} reason - The reason for the reset request
   * @param {string} projectId - The project ID (optional)
   * @returns {Promise<object>} The created request
   */
  async submitResetRequest(userId, reason, projectId = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      if (!reason || reason.trim().length === 0) {
        throw new Error('Reason is required')
      }

      const requestData = {
        userId,
        reason: reason.trim(),
        projectId,
        status: 'pending', // pending, approved, rejected
        requestedAt: Timestamp.now(),
        resolvedAt: null,
        resolvedBy: null,
        adminNotes: null
      }

      console.log('📝 Submitting device key reset request:', requestData)
      
      const docRef = await firestoreService.addDoc('deviceKeyResetRequests', requestData)
      
      console.log('✅ Device key reset request submitted:', docRef.id)
      
      return {
        id: docRef.id,
        ...requestData
      }
    } catch (error) {
      console.error('❌ Error submitting device key reset request:', error)
      throw error
    }
  },

  /**
   * Get all reset requests for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} List of reset requests
   */
  async getUserResetRequests(userId) {
    try {
      const snapshot = await firestoreService.getDocs('deviceKeyResetRequests', [
        { field: 'userId', operator: '==', value: userId }
      ])
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort by requestedAt descending (newest first)
      requests.sort((a, b) => {
        const aTime = a.requestedAt?.toMillis() || 0
        const bTime = b.requestedAt?.toMillis() || 0
        return bTime - aTime
      })
      
      return requests
    } catch (error) {
      console.error('❌ Error fetching user reset requests:', error)
      throw error
    }
  },

  /**
   * Check if user has a pending reset request
   * @param {string} userId - The user's ID
   * @returns {Promise<boolean>} True if user has pending request
   */
  async hasPendingRequest(userId) {
    try {
      const requests = await this.getUserResetRequests(userId)
      return requests.some(req => req.status === 'pending')
    } catch (error) {
      console.error('❌ Error checking pending requests:', error)
      return false
    }
  },

  /**
   * Get the most recent request for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<object|null>} The most recent request or null
   */
  async getLatestRequest(userId) {
    try {
      const requests = await this.getUserResetRequests(userId)
      return requests.length > 0 ? requests[0] : null
    } catch (error) {
      console.error('❌ Error fetching latest request:', error)
      return null
    }
  },

  /**
   * Format the request status for display
   * @param {string} status - The status string
   * @returns {object} Display information for the status
   */
  getStatusDisplay(status) {
    const statusMap = {
      pending: {
        label: 'Pending Review',
        color: '#f59e0b',
        icon: 'clock'
      },
      approved: {
        label: 'Approved',
        color: '#10b981',
        icon: 'check'
      },
      rejected: {
        label: 'Rejected',
        color: '#ef4444',
        icon: 'x'
      }
    }
    
    return statusMap[status] || statusMap.pending
  }
}

export default deviceKeyResetService

