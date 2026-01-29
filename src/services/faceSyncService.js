/**
 * Face Sync Service
 *
 * Orchestrates: S3 upload → user documents.faces → try MQTT per target → enqueue FaceSyncQueue
 * only when MQTT fails (device offline / timeout / connect error).
 * Does NOT replace the existing face enrollment flow (aiface/setuserinfo); this is a
 * parallel system using S3, DynamoDB FaceSyncQueue, and MQTT topic facesync/...
 */

import mqtt from 'mqtt'
import FileUploadService from './fileUploadService'
import { getUserById, updateUser } from './dynamoDBUsersService'
import { getProjectById } from './dynamoDBProjectsService'
import { enqueueFaceSync } from './faceSyncQueueService'

const MQTT_PUBLISH_TIMEOUT_MS = 8000
const SOURCE_OFFLINE_FALLBACK = 'offline_fallback'

/**
 * Generate a unique face ID (UUID). Collision-safe.
 * @returns {string}
 */
export function generateFaceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const DEFAULT_BROKER_WS_URL =
  import.meta.env.VITE_MQTT_BROKER_WS_URL || 'ws://broker.hivemq.com:8000/mqtt'
const DEFAULT_DEVICE_ID = 'all'

/**
 * Derive clusterId from MQTT broker WebSocket URL (host part).
 * @param {string} brokerWsUrl
 * @returns {string}
 */
function clusterIdFromBrokerUrl(brokerWsUrl) {
  if (!brokerWsUrl || typeof brokerWsUrl !== 'string') return ''
  try {
    return new URL(brokerWsUrl).host
  } catch {
    return ''
  }
}

/**
 * Build sync targets for a user: one per project with projectId, clusterId, deviceId, mqttBrokerWsUrl.
 * Uses user.projects (projectId or id, mqttBrokerWsUrl, faceDeviceSn); fetches project if broker URL missing.
 * @param {Object} user - User object with projects array
 * @returns {Promise<Array<{ projectId: string, clusterId: string, deviceId: string, mqttBrokerWsUrl: string }>>}
 */
export async function getFaceSyncTargetsForUser(user) {
  const projects = user?.projects || []
  if (projects.length === 0) {
    return [{ projectId: 'default', clusterId: clusterIdFromBrokerUrl(DEFAULT_BROKER_WS_URL), deviceId: DEFAULT_DEVICE_ID, mqttBrokerWsUrl: DEFAULT_BROKER_WS_URL }]
  }

  const targets = []
  for (const p of projects) {
    const projectId = p.projectId || p.id || 'default'
    let brokerWsUrl = p.mqttBrokerWsUrl || p.brokerWsUrl
    if (!brokerWsUrl) {
      const project = await getProjectById(projectId)
      brokerWsUrl = project?.mqttBrokerWsUrl || project?.brokerWsUrl || DEFAULT_BROKER_WS_URL
    }
    const clusterId = clusterIdFromBrokerUrl(brokerWsUrl) || projectId
    const deviceId = p.faceDeviceSn || p.deviceId || DEFAULT_DEVICE_ID
    targets.push({
      projectId,
      clusterId,
      deviceId,
      mqttBrokerWsUrl: brokerWsUrl,
    })
  }
  return targets
}

/**
 * Try to send face payload to device via MQTT. Used before falling back to FaceSyncQueue.
 * @param {Object} target - { projectId, clusterId, deviceId, mqttBrokerWsUrl }
 * @param {Object} payload - { faceId, userId, imageUrl, projectId, timestamp }
 * @returns {Promise<{ success: true }|{ success: false, reason: string }>}
 */
export async function trySendFaceToDevice(target, payload) {
  const { projectId, clusterId, deviceId, mqttBrokerWsUrl } = target
  const brokerUrl = mqttBrokerWsUrl
  if (!brokerUrl || typeof brokerUrl !== 'string') {
    return { success: false, reason: 'broker unreachable' }
  }

  const topic = `facesync/${projectId}/${clusterId}/${deviceId || 'all'}`
  const payloadStr = JSON.stringify(payload)

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        try { client.end(true) } catch { /* ignore */ }
        resolve({ success: false, reason: 'timeout' })
      }
    }, MQTT_PUBLISH_TIMEOUT_MS)

    let resolved = false
    const client = mqtt.connect(brokerUrl, {
      keepalive: 10,
      connectTimeout: 6000,
      reconnectPeriod: 0,
    })

    client.on('connect', () => {
      if (resolved) return
      client.publish(topic, payloadStr, { qos: 1 }, (err) => {
        if (resolved) return
        resolved = true
        clearTimeout(timeout)
        try { client.end(true) } catch { /* ignore */ }
        if (err) {
          resolve({ success: false, reason: 'publish error' })
        } else {
          resolve({ success: true })
        }
      })
    })

    client.on('error', () => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        try { client.end(true) } catch { /* ignore */ }
        resolve({ success: false, reason: 'connect error' })
      }
    })
  })
}

