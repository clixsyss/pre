/**
 * AWS-Based Guest Pass API
 * 
 * This API provides guest pass functionality using AWS services:
 * - DynamoDB for data storage (projects__guestPasses table)
 * - S3 for QR code image storage
 * - Cognito for user authentication
 * 
 * Replaces Firebase/Firestore implementation with AWS-only solution
 */

import { putItem, queryAll, getItem, updateItem } from '../aws/dynamodbClient'
import fileUploadService from '../services/fileUploadService'
import { projectsUnitGuestPassSettingsService } from '../services/dynamoDBTableServices'
import { getUserById, getUserByAuthUid, getUserByEmail } from '../services/dynamoDBUsersService'
import QRCode from 'qrcode'

const GUEST_PASSES_TABLE = 'projects__guestPasses'
const GUEST_PASS_SETTINGS_TABLE = 'guestPassSettings'

// ─── Scanner QR encoding (must stay in sync with scanner/qr-decryptor.js) ────
// Chars match qr-decryptor.js CHARS — do not reorder.
const _SCANNER_CHARS = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~"
const _SCANNER_BASE = BigInt(_SCANNER_CHARS.length)

export async function _buildScannerQrString(payload) {
  const secretKey = (import.meta.env.VITE_PI_SECRET_KEY || '').trim()
  const enc = new TextEncoder()
  // SHA-256 → first 16 bytes as XOR key (matches scanner's .subarray(0,16))
  const keyBuf = await crypto.subtle.digest('SHA-256', enc.encode(secretKey))
  const key = new Uint8Array(keyBuf, 0, 16)
  const jsonBytes = enc.encode(JSON.stringify(payload))
  const xored = new Uint8Array(jsonBytes.length)
  for (let i = 0; i < jsonBytes.length; i++) xored[i] = jsonBytes[i] ^ key[i % 16]
  // Base-94 encode
  let n = 0n
  for (const b of xored) n = n * 256n + BigInt(b)
  if (n === 0n) return _SCANNER_CHARS[0]
  const out = []
  while (n > 0n) { out.push(_SCANNER_CHARS[Number(n % _SCANNER_BASE)]); n /= _SCANNER_BASE }
  return out.reverse().join('')
}
// ─────────────────────────────────────────────────────────────────────────────

// Mirrors fileUploadService.getS3Url — computes the deterministic S3 URL without uploading.
const _S3_BUCKET = 'pre-app-user-images'
const _S3_REGION =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AWS_REGION) ||
  (typeof process !== 'undefined' && process.env?.AWS_REGION) ||
  (typeof process !== 'undefined' && process.env?.VITE_AWS_REGION) ||
  'us-east-1'
const _getS3Url = (key) => `https://${_S3_BUCKET}.s3.${_S3_REGION}.amazonaws.com/${key}`

const isResidentGuestPass = (pass) => pass?.purpose !== 'gate_scan'

// Monthly helper intentionally disabled in app (daily-limit-only mode).
// const getDaysRemainingInMonthIncludingToday = (date = new Date()) => {
//   const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
//   return Math.max(1, daysInMonth - date.getDate() + 1)
// }

const normalizeLimit = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

// Monthly helper intentionally disabled in app (daily-limit-only mode).
// const enforceMonthlyFloor = (monthlyLimit, dailyLimit) => {
//   if (dailyLimit === null || dailyLimit === undefined) return normalizeLimit(monthlyLimit, 0)
//   const minimumMonthly = dailyLimit * getDaysRemainingInMonthIncludingToday()
//   return Math.max(normalizeLimit(monthlyLimit, minimumMonthly), minimumMonthly)
// }

const toTimestamp = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return value
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

// Short-lived pass-count cache (60s TTL) so getUserStatus and checkUserEligibility
// share the same DynamoDB result when called back-to-back during pass generation.
const _passCountCache = new Map()
const _PASS_COUNT_TTL_MS = 60_000

