/**
 * Face ID Enrollment Service
 *
 * Mirrors the Python reference script exactly. Do NOT reinterpret or simplify.
 * - Image: jpeg_b64_safe equivalent (resize max 480px, JPEG quality 85, base64).
 * - Payload: EXACT { cmd, enrollid, name, backupnum: 50, admin: 0, record }.
 * - MQTT: Publish to aiface/{DEVICE_SN}/pub, subscribe to aiface/{DEVICE_SN}/sub.
 * - Confirmation: Wait for reply where ret === "setuserinfo", enrollid matches, result === true.
 * - Persistence: Only after successful reply; store in documents.faceEnrollments[projectId].
 */

import mqtt from 'mqtt'

// Python: MAX_SIDE = 480, JPEG_QUALITY = 85, backupnum = 50, ADMIN = 0, TIMEOUT_SEC = 12
const MAX_SIDE = 480
const JPEG_QUALITY = 85
const BACKUP_NUM = 50
const ADMIN = 0
const TIMEOUT_SEC = 12

const ENROLL_ID_MIN = 99
const ENROLL_ID_MAX = 49999

const BROKER_WS_URL =
  import.meta.env.VITE_MQTT_BROKER_WS_URL || 'ws://broker.hivemq.com:8000/mqtt'
const DEFAULT_DEVICE_SN =
  import.meta.env.VITE_FACE_DEVICE_SN || 'AYTL03156426'

const DEBUG = /^(1|true|yes)$/i.test(
  String(import.meta.env.VITE_FACE_ENROLL_DEBUG ?? '')
)

// --- Unique ID allocation & offline queue (persistent localStorage) ---
// IDs are sequential 99,100,...,49999 (0–98 reserved for testing). We track used IDs + queue enrollIds.
// Never drop data when device offline.
// localStorage size: Base64 face data can be large (~100KB–500KB per image). Typical limit ~5MB.
// Low enrollment volume (few queued items) is fine. If you expect high volume or large images,
// consider switching the queue to IndexedDB to avoid QuotaExceededError.
const STORAGE_KEY_USED_IDS = 'faceEnroll_usedIds'
const STORAGE_KEY_QUEUE = 'faceEnroll_queue'
const STORAGE_KEY_PENDING_REG = 'faceEnroll_pendingRegistration'
const ENROLL_ID_SEQ_START = 99
const QUEUE_RETRY_INTERVAL_MS = 30 * 60 * 1000

const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

function loadJson(key, fallback) {
  if (!hasStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null || raw === '') return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    if (DEBUG) console.warn('[FaceEnroll] saveJson failed:', e)
  }
}

/**
 * Set of all enroll IDs considered "used": persisted usedIds + those in the queue.
 * Ensures deterministic, duplicate-free allocation across retries and restarts.
 */
function getUsedEnrollIds() {
  const used = new Set(loadJson(STORAGE_KEY_USED_IDS, []))
  const queue = loadJson(STORAGE_KEY_QUEUE, [])
  for (const it of queue) {
    if (typeof it.enrollId === 'number' && !Number.isNaN(it.enrollId)) used.add(it.enrollId)
  }
  return used
}

/**
 * Allocate next unique sequential enroll ID (99, 100, ..., 49999). Skip already used; persist immediately.
 * 0–98 reserved for testing. Safe across retries and refresh; no duplicates.
 * @returns {number} allocated ID, or 0 if none available (all used)
 */
export function allocateEnrollId() {
  if (!hasStorage()) return 0
  const used = getUsedEnrollIds()
  let id = ENROLL_ID_SEQ_START
  while (id <= ENROLL_ID_MAX) {
    if (!used.has(id)) break
    id += 1
  }
  if (id > ENROLL_ID_MAX) return 0
  const arr = loadJson(STORAGE_KEY_USED_IDS, [])
  if (!arr.includes(id)) {
    arr.push(id)
    saveJson(STORAGE_KEY_USED_IDS, arr)
  }
  return id
}

