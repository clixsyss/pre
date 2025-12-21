/**
 * AWS Notifications Service
 * 
 * Service for creating push notifications in DynamoDB.
 * This replaces Firebase Cloud Functions for notification sending.
 * 
 * The Lambda function handles notification delivery via DynamoDB Streams.
 * Frontend only creates the notification record; Lambda handles status updates.
 * 
 * Table: projects__notifications
 * - PK: parentId (project ID)
 * - SK: id (notification ID)
 * 
 * USAGE EXAMPLE (for Admin Dashboard/Notification UI):
 * 
 * ```javascript
 * import { createNotification } from '@/services/notificationsAwsService'
 * 
 * // Send notification to all users immediately
 * await createNotification({
 *   projectId: 'project-123',
 *   title_en: 'Welcome to PRE Group!',
 *   title_ar: 'مرحبا بكم في مجموعة PRE!',
 *   body_en: 'Thank you for joining our community.',
 *   body_ar: 'شكرا لانضمامك إلى مجتمعنا.',
 *   audience: { all: true },
 *   sendNow: true,
 *   type: 'announcement'
 * })
 * 
 * // Send to specific users
 * await createNotification({
 *   projectId: 'project-123',
 *   title_en: 'Your Booking is Confirmed',
 *   body_en: 'Your tennis court booking is confirmed.',
 *   audience: { uids: ['user1', 'user2'] },
 *   sendNow: true
 * })
 * ```
 * 
 * INTEGRATION NOTE:
 * - Replace any Firebase Cloud Functions calls (e.g., functions.httpsCallable('sendNotification'))
 * - Replace any Firestore writes that trigger push notifications (the old Firestore trigger)
 * - Use this service in admin dashboard/notification management UI
 * - Lambda will process the notification via DynamoDB Streams and send push notifications
 */

import { putItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__notifications'

// Simple logger wrapper to reduce console spam
const log = {
  info: (...args) => {
    if (import.meta.env?.MODE !== 'production') {
      console.log('[NotificationsAwsService]', ...args)
    }
  },
  warn: (...args) => console.warn('[NotificationsAwsService]', ...args),
  error: (...args) => console.error('[NotificationsAwsService]', ...args)
}

/**
 * Create a notification in DynamoDB
 * Lambda will process this via DynamoDB Streams and send push notifications
 * 
 * @param {Object} params - Notification parameters
 * @param {string} params.projectId - Project ID (becomes parentId)
 * @param {string} params.title_en - Notification title in English
 * @param {string} [params.title_ar] - Notification title in Arabic (optional)
 * @param {string} params.body_en - Notification body in English
 * @param {string} [params.body_ar] - Notification body in Arabic (optional)
 * @param {Object} params.audience - Audience specification
 *   - { all: true } for all users, OR
 *   - { uids: ['uid1', 'uid2'] } for specific users, OR
 *   - { topic: 'topic-name' } for topic-based (future)
 * @param {boolean} [params.sendNow=true] - Whether to send immediately (true) or schedule (false)
 * @param {number} [params.scheduledAt] - Timestamp for scheduled delivery (if sendNow=false)
 * @param {string} [params.type='announcement'] - Notification type
 * @param {Object} [params.meta] - Additional metadata
 * @returns {Promise<string>} Notification ID
 */
export async function createNotification({
  projectId,
  title_en,
  title_ar = '',
  body_en,
  body_ar = '',
  audience,
  sendNow = true,
  scheduledAt = null,
  type = 'announcement',
  meta = {}
}) {
  try {
    if (!projectId || !title_en || !body_en || !audience) {
      throw new Error('Missing required fields: projectId, title_en, body_en, audience')
    }

    const now = Date.now()
    
    // Generate unique notification ID
    const id = `notif-${now}-${Math.random().toString(36).substr(2, 9)}`

    // Build notification item
    const notification = {
      // Primary keys
      parentId: projectId,
      id: id,
      
      // Required fields
      title_en,
      body_en,
      audience: audience || { all: true },
      sendNow: sendNow !== false, // Default to true
      status: 'pending', // Lambda will update this
      
      // Optional fields
      title_ar: title_ar || '',
      body_ar: body_ar || '',
      type: type || 'announcement',
      meta: meta || {},
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    }

    // Add scheduledAt if provided and sendNow is false
    if (!sendNow && scheduledAt) {
      notification.scheduledAt = scheduledAt
    }

    log.info('Creating notification:', {
      id,
      projectId,
      title_en,
      sendNow,
      audience: audience.all ? 'all' : `specific (${audience.uids?.length || 0} users)`
    })

    // Insert into DynamoDB (Lambda will process via Stream)
    await putItem(TABLE_NAME, notification)

    log.info('Notification created successfully:', id)
    return id
  } catch (error) {
    log.error('Error creating notification:', error)
    throw error
  }
}

/**
 * List notifications for a project (optional - for admin UI if needed)
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.projectId - Project ID
 * @param {number} [params.limit=50] - Maximum number of notifications to return
 * @param {Object} [params.lastKey] - Last evaluated key for pagination
 * @returns {Promise<Object>} { items: Array, lastKey: Object | null }
 */
export async function listNotifications({ projectId, limit = 50, lastKey = null }) {
  try {
    if (!projectId) {
      throw new Error('projectId is required')
    }

    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': projectId
      },
      Limit: limit,
      ScanIndexForward: false // Most recent first
    }

    if (lastKey) {
      queryOptions.ExclusiveStartKey = lastKey
    }

    const items = await query(TABLE_NAME, queryOptions)

    return {
      items: items || [],
      lastKey: items.length === limit ? items[items.length - 1] : null
    }
  } catch (error) {
    log.error('Error listing notifications:', error)
    throw error
  }
}

/**
 * Get a single notification by ID (optional - for admin UI if needed)
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.projectId - Project ID
 * @param {string} params.id - Notification ID
 * @returns {Promise<Object|null>} Notification object or null
 */
export async function getNotification({ projectId, id }) {
  try {
    if (!projectId || !id) {
      throw new Error('projectId and id are required')
    }

    const { getItem } = await import('../aws/dynamodbClient')
    const notification = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: id
    })

    return notification || null
  } catch (error) {
    log.error('Error getting notification:', error)
    throw error
  }
}

// Export default for convenience
export default {
  createNotification,
  listNotifications,
  getNotification
}