/**
 * Register a face image: S3 upload → save to user.documents.faces → try MQTT per target →
 * enqueue FaceSyncQueue only for targets where MQTT failed.
 *
 * @param {Object} opts
 * @param {string} opts.userId - User ID
 * @param {File} opts.file - Image file
 * @param {string} [opts.projectId] - If provided, only this project is used for S3 path and targets (single project)
 * @returns {Promise<{ faceId: string, imageUrl: string, queueIds: string[], userMessage: string }>}
 */
export async function registerFaceImage({ userId, file, projectId: singleProjectId }) {
  if (!userId) {
    throw new Error('User ID is required.')
  }
  if (!file) {
    throw new Error('Please select a photo to register.')
  }

  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found.')
  }

  const targets = await getFaceSyncTargetsForUser(user)
  const effectiveTargets = singleProjectId
    ? targets.filter((t) => t.projectId === singleProjectId)
    : targets
  if (effectiveTargets.length === 0) {
    throw new Error('No project available to sync this face.')
  }

  const faceId = generateFaceId()
  const firstProjectId = effectiveTargets[0].projectId

  // STEP A — Upload image to S3 (unchanged)
  let imageUrl
  try {
    imageUrl = await FileUploadService.uploadFaceImage(firstProjectId, userId, faceId, file)
  } catch (e) {
    console.error('[FaceSyncService] S3 upload failed:', e)
    throw new Error('Something went wrong while saving the face. Please try again.')
  }

  const now = new Date().toISOString()

  // STEP B — Save face metadata to user.documents.faces (unchanged)
  const docs = user.documents || {}
  const faces = Array.isArray(docs.faces) ? [...docs.faces] : []

  for (const t of effectiveTargets) {
    faces.push({
      faceId,
      projectId: t.projectId,
      clusterId: t.clusterId,
      imageUrl,
      createdAt: now,
    })
  }

  try {
    await updateUser(userId, {
      documents: { ...docs, faces },
    })
  } catch (e) {
    console.error('[FaceSyncService] Update user faces failed:', e)
    throw new Error('Something went wrong while saving the face. Please try again.')
  }

  // STEP C–E — Try MQTT per target; enqueue only on failure
  const payload = { faceId, userId, imageUrl, projectId: firstProjectId, timestamp: now }
  const queueIds = []
  let mqttSuccessCount = 0
  let mqttFailCount = 0

  for (const t of effectiveTargets) {
    const result = await trySendFaceToDevice(t, { ...payload, projectId: t.projectId })
    if (result.success) {
      mqttSuccessCount++
    } else {
      mqttFailCount++
      try {
        const id = await enqueueFaceSync({
          projectId: t.projectId,
          clusterId: t.clusterId,
          userId,
          faceId,
          imageUrl,
          deviceId: t.deviceId || 'all',
          mqttBrokerWsUrl: t.mqttBrokerWsUrl || '',
          source: SOURCE_OFFLINE_FALLBACK,
        })
        queueIds.push(id)
      } catch (e) {
        console.error('[FaceSyncService] Enqueue face sync failed for target:', t.projectId, e)
      }
    }
  }

  const userMessage = getFaceSyncUserMessage(mqttSuccessCount, mqttFailCount)

  return { faceId, imageUrl, queueIds, userMessage }
}

/**
 * User-facing message based on MQTT results (no technical errors).
 * @param {number} mqttSuccessCount
 * @param {number} mqttFailCount
 * @returns {string}
 */
export function getFaceSyncUserMessage(mqttSuccessCount, mqttFailCount) {
  if (mqttFailCount === 0) {
    return 'Face registered successfully.'
  }
  if (mqttSuccessCount === 0) {
    return 'Face saved successfully. It will sync when devices are online.'
  }
  return 'Face registered. Some devices are offline and will sync later.'
}

/**
 * User-facing success message when all targets succeed (MQTT).
 */
export function faceRegisteredSuccessMessage() {
  return 'Face registered successfully.'
}

/**
 * User-facing message when device is offline (sync queued for later).
 */
export function faceSavedOfflineMessage() {
  return 'Face saved successfully. It will sync when devices are online.'
}

/**
 * User-facing generic error message.
 */
export function faceSyncErrorMessage() {
  return 'Something went wrong while saving the face. Please try again.'
}