const _getCachedPassCounts = (cacheKey) => {
  const entry = _passCountCache.get(cacheKey)
  if (!entry) return null
  if (Date.now() - entry.ts > _PASS_COUNT_TTL_MS) {
    _passCountCache.delete(cacheKey)
    return null
  }
  return entry.value
}

const _setCachedPassCounts = (cacheKey, value) => {
  _passCountCache.set(cacheKey, { ts: Date.now(), value })
}

// Invalidate cached pass counts for a user/project or unit/project after a new pass is created.
const _invalidatePassCountCache = (projectId, ownerKey) => {
  const key = `${projectId}:${ownerKey}`
  _passCountCache.delete(key)
}

// Short-lived passes-list cache (30s TTL) — avoids re-querying DynamoDB on rapid tab revisits.
const _passesListCache = new Map()
const _PASSES_LIST_TTL_MS = 30_000

const _getPassesListCacheKey = (projectId, filterValue) => `${projectId}:${filterValue}`

const _getCachedPassesList = (key) => {
  const entry = _passesListCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > _PASSES_LIST_TTL_MS) { _passesListCache.delete(key); return null }
  return entry.value
}

const _setCachedPassesList = (key, value) => {
  _passesListCache.set(key, { ts: Date.now(), value })
}

const _invalidatePassesList = (projectId, filterValue) => {
  _passesListCache.delete(_getPassesListCacheKey(projectId, filterValue))
}

// Short-lived guest pass settings cache (2min TTL) shared across checkUserEligibility + getUserStatus.
const _settingsCache = new Map()
const _SETTINGS_TTL_MS = 120_000

const _getCachedSettings = (projectId) => {
  const entry = _settingsCache.get(projectId)
  if (!entry) return null
  if (Date.now() - entry.ts > _SETTINGS_TTL_MS) { _settingsCache.delete(projectId); return null }
  return entry.value
}

const _setCachedSettings = (projectId, value) => {
  _settingsCache.set(projectId, { ts: Date.now(), value })
}

const _normalizeProjectEntry = (entry = {}) => {
  if (!entry || typeof entry !== 'object') return {}
  if (entry.M && typeof entry.M === 'object') {
    const m = entry.M
    const readScalar = (key) => {
      if (!m[key]) return undefined
      if (m[key].S !== undefined) return m[key].S
      if (m[key].BOOL !== undefined) return m[key].BOOL
      if (m[key].N !== undefined) return Number(m[key].N)
      if (m[key].L !== undefined) return m[key].L.map((item) => item?.S ?? item).filter(Boolean)
      return m[key]
    }
    return {
      projectId: readScalar('projectId'),
      role: readScalar('role'),
      unit: readScalar('unit'),
      isSuspended: readScalar('isSuspended'),
      suspensionLevel: readScalar('suspensionLevel'),
      blockedFeatures: readScalar('blockedFeatures') || [],
    }
  }
  return entry
}

const _isQrGenerationSuspended = (projectInfo = {}) => {
  const isSuspended = projectInfo?.isSuspended === true || projectInfo?.isSuspended === 'true'
  if (!isSuspended) return false

  const level = String(projectInfo?.suspensionLevel || 'full').toLowerCase()
  if (level === 'full') return true

  const blockedFeatures = Array.isArray(projectInfo?.blockedFeatures) ? projectInfo.blockedFeatures : []
  return blockedFeatures.includes('qr_codes')
}

const _getProjectSettings = async (projectId) => {
  const cached = _getCachedSettings(projectId)
  if (cached !== null) return cached
  try {
    const settings = await getItem(GUEST_PASS_SETTINGS_TABLE, { id: projectId })
    const result = settings || {}
    _setCachedSettings(projectId, result)
    return result
  } catch {
    return {}
  }
}

/**
 * Query resident-created passes for the current month using a DynamoDB FilterExpression.
 * Much cheaper than fetching all project passes and filtering in JS.
 */
