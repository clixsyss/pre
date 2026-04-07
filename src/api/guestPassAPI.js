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

import { putItem, query, getItem, updateItem, scan } from '../aws/dynamodbClient'
import fileUploadService from '../services/fileUploadService'
import { projectsUnitGuestPassSettingsService } from '../services/dynamoDBTableServices'
import QRCode from 'qrcode'

const GUEST_PASSES_TABLE = 'projects__guestPasses'
const GUEST_PASS_SETTINGS_TABLE = 'guestPassSettings'
const USERS_TABLE = 'users'

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

// Resolve users robustly across mixed legacy identifiers (id/authUid/email/uid).
const findUserRecord = async (userIdentifier) => {
  if (!userIdentifier) return null

  const target = String(userIdentifier).trim().toLowerCase()
  let lastEvaluatedKey = null
  let scannedCount = 0
  const maxScanItems = 10000

  do {
    const scanOptions = { Limit: 500 }
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

    if (match) return match

    lastEvaluatedKey = scanResult?.LastEvaluatedKey || null
    scannedCount += 500
    if (scannedCount >= maxScanItems) {
      console.warn(`⚠️ findUserRecord reached scan cap (${maxScanItems}) for identifier: ${userIdentifier}`)
      break
    }
  } while (lastEvaluatedKey)

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

    // Count passes created this month/today for this user
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Query passes for this project (partition key is parentId, not projectId)
      // Then filter by userId and createdAt in application code
      const passes = await query(GUEST_PASSES_TABLE, {
        KeyConditionExpression: 'parentId = :parentId',
        ExpressionAttributeValues: {
          ':parentId': projectId
        }
      })
      
      // Filter in application code: userId, createdAt, and not deleted
      const firstDayTimestamp = firstDayOfMonth.getTime()
      const startOfTodayTimestamp = startOfToday.getTime()
      const effectiveStartOfToday = dailyResetAt && dailyResetAt > startOfTodayTimestamp
        ? dailyResetAt
        : startOfTodayTimestamp
      const canonicalUserId = user?.id || userId
      const userPasses = passes.filter(p => p.userId === canonicalUserId && !p.deleted)
      usedThisMonth = passes.filter(p => 
        p.userId === canonicalUserId &&
        p.createdAt >= firstDayTimestamp && 
        !p.deleted
      ).length
      usedToday = userPasses.filter(p => p.createdAt >= effectiveStartOfToday).length
      
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
    // First check eligibility
    const eligibility = await checkUserEligibility(projectId, userId)

    if (!eligibility.success || !eligibility.data.canGenerate) {
      throw new Error(eligibility.message)
    }

    // Get global settings to determine validity duration
    let validityDurationHours = 2 // Default: 2 hours
    try {
      // guestPassSettings table uses 'id' as the partition key
      const globalSettings = await getItem(GUEST_PASS_SETTINGS_TABLE, { id: projectId })
      validityDurationHours = globalSettings?.validityDurationHours || 2
      console.log(`📋 Using validity duration: ${validityDurationHours} hours`)
    } catch {
      console.log('ℹ️ No global settings found, using default validity duration: 2 hours')
    }

    // Calculate validUntil based on current time + validity duration
    const createdAt = new Date()
    const validUntil = new Date(createdAt.getTime() + validityDurationHours * 60 * 60 * 1000)
    console.log(`⏰ Pass valid from ${createdAt.toLocaleString()} until ${validUntil.toLocaleString()}`)

    // Generate unique pass ID
    const passId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()

    // Generate verification token for one-time use
    const verificationToken = `${passId}-${Math.random().toString(36).substr(2, 16)}`.toUpperCase()

    // Look up the user's registered card ID for QR code content
    const user = await findUserRecord(userId)
    const userCardId = user?.documents?.cardId || null

    // QR code data MUST be unique per generated pass.
    // Keep cardId in payload (if present) but always include pass-specific identifiers.
    const qrPayload = {
      type: 'guest_pass',
      version: 1,
      passId: passId,
      projectId: projectId,
      verificationToken: verificationToken,
      cardId: userCardId || null,
      guestName: guestName,
      validUntil: validUntil.toISOString(),
      createdAt: createdAt.toISOString(),
    }
    const qrData = JSON.stringify(qrPayload)

    // Generate QR code as data URL
    console.log('🎨 Generating QR code...')
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2
    })

    // Convert data URL to blob
    const response = await fetch(qrCodeDataUrl)
    const blob = await response.blob()

    // Convert blob to File for S3 upload
    const qrCodeFile = new File([blob], `${passId}.png`, { type: 'image/png' })

    // Upload QR code to S3 (AWS, NOT Firebase)
    console.log('☁️ Uploading QR code to S3 (AWS)...')
    const qrCodeUrl = await fileUploadService.uploadFile(
      qrCodeFile,
      `guestPasses/${projectId}/`,
      `${passId}.png`
    )
    console.log('✅ QR code uploaded successfully to S3:', qrCodeUrl)
    console.log('🔍 QR code URL type check:', {
      isS3: qrCodeUrl.includes('s3.amazonaws.com') || qrCodeUrl.includes('.s3.'),
      isFirebase: qrCodeUrl.includes('firebasestorage.googleapis.com') || qrCodeUrl.includes('firebase'),
      url: qrCodeUrl
    })
    
    // Verify it's an S3 URL, not Firebase
    if (qrCodeUrl.includes('firebasestorage.googleapis.com') || qrCodeUrl.includes('firebase')) {
      console.error('❌ ERROR: QR code URL is still pointing to Firebase! This should be an S3 URL.')
      throw new Error('QR code upload failed - URL is pointing to Firebase instead of S3')
    }

    // Get user's unit info (user already fetched above for cardId lookup)
    const userProjects = user?.projects || []
    const projectInfo = userProjects.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || user?.unit || ''
    
    console.log(`🏠 Creating pass for unit: ${userUnit}`)
    
    // Prepare pass data
    const passData = {
      id: passId,
      projectId: projectId,
      userId: userId,
      userName: userName,
      unit: userUnit,
      guestName: guestName,
      purpose: purpose,
      validFrom: createdAt.getTime(),
      validUntil: validUntil.getTime(),
      phoneNumber: phoneNumber,
      createdAt: createdAt.getTime(),
      sentStatus: false,
      sentAt: null,
      qrCodeUrl: qrCodeUrl,
      used: false,
      usedAt: null,
      verificationToken: verificationToken,
      cardId: userCardId || null,
      updatedAt: createdAt.getTime(),
      deleted: false
    }
    
    console.log('💾 Saving pass to DynamoDB:', {
      passId,
      projectId,
      userId,
      guestName,
      purpose,
      unit: userUnit,
    })
    
    // Save pass to DynamoDB
    // Note: DynamoDB requires a partition key and sort key
    // Project tables use parentId as partition key and id as sort key
    await putItem(GUEST_PASSES_TABLE, {
      parentId: projectId, // Partition key (project tables use parentId)
      id: passId, // Sort key
      projectId: projectId, // Also store projectId for reference
      ...passData
    })
    
    console.log('✅ Pass saved to DynamoDB with ID:', passId)

    console.log('✅ Guest pass created successfully:', passId)

    return {
      success: true,
      passId: passId,
      passRef: passId,
      qrCodeUrl: qrCodeUrl,
      data: {
        id: passId,
        projectId: projectId,
        userId: userId,
        userName: userName,
        guestName: guestName,
        purpose: purpose,
        unit: userUnit,
        validUntil: validUntil,
        phoneNumber: phoneNumber,
        createdAt: createdAt,
        cardId: userCardId || null,
        verificationToken: verificationToken,
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

    // Get actual usage for this user this month/today
    let usedThisMonth = 0
    let usedToday = 0
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Query passes for this project (partition key is parentId, not projectId)
      // Then filter in application code
      const passes = await query(GUEST_PASSES_TABLE, {
        KeyConditionExpression: 'parentId = :parentId',
        ExpressionAttributeValues: {
          ':parentId': projectId
        }
      })
      
      // Filter in application code
      const firstDayTimestamp = firstDayOfMonth.getTime()
      const startOfTodayTimestamp = startOfToday.getTime()
      const effectiveStartOfToday = dailyResetAt && dailyResetAt > startOfTodayTimestamp
        ? dailyResetAt
        : startOfTodayTimestamp
      const canonicalUserId = user?.id || userId
      const userPasses = passes.filter(p => p.userId === canonicalUserId && !p.deleted)
      usedThisMonth = userPasses.filter(p => p.createdAt >= firstDayTimestamp).length
      usedToday = userPasses.filter(p => p.createdAt >= effectiveStartOfToday).length
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
    
    // Query all passes for this project (partition key is parentId)
    const passes = await query(GUEST_PASSES_TABLE, {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': projectId
      }
    })
    
    console.log(`📊 Found ${passes.length} total passes for project`)
    
    // Filter passes:
    // 1. Not deleted
    // 2. Match unit (if unit provided) OR match userId (if no unit)
    // 3. Sort by createdAt descending (newest first)
    const filteredPasses = passes
      .filter(p => {
        // Filter out deleted passes
        if (p.deleted === true) return false
        
        // Filter by unit or userId
        if (unit) {
          return p.unit === unit
        } else {
          return p.userId === userId
        }
      })
      .sort((a, b) => {
        // Sort by createdAt descending (newest first)
        const aTime = a.createdAt || 0
        const bTime = b.createdAt || 0
        return bTime - aTime
      })
    
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
