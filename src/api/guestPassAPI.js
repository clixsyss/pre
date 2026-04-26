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

import { putItem, queryAll, getItem, updateItem, scan } from '../aws/dynamodbClient'
import fileUploadService from '../services/fileUploadService'
import { projectsUnitGuestPassSettingsService } from '../services/dynamoDBTableServices'
import QRCode from 'qrcode'

const GUEST_PASSES_TABLE = 'projects__guestPasses'
const GUEST_PASS_SETTINGS_TABLE = 'guestPassSettings'
const USERS_TABLE = 'users'

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

const getDaysRemainingInMonthIncludingToday = (date = new Date()) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Math.max(1, daysInMonth - date.getDate() + 1)
}

const normalizeLimit = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

const enforceMonthlyFloor = (monthlyLimit, dailyLimit) => {
  if (dailyLimit === null || dailyLimit === undefined) return normalizeLimit(monthlyLimit, 0)
  const minimumMonthly = dailyLimit * getDaysRemainingInMonthIncludingToday()
  return Math.max(normalizeLimit(monthlyLimit, minimumMonthly), minimumMonthly)
}

const toTimestamp = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return value
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

const getNested = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

// Session-scoped cache: avoids redundant DynamoDB lookups within a single pass-generation flow.
const _userRecordCache = new Map()

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

// Invalidate cached pass counts for a user/project after a new pass is created.
const _invalidatePassCountCache = (projectId, userId) => {
  const key = `${projectId}:${userId}`
  _passCountCache.delete(key)
}

/**
 * Query only this user's passes for the current month using a DynamoDB FilterExpression.
 * Much cheaper than fetching all project passes and filtering in JS.
 */