const _queryResidentPassCounts = async (projectId, { canonicalUserId, unit = '' }, dailyResetAt = null) => {
  const countField = unit ? 'unit' : 'userId'
  const countValue = unit || canonicalUserId
  const cacheKey = `${projectId}:${countField}:${countValue}`
  const cached = _getCachedPassCounts(cacheKey)
  if (cached) return cached

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const firstDayTimestamp = firstDayOfMonth.getTime()
  const startOfTodayTimestamp = startOfToday.getTime()
  const effectiveStartOfToday = dailyResetAt && dailyResetAt > startOfTodayTimestamp
    ? dailyResetAt
    : startOfTodayTimestamp

  // Fetch only the two fields needed for counting — reduces network payload significantly.
  const passes = await queryAll(GUEST_PASSES_TABLE, {
    KeyConditionExpression: 'parentId = :parentId',
    FilterExpression: '#countField = :countValue AND createdAt >= :monthStart AND (attribute_not_exists(deleted) OR deleted = :false) AND (attribute_not_exists(#purpose) OR #purpose <> :gateScanPurpose)',
    ExpressionAttributeNames: {
      '#countField': countField,
      '#purpose': 'purpose',
    },
    ExpressionAttributeValues: {
      ':parentId': projectId,
      ':countValue': countValue,
      ':monthStart': firstDayTimestamp,
      ':false': false,
      ':gateScanPurpose': 'gate_scan',
    },
    ProjectionExpression: 'createdAt',
    pageSize: 100,
    maxPages: 20,
  })

  const usedThisMonth = passes.length
  const usedToday = passes.filter(p => p.createdAt >= effectiveStartOfToday).length

  const result = { usedThisMonth, usedToday }
  _setCachedPassCounts(cacheKey, result)
  return result
}

// Resolve users via the cached dynamoDBUsersService (5-min TTL, O(1) GetItem first).
// Falls back through authUid → email lookups — all cached between calls.
const findUserRecord = async (userIdentifier) => {
  if (!userIdentifier) return null
  const id = String(userIdentifier).trim()

  // Try by primary key first (covers Cognito sub stored as 'id')
  const byId = await getUserById(id).catch(() => null)
  if (byId) return byId

  // Try by authUid (legacy field)
  const byAuthUid = await getUserByAuthUid(id).catch(() => null)
  if (byAuthUid) return byAuthUid

  // Try by email if the identifier looks like an email
  if (id.includes('@')) {
    const byEmail = await getUserByEmail(id).catch(() => null)
    if (byEmail) return byEmail
  }

  return null
}

/**
 * Check if a user is eligible to generate guest passes
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (Cognito sub)
 * @returns {Promise<Object>} Eligibility result
 */