/**
 * @typedef {Object} QueueItem
 * @property {number} enrollId
 * @property {string} userName
 * @property {string} record - base64 JPEG
 * @property {string} projectId
 * @property {string} deviceSn
 * @property {string} brokerWsUrl
 * @property {string} userId
 * @property {'profile'|'registration'} flow
 * @property {string} createdAt
 */

function getQueue() {
  return loadJson(STORAGE_KEY_QUEUE, [])
}

function persistQueue(arr) {
  saveJson(STORAGE_KEY_QUEUE, arr)
}

/**
 * Append item to persistent queue. Survives refresh, restart, broker disconnect.
 * @param {QueueItem} item
 */
export function enqueueEnrollmentItem(item) {
  const q = getQueue()
  q.push({ ...item, createdAt: item.createdAt || new Date().toISOString() })
  persistQueue(q)
  if (DEBUG) console.log('[FaceEnroll] Queued enrollment item:', item.projectId, item.enrollId)
}

function removeQueueItemAtIndex(i) {
  const q = getQueue()
  if (i < 0 || i >= q.length) return
  q.splice(i, 1)
  persistQueue(q)
}

/**
 * Errors for which we queue instead of failing: device unreachable or no reply.
 * reply_failed = device rejected; do NOT queue.
 */
export function isQueueableError(reason) {
  switch (reason) {
    case 'connect':
    case 'subscribe':
    case 'publish':
    case 'timeout':
    case 'timeout_checklive':
      return true
    default:
      return false
  }
}

/**
 * Process pending queue: one item per invocation only. Remove only after successful delivery.
 * Profile: updateUser with merged faceEnrollments. Registration: append to pendingRegistration.
 * Stops immediately if the first item fails — no loop. Prevents CPU churn and broker spam.
 * Next run (30min / online / visibility) retries the same head item.
 */
async function processQueue() {
  if (!hasStorage()) return
  const { getUserById, updateUser } = await import('./dynamoDBUsersService').catch(() => ({}))
  if (!getUserById || !updateUser) return

  const q = getQueue()
  if (q.length === 0) return
  const it = q[0]
  const payload = buildEnrollmentPayload({
    enrollId: it.enrollId,
    name: it.userName,
    record: it.record,
  })
  const { success, error: errReason } = await enrollViaMqtt({
    brokerWsUrl: it.brokerWsUrl,
    deviceSn: it.deviceSn,
    payload,
    enrollId: it.enrollId,
  })
  if (!success) {
    if (DEBUG) console.warn('[FaceEnroll] Queue item failed, will retry later:', errReason)
    if (errReason === 'reply_failed') {
      notifyFaceEnrollmentRejected({
        userId: it.userId,
        projectId: it.projectId,
        url: it.flow === 'profile' ? '/profile/face-verification' : '/register/face-verification',
      })
      removeQueueItemAtIndex(0)
    }
    return
  }
  if (it.flow === 'profile' && it.userId) {
    try {
      const user = await getUserById(it.userId)
      const docs = user?.documents || {}
      const faceEnrollments = { ...(docs.faceEnrollments || {}) }
      const mqttClusterId = it.brokerWsUrl ? new URL(it.brokerWsUrl).host : ''
      faceEnrollments[it.projectId] = {
        enrollId: it.enrollId,
        deviceSn: it.deviceSn,
        mqttClusterId,
        enrolledAt: new Date().toISOString(),
      }
      await updateUser(it.userId, {
        documents: { ...docs, faceEnrollments, faceEnrolledAt: new Date().toISOString() },
      })
    } catch (e) {
      if (DEBUG) console.warn('[FaceEnroll] processQueue updateUser failed:', e)
      return
    }
  } else if (it.flow === 'registration' && it.userId) {
    const pending = loadJson(STORAGE_KEY_PENDING_REG, {})
    const list = pending[it.userId] || []
    const mqttClusterId = it.brokerWsUrl ? new URL(it.brokerWsUrl).host : ''
    list.push({
      projectId: it.projectId,
      enrollId: it.enrollId,
      deviceSn: it.deviceSn,
      mqttClusterId,
      enrolledAt: new Date().toISOString(),
    })
    pending[it.userId] = list
    saveJson(STORAGE_KEY_PENDING_REG, pending)
  }
  removeQueueItemAtIndex(0)
}

