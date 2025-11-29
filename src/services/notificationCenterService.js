/**
 * Notification Center Service
 * Service for creating and managing in-app notifications
 */

import firestoreService from './firestoreService'

/**
 * Notification types with their corresponding icons
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ANNOUNCEMENT: 'announcement',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  VIOLATION: 'violation',
  SERVICE: 'service',
  REQUEST: 'request',
  COMPLAINT: 'complaint',
  GATE: 'gate',
  DEFAULT: 'default'
}

/**
 * Create a new notification for a user
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID
 * @param {string} notificationData.projectId - Project ID
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (from NOTIFICATION_TYPES)
 * @param {string} [notificationData.actionUrl] - Optional URL to navigate to when clicked
 * @param {Object} [notificationData.metadata] - Optional additional metadata
 * @returns {Promise<string>} - The created notification ID
 */
export const createNotification = async ({
  userId,
  projectId,
  title,
  message,
  type = NOTIFICATION_TYPES.DEFAULT,
  actionUrl = null,
  metadata = {}
}) => {
  try {
    if (!userId || !projectId || !title || !message) {
      throw new Error('Missing required notification fields: userId, projectId, title, or message')
    }

    const notificationData = {
      userId,
      projectId,
      title,
      message,
      type,
      actionUrl,
      metadata,
      read: false,
      readAt: null,
      createdAt: Date.now() // Use numeric timestamp for DynamoDB GSI compatibility
    }

    // Save to project-specific notifications collection using DynamoDB
    const notificationsPath = `projects/${projectId}/notifications`
    const result = await firestoreService.addDoc(notificationsPath, notificationData)

    console.log('NotificationCenterService: Created notification:', result.id)
    return result.id
  } catch (error) {
    console.error('NotificationCenterService: Error creating notification:', error)
    throw error
  }
}

/**
 * Create a booking notification
 */
export const createBookingNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.BOOKING,
    actionUrl
  })
}

/**
 * Create a payment notification
 */
export const createPaymentNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.PAYMENT,
    actionUrl
  })
}

/**
 * Create a violation notification
 */
export const createViolationNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.VIOLATION,
    actionUrl
  })
}

/**
 * Create a service notification
 */
export const createServiceNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.SERVICE,
    actionUrl
  })
}

/**
 * Create a request notification
 */
export const createRequestNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.REQUEST,
    actionUrl
  })
}

/**
 * Create an announcement notification
 */
export const createAnnouncementNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    actionUrl
  })
}

/**
 * Create a gate access notification
 */
export const createGateNotification = async (userId, projectId, title, message, actionUrl = null) => {
  return createNotification({
    userId,
    projectId,
    title,
    message,
    type: NOTIFICATION_TYPES.GATE,
    actionUrl
  })
}

/**
 * Bulk create notifications for multiple users
 * @param {Array<Object>} notifications - Array of notification data objects
 * @returns {Promise<Array<string>>} - Array of created notification IDs
 */
export const bulkCreateNotifications = async (notifications) => {
  try {
    const promises = notifications.map(notification => createNotification(notification))
    const notificationIds = await Promise.all(promises)
    console.log(`NotificationCenterService: Created ${notificationIds.length} notifications`)
    return notificationIds
  } catch (error) {
    console.error('NotificationCenterService: Error bulk creating notifications:', error)
    throw error
  }
}

export default {
  createNotification,
  createBookingNotification,
  createPaymentNotification,
  createViolationNotification,
  createServiceNotification,
  createRequestNotification,
  createAnnouncementNotification,
  createGateNotification,
  bulkCreateNotifications,
  NOTIFICATION_TYPES
}