export const checkUserEligibility = async (projectId, userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Get user and global settings in parallel
    const [user, globalSettings] = await Promise.all([
      findUserRecord(userId),
      _getProjectSettings(projectId),
    ])

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        message: 'User not found in the system',
        data: {
          canGenerate: false,
          reason: 'user_not_found',
          user: null,
        },
      }
    }

    // Check if user belongs to this project
    const userProjects = Array.isArray(user.projects) ? user.projects : []
    const projectInfoRaw = userProjects.find((project) => {
      const normalized = _normalizeProjectEntry(project)
      return normalized.projectId === projectId
    })
    const projectInfo = _normalizeProjectEntry(projectInfoRaw)
    
    if (!projectInfo) {
      return {
        success: false,
        error: 'User not in project',
        message: 'User does not belong to this project',
        data: {
          canGenerate: false,
          reason: 'not_in_project',
          user: null,
        },
      }
    }

    if (_isQrGenerationSuspended(projectInfo)) {
      return {
        success: false,
        error: 'Suspended',
        message: 'Guest pass generation is blocked due to account suspension',
        data: { canGenerate: false, reason: 'suspended', user },
      }
    }

    if (globalSettings.blockAllUsers === true) {
      return {
        success: false,
        error: 'Project blocked',
        message: 'Guest pass generation is currently disabled for all users in this project',
        data: { canGenerate: false, reason: 'project_blocked', user },
      }
    }

    const userRole = projectInfo.role || user.role || ''
    if (globalSettings.blockFamilyMembers === true && userRole === 'family') {
      return {
        success: false,
        error: 'Family members blocked',
        message: 'Guest pass generation is currently disabled for family members. Only property owners can generate passes.',
        data: { canGenerate: false, reason: 'family_members_blocked', user },
      }
    }

    // Daily-limit-only mode: monthly enforcement is intentionally disabled.
    // let monthlyLimit = normalizeLimit(globalSettings.monthlyLimit, 30)
    let monthlyLimit = null
    let dailyLimit = normalizeLimit(globalSettings.dailyLimit, null)
    let dailyResetAt = toTimestamp(globalSettings.dailyResetAt)
    let unitBlocked = false
    const userUnit = projectInfo.unit || user.unit || ''
    
    // Check per-unit settings if unit exists
    if (userUnit) {
      try {
        const unitSettings = await projectsUnitGuestPassSettingsService.getSettings(projectId, userUnit)
        if (unitSettings) {
          if (unitSettings.dailyLimit !== undefined && unitSettings.dailyLimit !== null) {
            dailyLimit = normalizeLimit(unitSettings.dailyLimit, dailyLimit)
          }
          if (unitSettings.dailyResetAt !== undefined && unitSettings.dailyResetAt !== null) {
            dailyResetAt = toTimestamp(unitSettings.dailyResetAt) ?? dailyResetAt
          }
          if (unitSettings.blocked === true) {
            unitBlocked = true
          }
        }
      } catch {
        // Use global limit if unit settings not found
      }
    }

    if (unitBlocked) {
      return {
        success: false,
        error: 'Unit blocked',
        message: 'Guest pass generation is blocked for your unit',
        data: {
          canGenerate: false,
          reason: 'unit_blocked',
          user: user,
        },
      }
    }

    // Monthly floor logic is disabled together with monthly limit enforcement.
    // monthlyLimit = enforceMonthlyFloor(monthlyLimit, dailyLimit)

    // Count resident-created passes this month/today for this unit, falling back to user when no unit exists.
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const canonicalUserId = user?.id || userId
      const counts = await _queryResidentPassCounts(projectId, { canonicalUserId, unit: userUnit }, dailyResetAt)
      usedThisMonth = counts.usedThisMonth
      usedToday = counts.usedToday
    } catch (error) {
      console.error('❌ Error counting passes:', error)
      usedThisMonth = 0
      usedToday = 0
    }

    if (dailyLimit !== null && usedToday >= dailyLimit) {
      return {
        success: false,
        error: 'Daily limit reached',
        message: `You have reached your daily limit of ${dailyLimit} passes for this project`,
        data: {
          canGenerate: false,
          reason: 'daily_limit_reached',
          user: user,
          usedToday,
          dailyLimit,
          dailyRemainingQuota: 0,
          usedThisMonth,
          monthlyLimit,
          // remainingQuota (monthly) intentionally disabled in daily-only mode.
          remainingQuota: null,
        },
      }
    }

    // Monthly limit blocking is intentionally disabled in daily-only mode.
    // if (usedThisMonth >= monthlyLimit) {
    //   return {
    //     success: false,
    //     error: 'Limit reached',
    //     message: `You have reached your monthly limit of ${monthlyLimit} passes for this project`,
    //     data: {
    //       canGenerate: false,
    //       reason: 'limit_reached',
    //       user: user,
    //       usedThisMonth,
    //       monthlyLimit,
    //       usedToday,
    //       dailyLimit,
    //       dailyRemainingQuota: dailyLimit !== null ? Math.max(0, dailyLimit - usedToday) : null,
    //       remainingQuota: 0,
    //     },
    //   }
    // }

    // User is eligible
    return {
      success: true,
      error: null,
      message: 'User is eligible to generate passes in this project',
      data: {
        canGenerate: true,
        reason: 'eligible',
        user: user,
        usedThisMonth,
        monthlyLimit,
        usedToday,
        dailyLimit,
        dailyRemainingQuota: dailyLimit !== null ? Math.max(0, dailyLimit - usedToday) : null,
        // remainingQuota (monthly) intentionally disabled in daily-only mode.
        remainingQuota: null,
      },
    }
  } catch (error) {
    console.error('❌ Error checking user eligibility:', error)
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
 * Create a guest pass record in DynamoDB
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (Cognito sub)
 * @param {string} userName - Name of the user creating the pass
 * @param {string} guestName - Name of the guest
 * @param {string} purpose - Purpose of the visit
 * @param {string} phoneNumber - Phone number for WhatsApp (optional)
 * @returns {Promise<Object>} Created pass data
 */
export const createGuestPass = async (
  projectId,
  userId,
  userName,
  guestName,
  purpose,
  phoneNumber = null,
) => {
  try {
    // Run eligibility check and user record fetch in parallel.
    // _getProjectSettings is cached — no extra DynamoDB call.
    const [eligibility, user] = await Promise.all([
      checkUserEligibility(projectId, userId),
      findUserRecord(userId),
    ])
    const settingsResult = _getCachedSettings(projectId) || await _getProjectSettings(projectId)

    if (!eligibility.success || !eligibility.data.canGenerate) {
      throw new Error(eligibility.message)
    }

    const validityDurationHours = settingsResult?.validityDurationHours || 2

    const createdAt = new Date()
    const validUntil = new Date(createdAt.getTime() + validityDurationHours * 60 * 60 * 1000)

    // Generate unique pass ID
    const passId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()

    // Generate verification token for one-time use
    const verificationToken = `${passId}-${Math.random().toString(36).substr(2, 16)}`.toUpperCase()

    const userCardId = user?.documents?.cardId || null

    // Resolve unit before QR generation (needed in the compact payload)
    const userProjects = user?.projects || []
    const projectInfo = userProjects.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || user?.unit || ''

    // Build the compact QR payload — matches the 'gp' format the gate scanner expects.
    // Short keys keep the QR data small (~185 chars) for fast scanning.
    const qrPayload = {
      t: 'gp',
      i: passId,
      p: projectId,
      g: guestName || '',
      u: userUnit,
      z: ['main'],
      x: validUntil.getTime(),
      c: createdAt.getTime(),
      s: userId,
    }

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: 'L',
      type: 'image/png',
      width: 512,
      margin: 2
    })

    const s3Key = `guestPasses/${projectId}/${passId}.png`
    const qrCodeUrl = _getS3Url(s3Key)

    // Prepare pass data
    const passData = {
      id: passId,
      projectId,
      userId,
      userName,
      unit: userUnit,
      guestName,
      purpose,
      validFrom: createdAt.getTime(),
      validUntil: validUntil.getTime(),
      phoneNumber,
      createdAt: createdAt.getTime(),
      sentStatus: false,
      sentAt: null,
      qrCodeUrl,
      qrPayload,
      used: false,
      usedAt: null,
      verificationToken,
      cardId: userCardId || null,
      updatedAt: createdAt.getTime(),
      deleted: false
    }

    // Save pass to DynamoDB (awaited — data integrity required)
    await putItem(GUEST_PASSES_TABLE, {
      parentId: projectId,
      id: passId,
      projectId,
      ...passData
    })

    _invalidatePassCountCache(projectId, userUnit ? `unit:${userUnit}` : `userId:${userId}`)
    _invalidatePassesList(projectId, userUnit || userId)

    // Upload QR image to S3 in the background — URL already stored in DynamoDB.
    // Parse base64 directly from data URL (avoids a second fetch() round-trip).
    const base64Part = qrCodeDataUrl.split(',')[1]
    const binaryStr = atob(base64Part)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const qrCodeFile = new File([bytes], `${passId}.png`, { type: 'image/png' })

    fileUploadService.uploadFile(qrCodeFile, `guestPasses/${projectId}/`, `${passId}.png`)
      .catch(err => console.warn('⚠️ Background S3 upload failed (pass still valid):', err))

    return {
      success: true,
      passId,
      passRef: passId,
      qrCodeUrl,
      qrImageDataUrl: qrCodeDataUrl, // Inline data URL for instant preview — no network wait
      data: {
        id: passId,
        projectId,
        userId,
        userName,
        guestName,
        purpose,
        unit: userUnit,
        validUntil,
        phoneNumber,
        createdAt,
        cardId: userCardId || null,
        verificationToken,
      },
    }
  } catch (error) {
    console.error('❌ Error creating guest pass:', error)
    throw error
  }
}