let _queueProcessorInterval = null

/**
 * Start background processor: every 30 min and on online/visibility. Safe to call multiple times.
 */
export function startQueueProcessor() {
  if (typeof window === 'undefined') return
  if (_queueProcessorInterval != null) return
  const run = () => {
    processQueue().catch((e) => {
      if (DEBUG) console.warn('[FaceEnroll] processQueue error:', e)
    })
  }
  run()
  _queueProcessorInterval = setInterval(run, QUEUE_RETRY_INTERVAL_MS)
  window.addEventListener('online', run)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run()
  })
  if (DEBUG) console.log('[FaceEnroll] Queue processor started (interval + online + visibility)')
}

/**
 * User-friendly message when enrollment was queued for later (device offline / no reply).
 * Shown instead of error; no technical terms.
 */
export function enrollmentQueuedMessage() {
  return "We've saved your photo. We'll send it to the device when it's available. You can keep using the app."
}

/**
 * Get pending Face enrollment results for a registration user (from offline queue processing).
 * @param {string} userId - tempUserId, email, or other registration identifier
 * @returns {Array<{ projectId, enrollId, deviceSn, mqttClusterId, enrolledAt }>}
 */
export function getPendingRegistrationEnrollments(userId) {
  const pending = loadJson(STORAGE_KEY_PENDING_REG, {})
  return Array.isArray(pending[userId]) ? pending[userId] : []
}

/**
 * Clear pending registration enrollments for a user after merging into created user.
 * @param {string} userId
 */
export function clearPendingRegistrationEnrollments(userId) {
  if (!hasStorage()) return
  const pending = loadJson(STORAGE_KEY_PENDING_REG, {})
  delete pending[userId]
  saveJson(STORAGE_KEY_PENDING_REG, pending)
}

/**
 * Persist face enrollment to the user document in DynamoDB during registration.
 * Call this as soon as face verification succeeds so profile shows "set up" even if
 * the user completes property step later (or from another session).
 * @param {string} userId - DynamoDB user id (e.g. tempUserId / Cognito sub)
 * @param {Array<{ projectId, enrollId, deviceSn, mqttClusterId, enrolledAt }>} entries
 * @returns {Promise<void>}
 */
export async function persistRegistrationFaceEnrollment(userId, entries) {
  if (!userId || !Array.isArray(entries) || entries.length === 0) return
  try {
    const { getUserById, updateUser } = await import('./dynamoDBUsersService')
    const user = await getUserById(userId)
    if (!user) return
    const docs = user.documents || {}
    const faceEnrollments = entries.reduce(
      (acc, e) => {
        acc[e.projectId] = {
          enrollId: e.enrollId,
          deviceSn: e.deviceSn,
          mqttClusterId: e.mqttClusterId,
          enrolledAt: e.enrolledAt,
        }
        return acc
      },
      {}
    )
    const now = new Date().toISOString()
    await updateUser(userId, {
      documents: { ...docs, faceEnrolledAt: now, faceEnrollments },
    })
    if (DEBUG) console.log('[FaceEnroll] Persisted registration face enrollment to DB for', userId)
  } catch (e) {
    if (DEBUG) console.warn('[FaceEnroll] persistRegistrationFaceEnrollment failed:', e)
  }
}

/**
 * Send push notification when device rejects face (e.g. no face detected). Fire-and-forget.
 * Uses createNotification → DynamoDB → Lambda → FCM. User sees "upload a clearer image" on phone.
 * @param {Object} opts
 * @param {string} opts.userId - User ID for audience (DynamoDB id or temp/email for registration)
 * @param {string} opts.projectId - Project ID for notification (e.g. targets[0].projectId or 'default')
 * @param {string} [opts.url] - Deep-link when user taps notification (e.g. /profile/face-verification)
 */
