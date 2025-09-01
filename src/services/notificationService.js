import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'

class NotificationService {
  /**
   * Fetch notifications for a specific project
   * @param {string} projectId - The project ID
   * @param {Object} options - Query options
   * @param {boolean} options.activeOnly - Only fetch active notifications
   * @param {string} options.type - Filter by notification type
   * @param {string} options.priority - Filter by priority
   * @param {number} options.limit - Limit the number of results
   * @returns {Promise<Array>} Array of notifications
   */
  async fetchNotifications(projectId, options = {}) {
    console.log('🔍 NotificationService.fetchNotifications called with:', { projectId, options })
    
    const {
      activeOnly = true,
      type = null,
      priority = null,
      limit = null
    } = options

    try {
      const collectionPath = `projects/${projectId}/notifications`
      console.log('📂 Collection path:', collectionPath)
      
      let q = query(
        collection(db, collectionPath)
      )

      if (activeOnly) {
        q = query(q, where('isActive', '==', true))
      }

      if (type) {
        q = query(q, where('type', '==', type))
      }

      if (priority) {
        q = query(q, where('priority', '==', priority))
      }

      // Try without orderBy first to see if that's causing issues
      try {
        q = query(q, orderBy('createdAt', 'desc'))
      } catch (orderByError) {
        console.log('⚠️ OrderBy failed, trying without it:', orderByError)
        // Continue without orderBy
      }

      console.log('🔄 Executing Firestore query...')
      const querySnapshot = await getDocs(q)
      console.log('📊 Query snapshot size:', querySnapshot.size)
      
      const notifications = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('📄 Processing document:', doc.id, data)
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          scheduledFor: data.scheduledFor,
          expiresAt: data.expiresAt
        })
      })

      console.log('✅ Final notifications array:', notifications)

      // Apply limit if specified
      if (limit && notifications.length > limit) {
        return notifications.slice(0, limit)
      }

      return notifications
    } catch (error) {
      console.error('❌ Error fetching notifications from project collection:', error)
      
      // Try fallback to global notifications collection
      try {
        console.log('🔄 Trying fallback to global notifications collection...')
        let fallbackQ = query(collection(db, 'notifications'))
        
        if (activeOnly) {
          fallbackQ = query(fallbackQ, where('isActive', '==', true))
        }
        
        fallbackQ = query(fallbackQ, orderBy('createdAt', 'desc'))
        
        const fallbackSnapshot = await getDocs(fallbackQ)
        console.log('📊 Fallback query snapshot size:', fallbackSnapshot.size)
        
        const fallbackNotifications = []
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data()
          console.log('📄 Processing fallback document:', doc.id, data)
          fallbackNotifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            scheduledFor: data.scheduledFor,
            expiresAt: data.expiresAt
          })
        })
        
        console.log('✅ Fallback notifications:', fallbackNotifications)
        return fallbackNotifications
        
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        throw new Error('Failed to fetch notifications from both project and global collections')
      }
    }
  }

  /**
   * Get notification statistics for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} Statistics object
   */
  async getNotificationStats(projectId) {
    try {
      const notifications = await this.fetchNotifications(projectId, { activeOnly: false })
      
      const stats = {
        total: notifications.length,
        active: notifications.filter(n => n.isActive).length,
        urgent: notifications.filter(n => n.priority === 'urgent' && n.isActive).length,
        high: notifications.filter(n => n.priority === 'high' && n.isActive).length,
        normal: notifications.filter(n => n.priority === 'normal' && n.isActive).length,
        low: notifications.filter(n => n.priority === 'low' && n.isActive).length,
        announcements: notifications.filter(n => n.type === 'announcement' && n.isActive).length,
        events: notifications.filter(n => n.type === 'event' && n.isActive).length,
        alerts: notifications.filter(n => n.type === 'alert' && n.isActive).length,
        info: notifications.filter(n => n.type === 'info' && n.isActive).length
      }

      return stats
    } catch (error) {
      console.error('Error getting notification stats:', error)
      throw new Error('Failed to get notification statistics')
    }
  }

  /**
   * Get a single notification by ID
   * @param {string} notificationId - The notification ID
   * @returns {Promise<Object>} Notification object
   */
  async getNotification(notificationId, projectId) {
    try {
      const docRef = doc(db, `projects/${projectId}/notifications`, notificationId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          scheduledFor: data.scheduledFor,
          expiresAt: data.expiresAt
        }
      } else {
        throw new Error('Notification not found')
      }
    } catch (error) {
      console.error('Error getting notification:', error)
      throw new Error('Failed to get notification')
    }
  }

  /**
   * Mark a notification as read (for future implementation)
   * @param {string} notificationId - The notification ID
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId, userId) {
    try {
      // This would typically update a read status in a separate collection
      // For now, we'll just log the action
      console.log(`Notification ${notificationId} marked as read by user ${userId}`)
      
      // Future implementation could include:
      // - Adding to a 'read_notifications' collection
      // - Updating user preferences
      // - Tracking read statistics
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  /**
   * Get urgent notifications for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of urgent notifications
   */
  async getUrgentNotifications(projectId) {
    try {
      return await this.fetchNotifications(projectId, {
        activeOnly: true,
        priority: 'urgent'
      })
    } catch (error) {
      console.error('Error fetching urgent notifications:', error)
      throw new Error('Failed to fetch urgent notifications')
    }
  }

  /**
   * Get recent notifications for a project
   * @param {string} projectId - The project ID
   * @param {number} limit - Number of recent notifications to fetch
   * @returns {Promise<Array>} Array of recent notifications
   */
  async getRecentNotifications(projectId, limit = 5) {
    try {
      return await this.fetchNotifications(projectId, {
        activeOnly: true,
        limit
      })
    } catch (error) {
      console.error('Error fetching recent notifications:', error)
      throw new Error('Failed to fetch recent notifications')
    }
  }

  /**
   * Check if there are any unread urgent notifications
   * @param {string} projectId - The project ID
   * @returns {Promise<boolean>} True if there are urgent notifications
   */
  async hasUrgentNotifications(projectId) {
    try {
      const urgentNotifications = await this.getUrgentNotifications(projectId)
      return urgentNotifications.length > 0
    } catch (error) {
      console.error('Error checking urgent notifications:', error)
      return false
    }
  }

  /**
   * Format notification date for display
   * @param {Object} date - Firestore timestamp or Date object
   * @returns {string} Formatted date string
   */
  formatNotificationDate(date) {
    if (!date) return 'Unknown date'
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date)
      const now = new Date()
      const diffInHours = (now - dateObj) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Get notification type label
   * @param {string} type - Notification type
   * @returns {string} Human-readable label
   */
  getTypeLabel(type) {
    const labels = {
      announcement: 'Announcement',
      event: 'Event',
      alert: 'Alert',
      info: 'Information'
    }
    return labels[type] || type
  }

  /**
   * Get priority label
   * @param {string} priority - Notification priority
   * @returns {string} Human-readable priority
   */
  getPriorityLabel(priority) {
    const labels = {
      urgent: 'Urgent',
      high: 'High',
      normal: 'Normal',
      low: 'Low'
    }
    return labels[priority] || priority
  }

  /**
   * Truncate notification message
   * @param {string} message - The message to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated message
   */
  truncateMessage(message, maxLength = 100) {
    if (!message) return ''
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }
}

export default new NotificationService()