/**
 * Mark a pass as sent (after WhatsApp delivery)
 * @param {string} passId - Pass ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} Success status
 */
export const markPassAsSent = async (passId, projectId) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required to mark pass as sent')
    }

    // Project tables use parentId as partition key
    await updateItem(GUEST_PASSES_TABLE, { parentId: projectId, id: passId }, {
      UpdateExpression: 'SET sentStatus = :sentStatus, sentAt = :sentAt, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':sentStatus': true,
        ':sentAt': Date.now(),
        ':updatedAt': Date.now()
      }
    })

    return true
  } catch (error) {
    console.error('❌ Error marking pass as sent:', error)
    throw error
  }
}

/**
 * Verify and mark a guest pass as used (one-time use)
 * @param {string} projectId - Project ID
 * @param {string} passId - Pass ID
 * @param {string} verificationToken - Verification token from QR code
 * @returns {Promise<Object>} Verification result
 */
export const verifyAndUsePass = async (projectId, passId, verificationToken) => {
  try {
    // Get the pass from DynamoDB (project tables use parentId as partition key)
    const pass = await getItem(GUEST_PASSES_TABLE, { parentId: projectId, id: passId })

    if (!pass) {
      return {
        success: false,
        error: 'Pass not found',
        message: 'This guest pass does not exist'
      }
    }

    // Verify the token
    if (pass.verificationToken !== verificationToken) {
      return {
        success: false,
        error: 'Invalid token',
        message: 'Invalid verification token'
      }
    }

    // Check if already used
    if (pass.used) {
      return {
        success: false,
        error: 'Already used',
        message: 'This pass has already been used',
        data: {
          usedAt: pass.usedAt
        }
      }
    }

    // Check if expired
    const now = new Date()
    const validUntil = new Date(pass.validUntil)
    if (now > validUntil) {
      return {
        success: false,
        error: 'Expired',
        message: 'This pass has expired'
      }
    }

    // Mark as used (project tables use parentId as partition key)
    await updateItem(GUEST_PASSES_TABLE, { parentId: projectId, id: passId }, {
      UpdateExpression: 'SET #used = :used, usedAt = :usedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#used': 'used'
      },
      ExpressionAttributeValues: {
        ':used': true,
        ':usedAt': Date.now(),
        ':updatedAt': Date.now()
      }
    })

    return {
      success: true,
      message: 'Pass verified and marked as used',
      data: {
        passId: passId,
        guestName: pass.guestName,
        purpose: pass.purpose,
        usedAt: new Date()
      }
    }
  } catch (error) {
    console.error('❌ Error verifying pass:', error)
    return {
      success: false,
      error: 'Verification failed',
      message: 'Unable to verify pass. Please try again.'
    }
  }
}