export function notifyFaceEnrollmentRejected({ userId, projectId, url }) {
  if (!userId || !projectId) return
  import('./notificationsAwsService')
    .then(({ createNotification }) =>
      createNotification({
        projectId,
        title_en: 'Face photo not accepted',
        title_ar: 'لم يتم قبول صورة الوجه',
        body_en: 'Please upload a clearer photo of your face so we can recognise you.',
        body_ar: 'يرجى رفع صورة أوضح لوجهك حتى نتمكن من التعرف عليك.',
        audience: { uids: [userId] },
        sendNow: true,
        type: 'face_enrollment_rejected',
        meta: url ? { url } : {},
      })
    )
    .then(() => {
      if (DEBUG) console.log('[FaceEnroll] Push notification created for face rejection:', userId)
    })
    .catch((e) => {
      if (DEBUG) console.warn('[FaceEnroll] Failed to create face-rejection notification:', e)
    })
}

/**
 * Python: jpeg_b64_safe(path, max_side=480, quality=85)
 * - Open image, convert to RGB, resize so max(w,h) <= max_side, encode JPEG quality, base64.
 * App: dataUrl → load image → draw to canvas (resize max side <= max_side) → JPEG quality → base64.
 * @param {string} dataUrl - data URL (e.g. from camera or file input)
 * @param {number} [maxSide=480]
 * @param {number} [quality=85]
 * @returns {Promise<string>} Base64 string of JPEG bytes (no data URL prefix)
 */
export function jpegB64Safe(dataUrl, maxSide = MAX_SIDE, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      reject(new Error('Invalid data URL for Face ID image.'))
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      const scale = Math.min(1, maxSide / Math.max(w, h))
      const outW = scale < 1 ? Math.round(w * scale) : w
      const outH = scale < 1 ? Math.round(h * scale) : h
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not available'))
        return
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h, 0, 0, outW, outH)
      const jpegDataUrl = canvas.toDataURL('image/jpeg', quality / 100)
      const commaIdx = jpegDataUrl.indexOf(',')
      if (commaIdx === -1) {
        reject(new Error('Invalid data URL format'))
        return
      }
      resolve(jpegDataUrl.slice(commaIdx + 1).trim())
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Legacy: strip data URL prefix to get raw base64. Prefer jpegB64Safe for enrollment.
 * @param {string} dataUrl
 * @returns {string} raw base64
 */
export function dataUrlToBase64(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Invalid data URL for Face ID image.')
  }
  const i = dataUrl.indexOf(',')
  if (i === -1) {
    throw new Error('Invalid data URL format: missing base64 data.')
  }
  return dataUrl.slice(i + 1).trim()
}

export function validateEnrollId(value) {
  const n = typeof value === 'number' ? value : parseInt(value, 10)
  if (Number.isNaN(n)) {
    return { valid: false, error: 'Enroll ID must be a number.' }
  }
  if (n < ENROLL_ID_MIN || n > ENROLL_ID_MAX) {
    return {
      valid: false,
      error: `Enroll ID must be between ${ENROLL_ID_MIN} and ${ENROLL_ID_MAX}.`,
    }
  }
  return { valid: true }
}

export function deriveEnrollId(userId) {
  if (!userId || typeof userId !== 'string') {
    return 0
  }
  let h = 0
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) - h + userId.charCodeAt(i)) | 0
  }
  const range = ENROLL_ID_MAX - ENROLL_ID_MIN + 1
  return ENROLL_ID_MIN + (Math.abs(h) % range)
}

/**
 * Python: set_payload = { "cmd": "setuserinfo", "enrollid", "name", "backupnum": 50, "admin", "record": photo_b64 }
 * Do NOT send face, password, groupid, shiftid, verifymode.
 * @param {Object} opts
 * @param {number} enrollId
 * @param {string} name
 * @param {string} record - base64 JPEG (from jpegB64Safe)
 */
export function buildEnrollmentPayload({ enrollId, name, record }) {
  return {
    cmd: 'setuserinfo',
    enrollid: Number(enrollId),
    name: String(name || ''),
    backupnum: BACKUP_NUM,
    admin: ADMIN,
    record: String(record),
  }
}

/**
 * Validate inputs and build payload. record must be base64 from jpegB64Safe.
 */
