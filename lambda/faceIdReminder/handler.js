/**
 * Face ID Reminder Lambda
 *
 * Trigger: CloudWatch Events (e.g. daily).
 * Logic: Find users without Face ID set up; send a friendly reminder notification
 * every 2 days until they set it up. Tracks last reminder in documents.lastFaceIdReminderAt.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

const USERS_TABLE = process.env.USERS_TABLE || 'users'
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE || 'projects__notifications'
const DEFAULT_PROJECT_ID = process.env.FACE_ID_REMINDER_PROJECT_ID || 'default'
const REMINDER_INTERVAL_MS = (parseInt(process.env.REMINDER_INTERVAL_DAYS || '2', 10) * 24 * 60 * 60 * 1000)
const SCAN_LIMIT = parseInt(process.env.FACE_ID_REMINDER_SCAN_LIMIT || '500', 10)

const TITLE_EN = 'Set up Face ID to enter your compound'
const TITLE_AR = 'فعّل التعرف على الوجه لدخول مجمعك السكني'
const BODY_EN = 'Your face is your key to enter your residential compound. Set up Face ID in the app so you can get in smoothly.'
const BODY_AR = 'وجهك هو مفتاح دخولك لمجمعك السكني. فعّل التعرف على الوجه في التطبيق للدخول بسلاسة.'

const dynamoClient = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(dynamoClient)

function hasFaceIdSetUp(user) {
  const docs = user.documents || {}
  const hasEnrollments = docs.faceEnrollments &&
    typeof docs.faceEnrollments === 'object' &&
    Object.keys(docs.faceEnrollments).length > 0
  return !!(docs.faceEnrolledAt || hasEnrollments)
}

function shouldSendReminder(user, now) {
  const docs = user.documents || {}
  const last = docs.lastFaceIdReminderAt
  if (!last) return true
  const t = typeof last === 'number' ? last : new Date(last).getTime()
  return (now - t) >= REMINDER_INTERVAL_MS
}

function hasProjects(user) {
  const p = user.projects
  return Array.isArray(p) && p.length > 0
}

function isApproved(user) {
  const s = (user.approvalStatus || '').toLowerCase()
  return s === 'approved'
}

function isSuspended(user) {
  const v = user.isSuspended
  return v === true || v === 'true' || v === 1
}

function projectIdForUser(user) {
  const p = user.projects
  if (!Array.isArray(p) || p.length === 0) return DEFAULT_PROJECT_ID
  const first = p[0]
  return first.projectId || first.id || DEFAULT_PROJECT_ID
}

async function createReminderNotification(projectId, userId) {
  const now = Date.now()
  const id = `notif-${now}-${Math.random().toString(36).slice(2, 11)}`
  const item = {
    parentId: projectId,
    id,
    title_en: TITLE_EN,
    title_ar: TITLE_AR,
    body_en: BODY_EN,
    body_ar: BODY_AR,
    audience: { uids: [userId] },
    sendNow: true,
    status: 'pending',
    type: 'face_id_reminder',
    meta: { url: '/profile/face-verification' },
    createdAt: now,
    updatedAt: now,
  }
  await docClient.send(new PutCommand({
    TableName: NOTIFICATIONS_TABLE,
    Item: item,
  }))
  return id
}

async function setLastReminderAt(userId, now) {
  const iso = new Date(now).toISOString()
  await docClient.send(new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { id: userId },
    UpdateExpression: 'SET documents.lastFaceIdReminderAt = :now',
    ExpressionAttributeValues: { ':now': iso },
  }))
}

exports.handler = async (event, context) => {
  console.log('[FaceIdReminder] Invoked', { requestId: context.awsRequestId })
  const now = Date.now()
  let sent = 0
  let skipped = 0

  let lastKey = null
  const candidates = []

  do {
    const scanParams = {
      TableName: USERS_TABLE,
      Limit: SCAN_LIMIT,
    }
    if (lastKey) scanParams.ExclusiveStartKey = lastKey

    const res = await docClient.send(new ScanCommand(scanParams))
    const items = res.Items || []
    lastKey = res.LastEvaluatedKey || null

    for (const u of items) {
      if (!u.id) continue
      if (!hasProjects(u)) continue
      if (!isApproved(u)) continue
      if (isSuspended(u)) continue
      if (hasFaceIdSetUp(u)) continue
      if (!shouldSendReminder(u, now)) {
        skipped++
        continue
      }
      candidates.push(u)
    }
  } while (lastKey)

  console.log('[FaceIdReminder] Candidates without Face ID (reminder due):', candidates.length, 'skipped (throttled):', skipped)

  for (const user of candidates) {
    try {
      const projectId = projectIdForUser(user)
      await createReminderNotification(projectId, user.id)
      await setLastReminderAt(user.id, now)
      sent++
    } catch (e) {
      console.warn('[FaceIdReminder] Failed for user', user.id, e.message)
    }
  }

  console.log('[FaceIdReminder] Done', { sent, skipped })
  return { sent, skipped, candidates: candidates.length }
}