/**
 * Get a guest pass by ID (for public viewing)
 * @param {string} projectId - Project ID
 * @param {string} passId - Pass ID
 * @returns {Promise<Object>} Pass data or null if not found
 */
export const getGuestPass = async (projectId, passId) => {
  try {
    if (!projectId || !passId) {
      throw new Error('Project ID and Pass ID are required')
    }

    // Get the pass from DynamoDB (project tables use parentId as partition key)
    const pass = await getItem(GUEST_PASSES_TABLE, { parentId: projectId, id: passId })

    if (!pass) return null
    if (pass.deleted) return null

    // Convert DynamoDB timestamp (number) to Date/ISO string for compatibility
    const convertTimestamp = (timestamp) => {
      if (!timestamp) return null
      // If it's already a number (milliseconds), convert to Date
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString()
      }
      // If it's already a Date or ISO string, return as is
      return timestamp
    }

    return {
      id: pass.id,
      projectId: pass.projectId || projectId,
      userId: pass.userId,
      userName: pass.userName,
      guestName: pass.guestName,
      purpose: pass.purpose || 'Guest Visit',
      unit: pass.unit,
      validFrom: convertTimestamp(pass.validFrom),
      validUntil: convertTimestamp(pass.validUntil),
      createdAt: convertTimestamp(pass.createdAt),
      phoneNumber: pass.phoneNumber || null,
      sentStatus: pass.sentStatus || false,
      sentAt: convertTimestamp(pass.sentAt),
      qrCodeUrl: pass.qrCodeUrl || null,
      used: pass.used || false,
      usedAt: convertTimestamp(pass.usedAt),
      verificationToken: pass.verificationToken,
      cardId: pass.cardId || null,
    }
  } catch (error) {
    console.error('❌ Error getting guest pass:', error)
    throw error
  }
}