export function prepareEnrollment({ enrollId, userName, img_b64 }) {
  const validation = validateEnrollId(enrollId)
  if (!validation.valid) {
    return { payload: null, error: validation.error }
  }
  if (!img_b64 || typeof img_b64 !== 'string') {
    return { payload: null, error: 'Face image (Base64) is required.' }
  }
  const payload = buildEnrollmentPayload({
    enrollId: Number(enrollId),
    name: String(userName || ''),
    record: img_b64,
  })
  return { payload, error: null }
}

/**
 * Get enrollment targets: one per project (or single default from env).
 * Python script uses single broker/device; multi-project = repeat same flow per project.
 * Each target can have different broker and DEVICE_SN (from project or env).
 * @param {Array<{ id: string, faceDeviceSn?: string, mqttBrokerWsUrl?: string }>} [userProjects]
 * @returns {Array<{ projectId: string, deviceSn: string, brokerWsUrl: string }>}
 */
export function getEnrollmentTargets(userProjects = []) {
  const brokerWsUrl = import.meta.env.VITE_MQTT_BROKER_WS_URL || BROKER_WS_URL
  const defaultSn = import.meta.env.VITE_FACE_DEVICE_SN || DEFAULT_DEVICE_SN
  if (!userProjects || userProjects.length === 0) {
    return [{ projectId: 'default', deviceSn: defaultSn, brokerWsUrl }]
  }
  return userProjects.map((p) => ({
    projectId: p.id || 'default',
    deviceSn: p.faceDeviceSn || defaultSn,
    brokerWsUrl: p.mqttBrokerWsUrl || brokerWsUrl,
  }))
}

/**
 * Python: Publish to aiface/{DEVICE_SN}/pub, subscribe to aiface/{DEVICE_SN}/sub.
 * Wait for reply where ret === "setuserinfo", enrollid matches, result === true; timeout 12s.
 * Python uses time.sleep(1) after subscribe before publish; we do the same.
 * @param {Object} opts
 * @param {string} opts.brokerWsUrl - MQTT broker WebSocket URL
 * @param {string} opts.deviceSn - Device serial number
 * @param {Object} opts.payload - setuserinfo payload (from buildEnrollmentPayload)
 * @param {number} opts.enrollId - expected enrollid in reply
 * @param {number} [opts.timeoutSec=12]
 * @returns {Promise<{ success: boolean, error?: string, reply?: Object }>}
 *   error: 'connect' | 'subscribe' | 'publish' | 'timeout' | 'timeout_checklive' | 'reply_failed'
 */