const _queryUserPassCounts = async (projectId, canonicalUserId, dailyResetAt = null) => {
  const cacheKey = `${projectId}:${canonicalUserId}`
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
    FilterExpression: 'userId = :userId AND createdAt >= :monthStart AND (attribute_not_exists(deleted) OR deleted = :false)',
    ExpressionAttributeValues: {
      ':parentId': projectId,
      ':userId': canonicalUserId,
      ':monthStart': firstDayTimestamp,
      ':false': false,
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

// Resolve users robustly across mixed legacy identifiers (id/authUid/email/uid).
// Strategy: try direct GetItem by 'id' first (O(1)), then fall back to a bounded scan.
const findUserRecord = async (userIdentifier) => {
  if (!userIdentifier) return null

  const target = String(userIdentifier).trim().toLowerCase()

  // 1. Return cached result immediately (avoids repeated DynamoDB calls for same identifier).
  if (_userRecordCache.has(target)) {
    return _userRecordCache.get(target)
  }

  // 2. Try direct point-read: most users have their Cognito sub stored as 'id'.
  try {
    const direct = await getItem(USERS_TABLE, { id: userIdentifier.trim() })
    if (direct) {
      _userRecordCache.set(target, direct)
      return direct
    }
  } catch {
    // GetItem failed (e.g. wrong key type) — fall through to scan.
  }

  // 3. Bounded scan fallback for legacy identifiers that differ from 'id'.
  let lastEvaluatedKey = null
  let scannedCount = 0
  const maxScanItems = 5000

  do {
    const scanOptions = { Limit: 100 }
    if (lastEvaluatedKey) {
      scanOptions.ExclusiveStartKey = lastEvaluatedKey
    }

    const scanResult = await scan(USERS_TABLE, scanOptions)
    const users = Array.isArray(scanResult) ? scanResult : []
    const match = users.find((u) => {
      const candidates = [
        u?.id,
        u?.authUid,
        u?.uid,
        u?.email,
        u?.username,
        getNested(u, 'attributes.sub'),
        getNested(u, 'cognitoAttributes.sub'),
        getNested(u, 'attributes.email'),
        getNested(u, 'cognitoAttributes.email'),
      ]
        .filter(Boolean)
        .map((v) => String(v).trim().toLowerCase())
      return candidates.includes(target)
    })

    if (match) {
      _userRecordCache.set(target, match)
      return match
    }

    lastEvaluatedKey = scanResult?.LastEvaluatedKey || null
    scannedCount += 100
    if (scannedCount >= maxScanItems) {
      console.warn(`⚠️ findUserRecord reached scan cap (${maxScanItems}) for identifier: ${userIdentifier}`)
      break
    }
  } while (lastEvaluatedKey)

  // Cache negative result to avoid repeat scans for the same unknown identifier.
  _userRecordCache.set(target, null)
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

    console.log(`🔍 Checking user eligibility for project ${projectId}`)

    // Get user from DynamoDB (robust lookup for mixed legacy identifiers)
    const user = await findUserRecord(userId)

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
    const userProjects = user.projects || []
    const projectInfo = userProjects.find(project => project.projectId === projectId)
    
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

    // Get global settings for this project
    let globalSettings = {}
    try {
      // guestPassSettings table uses 'id' as the partition key
      const settings = await getItem(GUEST_PASS_SETTINGS_TABLE, { id: projectId })
      globalSettings = settings || {}
      
      // Check if project-wide blocking is enabled
      if (globalSettings.blockAllUsers === true) {
        return {
          success: false,
          error: 'Project blocked',
          message: 'Guest pass generation is currently disabled for all users in this project',
          data: {
            canGenerate: false,
            reason: 'project_blocked',
            user: user,
          },
        }
      }
      
      // Check if family members are blocked
      const userRole = projectInfo.role || user.role || ''
      if (globalSettings.blockFamilyMembers === true && userRole === 'family') {
        return {
          success: false,
          error: 'Family members blocked',
          message: 'Guest pass generation is currently disabled for family members. Only property owners can generate passes.',
          data: {
            canGenerate: false,
            reason: 'family_members_blocked',
            user: user,
          },
        }
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
      globalSettings = {}
    }

    // Get monthly/daily limits (default monthly: 30, daily: disabled)
    let monthlyLimit = normalizeLimit(globalSettings.monthlyLimit, 30)
    let dailyLimit = normalizeLimit(globalSettings.dailyLimit, null)
    let dailyResetAt = toTimestamp(globalSettings.dailyResetAt)
    let unitBlocked = false
    const userUnit = projectInfo.unit || user.unit || ''
    
    // Check per-unit settings if unit exists
    if (userUnit) {
      try {
        const unitSettings = await projectsUnitGuestPassSettingsService.getSettings(projectId, userUnit)
        console.log(`🏠 Unit settings for ${userUnit}:`, unitSettings)
        
        if (unitSettings) {
          // Use unit-specific limit if set
          if (unitSettings.monthlyLimit !== undefined && unitSettings.monthlyLimit !== null) {
            monthlyLimit = normalizeLimit(unitSettings.monthlyLimit, monthlyLimit)
            console.log(`📊 Using unit-specific limit: ${monthlyLimit} for unit ${userUnit}`)
          }
          if (unitSettings.dailyLimit !== undefined && unitSettings.dailyLimit !== null) {
            dailyLimit = normalizeLimit(unitSettings.dailyLimit, dailyLimit)
            console.log(`📊 Using unit-specific daily limit: ${dailyLimit} for unit ${userUnit}`)
          }
          if (unitSettings.dailyResetAt !== undefined && unitSettings.dailyResetAt !== null) {
            dailyResetAt = toTimestamp(unitSettings.dailyResetAt) ?? dailyResetAt
          }
          
          // Check if unit is blocked
          if (unitSettings.blocked === true) {
            unitBlocked = true
            console.log(`🚫 Unit ${userUnit} is blocked`)
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch unit settings:', error)
        // Use global limit if unit settings not found
      }
    }
    
    // Check if unit is blocked
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

    monthlyLimit = enforceMonthlyFloor(monthlyLimit, dailyLimit)

    // Count passes created this month/today for this user (server-side filtered, cached)
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const canonicalUserId = user?.id || userId
      const counts = await _queryUserPassCounts(projectId, canonicalUserId, dailyResetAt)
      usedThisMonth = counts.usedThisMonth
      usedToday = counts.usedToday
      console.log(`📊 Counted ${usedThisMonth} active passes this month, ${usedToday} today for user ${canonicalUserId}`)
    } catch (error) {
      console.error('❌ Error counting monthly passes:', error)
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
          remainingQuota: Math.max(0, monthlyLimit - usedThisMonth),
        },
      }
    }

    if (usedThisMonth >= monthlyLimit) {
      return {
        success: false,
        error: 'Limit reached',
        message: `You have reached your monthly limit of ${monthlyLimit} passes for this project`,
        data: {
          canGenerate: false,
          reason: 'limit_reached',
          user: user,
          usedThisMonth,
          monthlyLimit,
          usedToday,
          dailyLimit,
          dailyRemainingQuota: dailyLimit !== null ? Math.max(0, dailyLimit - usedToday) : null,
          remainingQuota: 0,
        },
      }
    }

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
        remainingQuota: monthlyLimit - usedThisMonth,
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
    // Run eligibility check, settings fetch, and user record fetch all in parallel.
    // eligibility internally calls findUserRecord — the second call hits the session cache.
    const [eligibility, settingsResult, user] = await Promise.all([
      checkUserEligibility(projectId, userId),
      getItem(GUEST_PASS_SETTINGS_TABLE, { id: projectId }).catch(() => null),
      findUserRecord(userId),
    ])

    if (!eligibility.success || !eligibility.data.canGenerate) {
      throw new Error(eligibility.message)
    }

    const validityDurationHours = settingsResult?.validityDurationHours || 2
    console.log(`📋 Using validity duration: ${validityDurationHours} hours`)

    // Calculate validUntil based on current time + validity duration
    const createdAt = new Date()
    const validUntil = new Date(createdAt.getTime() + validityDurationHours * 60 * 60 * 1000)
    console.log(`⏰ Pass valid from ${createdAt.toLocaleString()} until ${validUntil.toLocaleString()}`)

    // Generate unique pass ID
    const passId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()

    // Generate verification token for one-time use
    const verificationToken = `${passId}-${Math.random().toString(36).substr(2, 16)}`.toUpperCase()

    const userCardId = user?.documents?.cardId || null

    // Resolve unit before QR generation (needed in the compact payload)
    const userProjects = user?.projects || []
    const projectInfo = userProjects.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || user?.unit || ''
    console.log(`🏠 Creating pass for unit: ${userUnit}`)

    // Build the canonical QR payload stored on the pass document.
    const qrPayload = {
      v: 1,
      id: passId,
      projectId,
      userId,
      userName,
      guestName,
      unit: userUnit,
      purpose,
      validFrom: createdAt.getTime(),
      validUntil: validUntil.getTime(),
    }

    // Generate QR code as data URL (fast — no network)
    console.log('🎨 Generating QR code...')
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2
    })

    // Compute deterministic S3 URL immediately (no upload needed yet)
    const s3Key = `guestPasses/${projectId}/${passId}.png`
    const qrCodeUrl = _getS3Url(s3Key)
    console.log('🔗 Pre-computed S3 URL:', qrCodeUrl)

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

    console.log('💾 Saving pass to DynamoDB:', { passId, projectId, userId, guestName, purpose, unit: userUnit })

    // Save pass to DynamoDB (awaited — data integrity required)
    await putItem(GUEST_PASSES_TABLE, {
      parentId: projectId,
      id: passId,
      projectId,
      ...passData
    })

    // Bust the pass-count cache so the next eligibility/status check reflects the new pass.
    _invalidatePassCountCache(projectId, userId)

    console.log('✅ Pass saved to DynamoDB with ID:', passId)

    // Upload QR image to S3 in the background — URL already stored in DynamoDB.
    // Parse base64 directly from data URL (avoids a second fetch() round-trip).
    const base64Part = qrCodeDataUrl.split(',')[1]
    const binaryStr = atob(base64Part)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const qrCodeFile = new File([bytes], `${passId}.png`, { type: 'image/png' })

    fileUploadService.uploadFile(qrCodeFile, `guestPasses/${projectId}/`, `${passId}.png`)
      .then(() => console.log('☁️ QR code uploaded to S3 in background:', qrCodeUrl))
      .catch(err => console.warn('⚠️ Background S3 upload failed (pass still valid):', err))

    console.log('✅ Guest pass created successfully:', passId)

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

    console.log('✅ Pass marked as sent successfully')
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
    console.log(`🔍 Verifying pass ${passId} in project ${projectId}`)

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

    console.log(`✅ Pass ${passId} marked as used`)

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

    console.log(`📥 Loading guest pass: ${passId} for project: ${projectId}`)

    // Get the pass from DynamoDB (project tables use parentId as partition key)
    const pass = await getItem(GUEST_PASSES_TABLE, { parentId: projectId, id: passId })

    if (!pass) {
      console.log('❌ Guest pass not found in DynamoDB')
      return null
    }

    // Check if pass is deleted
    if (pass.deleted) {
      console.log('⚠️ Guest pass is marked as deleted')
      return null
    }

    console.log('✅ Guest pass loaded from DynamoDB:', {
      id: pass.id,
      guestName: pass.guestName,
      validUntil: pass.validUntil,
      used: pass.used,
      qrCodeUrl: pass.qrCodeUrl ? 'present' : 'missing'
    })

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
          monthlyLimit: 10,
          usedThisMonth: 0,
          remainingQuota: 10,
        },
      }
    }

    // Get user's unit and role
    const userProjects = user.projects || []
    const projectInfo = userProjects.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || user.unit || ''
    const userRole = projectInfo?.role || user.role || ''
    
    // Get monthly/daily limits from global settings
    let monthlyLimit = 30
    let dailyLimit = null
    let dailyResetAt = null
    let blocked = false
    
    try {
      // guestPassSettings table uses 'id' as the partition key
      const globalSettings = await getItem(GUEST_PASS_SETTINGS_TABLE, { id: projectId })
      
      if (globalSettings?.blockAllUsers === true) {
        blocked = true
      }
      
      if (globalSettings?.blockFamilyMembers === true && userRole === 'family') {
        blocked = true
      }
      
      if (globalSettings?.monthlyLimit) {
        monthlyLimit = normalizeLimit(globalSettings.monthlyLimit, monthlyLimit)
      }
      if (globalSettings?.dailyLimit !== undefined && globalSettings?.dailyLimit !== null) {
        dailyLimit = normalizeLimit(globalSettings.dailyLimit, dailyLimit)
      }
      if (globalSettings?.dailyResetAt !== undefined && globalSettings?.dailyResetAt !== null) {
        dailyResetAt = toTimestamp(globalSettings.dailyResetAt)
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
    }
    
    // Check per-unit settings if unit exists
    if (userUnit) {
      try {
        const unitSettings = await projectsUnitGuestPassSettingsService.getSettings(projectId, userUnit)
        console.log(`🏠 Unit settings for ${userUnit}:`, unitSettings)
        
        if (unitSettings) {
          // Use unit-specific limit if set
          if (unitSettings.monthlyLimit !== undefined && unitSettings.monthlyLimit !== null) {
            monthlyLimit = normalizeLimit(unitSettings.monthlyLimit, monthlyLimit)
            console.log(`📊 Using unit-specific limit: ${monthlyLimit} for unit ${userUnit}`)
          }
          if (unitSettings.dailyLimit !== undefined && unitSettings.dailyLimit !== null) {
            dailyLimit = normalizeLimit(unitSettings.dailyLimit, dailyLimit)
            console.log(`📊 Using unit-specific daily limit: ${dailyLimit} for unit ${userUnit}`)
          }
          if (unitSettings.dailyResetAt !== undefined && unitSettings.dailyResetAt !== null) {
            dailyResetAt = toTimestamp(unitSettings.dailyResetAt) ?? dailyResetAt
          }
          
          // Check if unit is blocked
          if (unitSettings.blocked === true) {
            blocked = true
            console.log(`🚫 Unit ${userUnit} is blocked`)
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch unit settings:', error)
        // Use global limit if unit settings not found
      }
    }
    
    monthlyLimit = enforceMonthlyFloor(monthlyLimit, dailyLimit)

    // Get actual usage for this user this month/today (server-side filtered, cached)
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const canonicalUserId = user?.id || userId
      const counts = await _queryUserPassCounts(projectId, canonicalUserId, dailyResetAt)
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
        remainingQuota: Math.max(0, monthlyLimit - usedThisMonth),
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
    console.log(`📥 Loading guest passes for project ${projectId}, unit: ${unit || 'NO UNIT (using userId)'}`)

    // Push the unit/userId filter server-side so DynamoDB skips irrelevant items.
    // Limit to the 50 most recent passes to keep response size bounded.
    const filterField = unit ? 'unit' : 'userId'
    const filterValue = unit || userId
    const passes = await queryAll(GUEST_PASSES_TABLE, {
      KeyConditionExpression: 'parentId = :parentId',
      FilterExpression: `#filterField = :filterValue AND (attribute_not_exists(deleted) OR deleted = :false)`,
      ExpressionAttributeNames: { '#filterField': filterField },
      ExpressionAttributeValues: {
        ':parentId': projectId,
        ':filterValue': filterValue,
        ':false': false,
      },
      pageSize: 100,
      maxPages: 10,
    })

    console.log(`📊 Found ${passes.length} passes for project (server-side filtered)`)

    // Sort by createdAt descending (newest first) and cap at 50 for display.
    const filteredPasses = passes
      .filter(p => p.deleted !== true)
      .sort((a, b) => {
        const aTime = a.createdAt || 0
        const bTime = b.createdAt || 0
        return bTime - aTime
      })
      .slice(0, 50)
    
    console.log(`✅ Filtered to ${filteredPasses.length} passes for ${unit ? `unit ${unit}` : `user ${userId}`}`)
    
    // Convert timestamps to ISO strings for compatibility
    const convertTimestamp = (timestamp) => {
      if (!timestamp) return null
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString()
      }
      return timestamp
    }
    
    // Format passes for display
    return filteredPasses.map(pass => ({
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
  } catch (error) {
    console.error('❌ Error loading guest passes:', error)
    throw error
  }
}