/**
 * Get user status and limits
 * @param {string} userId - User ID (Cognito sub)
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} User status
 */
export const getUserStatus = async (userId, projectId = null) => {
  try {
    const user = await findUserRecord(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // If no projectId provided, return basic user info
    if (!projectId) {
      return {
        success: true,
        data: {
          userId: userId,
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          blocked: false,
          monthlyLimit: null,
          usedThisMonth: 0,
          remainingQuota: null,
        },
      }
    }

    // Get user's unit and role
    const userProjects = user.projects || []
    const projectInfo = userProjects.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || user.unit || ''
    const userRole = projectInfo?.role || user.role || ''

    let monthlyLimit = null
    let dailyLimit = null
    let dailyResetAt = null
    let blocked = false

    const globalSettings = await _getProjectSettings(projectId)
    if (globalSettings?.blockAllUsers === true) blocked = true
    if (globalSettings?.blockFamilyMembers === true && userRole === 'family') blocked = true
    if (globalSettings?.dailyLimit !== undefined && globalSettings?.dailyLimit !== null) {
      dailyLimit = normalizeLimit(globalSettings.dailyLimit, dailyLimit)
    }
    if (globalSettings?.dailyResetAt !== undefined && globalSettings?.dailyResetAt !== null) {
      dailyResetAt = toTimestamp(globalSettings.dailyResetAt)
    }
    
    // Check per-unit settings if unit exists
    if (userUnit) {
      try {
        const unitSettings = await projectsUnitGuestPassSettingsService.getSettings(projectId, userUnit)
        if (unitSettings) {
          if (unitSettings.dailyLimit !== undefined && unitSettings.dailyLimit !== null) {
            dailyLimit = normalizeLimit(unitSettings.dailyLimit, dailyLimit)
          }
          if (unitSettings.dailyResetAt !== undefined && unitSettings.dailyResetAt !== null) {
            dailyResetAt = toTimestamp(unitSettings.dailyResetAt) ?? dailyResetAt
          }
          if (unitSettings.blocked === true) blocked = true
        }
      } catch {
        // Use global limit if unit settings not found
      }
    }
    
    // Monthly floor logic is disabled together with monthly limit enforcement.
    // monthlyLimit = enforceMonthlyFloor(monthlyLimit, dailyLimit)

    // Get actual usage for this unit this month/today, falling back to user when no unit exists.
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const canonicalUserId = user?.id || userId
      const counts = await _queryResidentPassCounts(projectId, { canonicalUserId, unit: userUnit }, dailyResetAt)
      usedThisMonth = counts.usedThisMonth
      usedToday = counts.usedToday
    } catch (error) {
      console.error('❌ Error counting passes:', error)
    }

    return {
      success: true,
      data: {
        userId: user?.id || userId,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        unit: userUnit,
        blocked: blocked,
        monthlyLimit: monthlyLimit,
        dailyLimit: dailyLimit,
        usedThisMonth: usedThisMonth,
        usedToday: usedToday,
        // remainingQuota (monthly) intentionally disabled in daily-only mode.
        remainingQuota: null,
        dailyRemainingQuota: dailyLimit !== null ? Math.max(0, dailyLimit - usedToday) : null,
      },
    }
  } catch (error) {
    console.error('❌ Error getting user status:', error)
    throw error
  }
}