export function enrollViaMqtt({ brokerWsUrl, deviceSn, payload, enrollId, timeoutSec = TIMEOUT_SEC }) {
  const pubTopic = `aiface/${deviceSn}/pub`
  const subTopic = `aiface/${deviceSn}/sub`

  return new Promise((resolve) => {
    let resolved = false
    let setReply = null
    let connected = false
    let sawChecklive = false

    const client = mqtt.connect(brokerWsUrl, {
      keepalive: 60,
      reconnectPeriod: 0,
      connectTimeout: 10000,
    })

    const done = (success, reply = null, errorReason = null) => {
      if (resolved) return
      resolved = true
      try {
        client.end(true)
      } catch {
        /* ignore */
      }
      if (DEBUG) {
        console.log('[FaceEnroll] enrollViaMqtt done:', { success, error: errorReason, hasReply: !!reply })
      }
      resolve({ success, error: errorReason || null, reply: reply || undefined })
    }

    client.on('connect', () => {
      connected = true
      if (DEBUG) console.log('[FaceEnroll] MQTT connected, subscribing:', subTopic)
      client.subscribe(subTopic, { qos: 1 }, (err) => {
        if (err) {
          if (DEBUG) console.warn('[FaceEnroll] Subscribe error:', err)
          done(false, null, 'subscribe')
          return
        }
        if (DEBUG) console.log('[FaceEnroll] Subscribed. Waiting 1s before publish (Python behaviour).')
        setTimeout(() => {
          if (resolved) return
          if (DEBUG) {
            const redacted = { ...payload, record: payload.record ? `<base64 len=${payload.record.length}>` : null }
            console.log('[FaceEnroll] Publishing to:', pubTopic, JSON.stringify(redacted))
          }
          client.publish(pubTopic, JSON.stringify(payload), { qos: 1 }, (pubErr) => {
            if (pubErr) {
              if (DEBUG) console.warn('[FaceEnroll] Publish error:', pubErr)
              done(false, null, 'publish')
              return
            }
            if (DEBUG) console.log(`[FaceEnroll] Published, waiting for reply (timeout ${timeoutSec}s)...`)
          })
        }, 1000)
      })
    })

    client.on('message', (topic, message) => {
      try {
        const s =
          typeof message === 'string'
            ? message
            : message && typeof message.toString === 'function'
              ? message.toString('utf-8')
              : ''
        if (!s) return
        if (DEBUG) console.log('[FaceEnroll] Message on', topic, ':', s.slice(0, 120) + (s.length > 120 ? '...' : ''))
        const j = JSON.parse(s)
        if (j.cmd === 'checklive') sawChecklive = true
        if (j.ret === 'setuserinfo' && Number(j.enrollid) === Number(enrollId)) {
          setReply = j
          if (j.result === true) {
            done(true, j)
          }
        }
      } catch {
        /* ignore parse errors */
      }
    })

    client.on('error', (e) => {
      if (DEBUG) console.warn('[FaceEnroll] MQTT error:', e)
      if (!resolved) done(false, null, connected ? null : 'connect')
    })

    client.on('close', () => {
      if (!resolved) done(false, null, connected ? null : 'connect')
    })

    setTimeout(() => {
      if (!resolved) {
        if (setReply != null && setReply.result !== true) {
          if (DEBUG) console.warn('[FaceEnroll] Timeout: got reply but result !== true:', setReply)
          done(false, setReply, 'reply_failed')
        } else {
          const reason = sawChecklive ? 'timeout_checklive' : 'timeout'
          if (DEBUG) {
            console.warn(
              sawChecklive
                ? '[FaceEnroll] Timeout: received checklive but no setuserinfo reply from device.'
                : '[FaceEnroll] Timeout: no valid setuserinfo reply (no device activity on sub topic).'
            )
          }
          done(false, null, reason)
        }
      }
    }, timeoutSec * 1000)
  })
}

/**
 * User-facing message for enrollment failure reason. Friendly, non-technical only.
 * No stack traces, MQTT/broker terms, or internal codes. Debug details stay in console.
 * @param {string} [reason] - 'connect' | 'subscribe' | 'publish' | 'timeout' | 'timeout_checklive' | 'reply_failed'
 */
export function enrollmentErrorMessage(reason) {
  switch (reason) {
    case 'connect':
      return "We couldn't reach the device right now. Please check your connection and try again."
    case 'subscribe':
      return "Something went wrong while preparing to send. Please try again."
    case 'publish':
      return "We couldn't send your photo to the device. Please try again."
    case 'timeout':
      return "The device didn't respond in time. Make sure it's on and nearby, then try again."
    case 'timeout_checklive':
      return "The device is on but didn't respond. Make sure it's ready on the Face ID screen, then try again."
    case 'reply_failed':
      return "The device couldn't save this photo. Try another photo or try again later."
    default:
      return "Something went wrong. Please try again."
  }
}

/**
 * Process image for enrollment: same as Python jpeg_b64_safe (resize max 480, JPEG 85, base64).
 * Use this before building payload and calling enrollViaMqtt.
 * @param {string} dataUrl - from camera or file input
 * @returns {Promise<string>} base64 JPEG string
 */
export async function processImageForEnrollment(dataUrl) {
  return jpegB64Safe(dataUrl, MAX_SIDE, JPEG_QUALITY)
}

/**
 * Legacy HTTP send — no longer used; enrollment is MQTT-only to match Python.
 * Kept for reference; callers must use enrollViaMqtt + getEnrollmentTargets.
 * @deprecated Use enrollViaMqtt and getEnrollmentTargets instead.
 */
export async function sendEnrollmentPayload() {
  throw new Error(
    'Face enrollment uses MQTT only (aiface/{DEVICE_SN}/pub). Set VITE_MQTT_BROKER_WS_URL and VITE_FACE_DEVICE_SN.'
  )
}
