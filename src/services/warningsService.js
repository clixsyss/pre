import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'

/**
 * Warnings Service (Mobile App)
 * Mirrors finesService.js — reads warning records from
 * projects/{projectId}/warnings stored in DynamoDB via firestoreService.
 *
 * Warning schema:
 *   id, title, description, title_ar?, description_ar?, image?,
 *   targetType ('user'|'unit'), targetId,
 *   startDate (ISO), endDate (ISO|null),
 *   status ('active'|'resolved'|'converted'),
 *   createdAt, updatedAt
 */

const COLLECTION = (projectId) => `projects/${projectId}/warnings`

// ─── GET ALL USER WARNINGS ────────────────────────────────────────────────────
/**
 * Returns all warnings that apply to the current user — either directly
 * targeted (targetType='user') or via their unit (targetType='unit').
 */
export const getUserWarnings = async (projectId, userId) => {
  return performanceService.timeOperation('getUserWarnings', async () => {
    try {
      const currentUser = await optimizedAuthService.getCurrentUser()
      if (!currentUser) throw new Error('User not authenticated')

      const cognitoSub =
        currentUser.attributes?.sub ||
        currentUser.cognitoAttributes?.sub ||
        currentUser.id ||
        currentUser.userSub
      const queryUserId = cognitoSub || userId

      const userIdentifiers = buildUserIdentifiers(currentUser, queryUserId, userId)
      const userUnits = getUserUnits(currentUser, projectId)

      let allWarnings = []
      try {
        const result = await firestoreService.getDocs(COLLECTION(projectId), {
          constraints: [{ _type: 'orderBy', field: { segments: ['createdAt'] }, direction: 'desc' }],
        })
        allWarnings = result.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } catch (e) {
        console.warn('getUserWarnings: ordered query failed, retrying without constraints', e)
        const result = await firestoreService.getDocs(COLLECTION(projectId))
        allWarnings = result.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      }

      const matched = allWarnings.filter((warning) => isWarningForUser(warning, userIdentifiers, userUnits))

      // de-duplicate and sort newest first
      const all = deduplicateById(matched)
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return all
    } catch (error) {
      console.error('Error fetching user warnings:', error)
      errorHandlingService.handleFirestoreError(error, 'getUserWarnings')
      if (error.code === 'permission-denied' || error.message?.includes('timeout')) {
        return []
      }
      throw error
    }
  })
}

// ─── GET ACTIVE WARNINGS ─────────────────────────────────────────────────────
/**
 * Returns only active (non-resolved / non-converted) warnings for the user.
 * Optionally filters by current date being within [startDate, endDate].
 */
export const getActiveUserWarnings = async (projectId, userId) => {
  const all = await getUserWarnings(projectId, userId)
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  return all.filter((w) => {
    if (w.status !== 'active') return false
    const start = parseWarningDate(w.startDate, { endOfDay: false })
    const end = parseWarningDate(w.endDate, { endOfDay: true })
    if (start && start > todayEnd) return false
    if (end && end < todayStart) return false
    return true
  })
}

// ─── GET SINGLE WARNING ───────────────────────────────────────────────────────
export const getWarning = async (projectId, warningId) => {
  try {
    const result = await firestoreService.getDoc(`${COLLECTION(projectId)}/${warningId}`)
    if (result.exists()) return { id: result.id, ...result.data() }
    throw new Error('Warning not found')
  } catch (error) {
    console.error('Error fetching warning:', error)
    throw error
  }
}

// ─── SEEN TRACKING (localStorage) ────────────────────────────────────────────
const SEEN_KEY = 'seenWarningIds'

export const getSeenWarningIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
  } catch {
    return []
  }
}

export const markWarningsAsSeen = (warningIds) => {
  try {
    const existing = getSeenWarningIds()
    const updated = [...new Set([...existing, ...warningIds])]
    localStorage.setItem(SEEN_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('markWarningsAsSeen failed', e)
  }
}

export const hasUnseenWarnings = (warnings) => {
  const seen = getSeenWarningIds()
  return warnings.some((w) => !seen.includes(w.id))
}

export const getUnseenWarnings = (warnings) => {
  const seen = getSeenWarningIds()
  return warnings.filter((w) => !seen.includes(w.id))
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const deduplicateById = (arr) => {
  const seen = new Set()
  return arr.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

const normalize = (value) => String(value || '').trim().toLowerCase()

const buildUserIdentifiers = (currentUser, ...extras) => {
  const values = [
    currentUser?.attributes?.sub,
    currentUser?.cognitoAttributes?.sub,
    currentUser?.id,
    currentUser?.userSub,
    currentUser?.uid,
    currentUser?.email,
    currentUser?.attributes?.email,
    currentUser?.cognitoAttributes?.email,
    ...extras,
  ]
  return new Set(values.filter(Boolean).map((v) => normalize(v)))
}

const getUserUnits = (currentUser, projectId) => {
  if (!currentUser || !projectId) return new Set()
  const projects = Array.isArray(currentUser.projects) ? currentUser.projects : []
  const units = new Set()
  projects.forEach((p) => {
    if (p?.projectId === projectId && p?.unit) units.add(normalize(p.unit))
  })
  ;[currentUser.unitNumber, currentUser.unit, localStorage.getItem('selectedUnit')].forEach((u) => {
    if (u) units.add(normalize(u))
  })
  return units
}

const parseWarningDate = (value, { endOfDay = false } = {}) => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      const d = value.toDate()
      return Number.isNaN(d?.getTime?.()) ? null : d
    } catch {
      return null
    }
  }

  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch
      return endOfDay
        ? new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999)
        : new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0)
    }
    const d = new Date(trimmed)
    return Number.isNaN(d.getTime()) ? null : d
  }

  return null
}

const isWarningForUser = (warning, userIdentifiers, userUnits) => {
  const targetType = normalize(warning?.targetType)
  const targetId = normalize(warning?.targetId)
  const targetEmail = normalize(warning?.targetEmail)

  if (targetType === 'unit') {
    return targetId && userUnits.has(targetId)
  }

  if (targetType === 'user') {
    return (targetId && userIdentifiers.has(targetId)) || (targetEmail && userIdentifiers.has(targetEmail))
  }

  // Backward compatibility with older warning formats
  const legacyUserKeys = [
    warning?.userId,
    warning?.uid,
    warning?.recipientId,
    warning?.targetUserId,
    warning?.email,
    warning?.userEmail,
  ]
  if (legacyUserKeys.some((k) => userIdentifiers.has(normalize(k)))) return true

  return targetId && userIdentifiers.has(targetId)
}

const warningsService = {
  getUserWarnings,
  getActiveUserWarnings,
  getWarning,
  getSeenWarningIds,
  markWarningsAsSeen,
  hasUnseenWarnings,
  getUnseenWarnings,
}

export default warningsService