/**
 * Get all guest passes for a unit (or user if no unit), sorted by newest first
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (Cognito sub)
 * @param {string} unit - Unit ID (optional)
 * @returns {Promise<Array>} Array of pass objects sorted by createdAt descending
 */
export const getGuestPassesForUnit = async (projectId, userId, unit = null) => {
  try {
    const filterField = unit ? 'unit' : 'userId'
    const filterValue = unit || userId
    const cacheKey = _getPassesListCacheKey(projectId, filterValue)
    const cached = _getCachedPassesList(cacheKey)
    if (cached) return cached

    const passes = await queryAll(GUEST_PASSES_TABLE, {
      KeyConditionExpression: 'parentId = :parentId',
      FilterExpression: `#filterField = :filterValue AND (attribute_not_exists(deleted) OR deleted = :false) AND (attribute_not_exists(#purpose) OR #purpose <> :gateScanPurpose)`,
      ExpressionAttributeNames: { '#filterField': filterField, '#purpose': 'purpose' },
      ExpressionAttributeValues: {
        ':parentId': projectId,
        ':filterValue': filterValue,
        ':false': false,
        ':gateScanPurpose': 'gate_scan',
      },
      pageSize: 100,
      maxPages: 10,
    })

    // Sort by createdAt descending (newest first) and cap at 50 for display.
    const filteredPasses = passes
      .filter(p => p.deleted !== true && isResidentGuestPass(p))
      .sort((a, b) => {
        const aTime = a.createdAt || 0
        const bTime = b.createdAt || 0
        return bTime - aTime
      })
      .slice(0, 50)

    // Convert timestamps to ISO strings for compatibility
    const convertTimestamp = (timestamp) => {
      if (!timestamp) return null
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString()
      }
      return timestamp
    }
    
    const result = filteredPasses.map(pass => ({
      id: pass.id,
      projectId: pass.projectId || projectId,
      userId: pass.userId,
      userName: pass.userName || 'Unknown User',
      guestName: pass.guestName || 'Unknown Guest',
      purpose: pass.purpose || 'Guest Visit',
      unit: pass.unit,
      validFrom: convertTimestamp(pass.validFrom),
      validUntil: convertTimestamp(pass.validUntil),
      createdAt: convertTimestamp(pass.createdAt),
      phoneNumber: pass.phoneNumber || null,
      sentStatus: pass.sentStatus || false,
      sentAt: convertTimestamp(pass.sentAt),
      qrCodeUrl: pass.qrCodeUrl || null,
      used: pass.used || false,
      usedAt: convertTimestamp(pass.usedAt),
      verificationToken: pass.verificationToken,
      cardId: pass.cardId || null,
    }))
    _setCachedPassesList(cacheKey, result)
    return result
  } catch (error) {
    console.error('❌ Error loading guest passes:', error)
    throw error
  }
}
