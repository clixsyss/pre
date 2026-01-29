/**
 * Face Sync Queue Service
 *
 * DynamoDB table: FaceSyncQueue
 * - id (String, PK) - unique queue record id
 * - projectId, clusterId, userId, faceId, imageUrl
 * - status: PENDING | SENT | FAILED
 * - retryCount, createdAt, lastAttemptAt
 * - deviceId (optional, for topic: facesync/{projectId}/{clusterId}/{deviceId})
 * - mqttBrokerWsUrl (optional, cluster broker URL for Lambda)
 * - source (optional, e.g. "offline_fallback" when enqueued after MQTT failure)
 *
 * Table creation (run once in AWS):
 * - PK: id (String)
 * - GSI (optional): status-createdAt-index, PK: status, SK: createdAt (for efficient PENDING query)
 * - If no GSI: use scan with FilterExpression status = 'PENDING'
 */

import { putItem, scan, updateItem, getItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'FaceSyncQueue'
const STATUS_PENDING = 'PENDING'
const STATUS_SENT = 'SENT'
const STATUS_FAILED = 'FAILED'
const MAX_RETRIES = 10

/**
 * Generate unique queue record id (collision-safe).
 * @returns {string}
 */
function generateQueueId() {
  return `fsq-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Insert a single face sync task (one per project/cluster).
 * @param {Object} params
 * @param {string} [params.id] - optional id; if omitted, generated
 * @param {string} params.projectId
 * @param {string} params.clusterId
 * @param {string} params.userId
 * @param {string} params.faceId
 * @param {string} params.imageUrl
 * @param {string} [params.deviceId] - optional, default 'all'
 * @param {string} [params.mqttBrokerWsUrl] - optional, for Lambda to connect
 * @param {string} [params.source] - optional, e.g. 'offline_fallback' when enqueued after MQTT failure
 */
export async function enqueueFaceSync({
  id,
  projectId,
  clusterId,
  userId,
  faceId,
  imageUrl,
  deviceId = 'all',
  mqttBrokerWsUrl = '',
  source = '',
}) {
  const queueId = id || generateQueueId()
  const now = new Date().toISOString()
  const record = {
    id: queueId,
    projectId: String(projectId),
    clusterId: String(clusterId),
    userId: String(userId),
    faceId: String(faceId),
    imageUrl: String(imageUrl),
    status: STATUS_PENDING,
    retryCount: 0,
    createdAt: now,
    lastAttemptAt: now,
    deviceId: String(deviceId),
    mqttBrokerWsUrl: String(mqttBrokerWsUrl || ''),
    ...(source ? { source: String(source) } : {}),
  }
  await putItem(TABLE_NAME, record)
  return queueId
}

/**
 * Enqueue one record per project (same faceId for all). Caller provides list of { projectId, clusterId, deviceId?, mqttBrokerWsUrl? }.
 * @param {string} userId
 * @param {string} faceId
 * @param {string} imageUrl
 * @param {Array<{ projectId: string, clusterId: string, deviceId?: string, mqttBrokerWsUrl?: string }>} targets
 * @param {string} [source] - optional, e.g. 'offline_fallback'
 * @returns {Promise<string[]>} queue record ids
 */
export async function enqueueFaceSyncForProjects(userId, faceId, imageUrl, targets, source = '') {
  const ids = []
  for (const t of targets) {
    const id = await enqueueFaceSync({
      projectId: t.projectId,
      clusterId: t.clusterId,
      userId,
      faceId,
      imageUrl,
      deviceId: t.deviceId || 'all',
      mqttBrokerWsUrl: t.mqttBrokerWsUrl || '',
      source,
    })
    ids.push(id)
  }
  return ids
}

/**
 * Query all PENDING records (for Lambda retry). Uses scan with filter; for large tables add GSI on status.
 * @param {number} [limit=100]
 * @returns {Promise<Array>}
 */
export async function getPendingSyncTasks(limit = 100) {
  const items = await scan(TABLE_NAME, {
    Limit: limit,
    FilterExpression: '#s = :pending',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':pending': STATUS_PENDING },
  })
  return items
}

/**
 * Get a single queue record by id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getSyncTaskById(id) {
  return getItem(TABLE_NAME, { id })
}

/**
 * Mark task as SENT (success).
 * @param {string} id
 */
export async function markSyncTaskSent(id) {
  const now = new Date().toISOString()
  await updateItem(
    TABLE_NAME,
    { id },
    {
      UpdateExpression: 'SET #s = :sent, lastAttemptAt = :now',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':sent': STATUS_SENT, ':now': now },
    }
  )
}

/**
 * Increment retry and update lastAttemptAt; optionally mark FAILED if over threshold.
 * @param {string} id
 * @param {number} [maxRetries=10]
 * @returns {Promise<'PENDING'|'FAILED'>}
 */
export async function incrementRetryAndMaybeFail(id, maxRetries = MAX_RETRIES) {
  const task = await getItem(TABLE_NAME, { id })
  if (!task) return 'FAILED'
  const nextCount = (task.retryCount || 0) + 1
  const now = new Date().toISOString()
  const newStatus = nextCount > maxRetries ? STATUS_FAILED : STATUS_PENDING
  await updateItem(
    TABLE_NAME,
    { id },
    {
      UpdateExpression: 'SET retryCount = :c, lastAttemptAt = :now, #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':c': nextCount, ':now': now, ':status': newStatus },
    }
  )
  return newStatus
}

export { TABLE_NAME, STATUS_PENDING, STATUS_SENT, STATUS_FAILED, MAX_RETRIES }
