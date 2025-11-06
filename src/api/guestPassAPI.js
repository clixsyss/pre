import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase'
import firestoreService from '../services/firestoreService'
import QRCode from 'qrcode'

/**
 * Centralized Guest Pass API
 *
 * This API provides the correct way to check user eligibility and create guest passes.
 * Always use these functions instead of direct Firebase queries to ensure consistency.
 */

/**
 * Check if a user is eligible to generate guest passes
 * @param {string} projectId - Project ID (optional for now)
 * @param {string} userId - User ID to check
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

    // Check if user exists and get their data
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
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

    const userData = userDoc.data()
    
    // Check if user belongs to this project
    if (!userData.projects || !Array.isArray(userData.projects)) {
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
    
    const projectInfo = userData.projects.find(project => project.projectId === projectId)
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

    // Get per-project user settings
    let userSettings = {}
    try {
      const userSettingsResult = await firestoreService.getDoc(`projects/${projectId}/userGuestPassSettings/${userId}`)
      userSettings = userSettingsResult?.data?.() || userSettingsResult || {}
      console.log(`📋 Per-project settings for user ${userId}:`, userSettings)
    } catch {
      console.log(`ℹ️ No per-project settings found for user ${userId}, will use defaults`)
      userSettings = {} // Ensure it's always an object
    }

    // Check if user is blocked in this specific project
    const blocked = userSettings.blocked ?? false
    if (blocked) {
      return {
        success: false,
        error: 'User blocked',
        message: 'User is blocked from generating passes in this project',
        data: {
          canGenerate: false,
          reason: 'blocked',
          user: userData,
          blockingDetails: {
            reason: userSettings.blockedReason || 'Blocked by admin',
            blockedAt: userSettings.blockedAt || null,
          },
        },
      }
    }

    // Get monthly limit - per-unit hierarchy:
    // 1. Check if project-wide blocking is enabled → block everyone
    // 2. Check if unit is blocked → block entire unit
    // 3. If unit has custom limit → use that
    // 4. If NO custom unit limit → use global project limit
    // This allows different limits per unit (property/apartment)
    
    let monthlyLimit = 30 // Final fallback
    const userUnit = projectInfo.unit || userData.unit || ''
    
    console.log(`🏠 User unit: ${userUnit}`)
    
    // Get global settings for this project
    let globalSettings = {}
    try {
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      globalSettings = globalSettingsResult?.data?.() || globalSettingsResult || {}
      
      // Check if project-wide blocking is enabled
      if (globalSettings.blockAllUsers === true) {
        console.log(`🚫 Project-wide blocking is ENABLED for project ${projectId}`)
        return {
          success: false,
          error: 'Project blocked',
          message: 'Guest pass generation is currently disabled for all users in this project',
          data: {
            canGenerate: false,
            reason: 'project_blocked',
            user: userData,
          },
        }
      }
      
      // Check if family members are blocked (role-based blocking)
      const userRole = projectInfo.role || userData.role || ''
      console.log(`👥 User role in project: ${userRole}`)
      
      if (globalSettings.blockFamilyMembers === true && userRole === 'family') {
        console.log(`🚫 Family members blocking is ENABLED for project ${projectId}`)
        return {
          success: false,
          error: 'Family members blocked',
          message: 'Guest pass generation is currently disabled for family members. Only property owners can generate passes.',
          data: {
            canGenerate: false,
            reason: 'family_members_blocked',
            user: userData,
          },
        }
      }
      
      if (globalSettings.monthlyLimit) {
        // Handle both string and number values
        monthlyLimit = typeof globalSettings.monthlyLimit === 'string'
          ? parseInt(globalSettings.monthlyLimit, 10)
          : globalSettings.monthlyLimit
        console.log(`🌐 Global limit for project ${projectId}:`, monthlyLimit)
      } else {
        console.warn(`⚠️ No global limit found for project ${projectId}, using fallback: ${monthlyLimit}`)
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
      console.log(`Using fallback limit: ${monthlyLimit}`)
      globalSettings = {} // Ensure it's always an object
    }
    
    // Check if unit is blocked (per-unit blocking takes precedence)
    let unitSettings = {}
    if (userUnit) {
      try {
        const unitSettingsResult = await firestoreService.getDoc(`projects/${projectId}/unitGuestPassSettings/${userUnit}`)
        unitSettings = unitSettingsResult?.data?.() || unitSettingsResult || {}
        console.log(`🏠 Per-unit settings for unit ${userUnit}:`, unitSettings)
        
        // Check if unit is blocked
        if (unitSettings.blocked === true) {
          return {
            success: false,
            error: 'Unit blocked',
            message: 'Guest pass generation is blocked for your unit',
            data: {
              canGenerate: false,
              reason: 'unit_blocked',
              user: userData,
              blockingDetails: {
                reason: unitSettings.blockedReason || 'Blocked by admin',
                blockedAt: unitSettings.blockedAt || null,
              },
            },
          }
        }
        
        // Override with per-unit limit if set
        if (unitSettings.monthlyLimit !== undefined && unitSettings.monthlyLimit !== null) {
          monthlyLimit = typeof unitSettings.monthlyLimit === 'string'
            ? parseInt(unitSettings.monthlyLimit, 10)
            : unitSettings.monthlyLimit
          console.log(`🎯 Unit ${userUnit} has CUSTOM limit:`, monthlyLimit)
        } else {
          console.log(`🌐 Unit ${userUnit} using GLOBAL limit:`, monthlyLimit)
        }
      } catch {
        console.log(`ℹ️ No per-unit settings found for unit ${userUnit}, using global limit`)
        unitSettings = {} // Ensure it's always an object
      }
    }
    
    // Backward compatibility: Check old per-user settings (DEPRECATED)
    // This will be removed in future versions
    if (userSettings.blocked === true) {
      console.warn('⚠️ Using DEPRECATED per-user blocking. Please migrate to per-unit blocking.')
      return {
        success: false,
        error: 'User blocked',
        message: 'You are blocked from generating passes in this project',
        data: {
          canGenerate: false,
          reason: 'blocked',
          user: userData,
        },
      }
    }
    
    // Count actual passes for this month PER USER
    // Each user in a unit gets their own independent limit
    let usedThisMonth = 0
    
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      console.log(`📊 Counting passes for USER ${userId} in unit ${userUnit} since ${firstDayOfMonth}`)
      
      // Always count PER USER (not per unit)
      // Query passes created this month for this USER in this project
      const result = await firestoreService.getDocs(
        `projects/${projectId}/guestPasses`,
        {
          filters: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'createdAt', operator: '>=', value: firstDayOfMonth }
          ]
        },
        8000 // timeout - force fresh query, bypass cache
      )
      
      // Filter out soft-deleted passes (they don't count toward limit anymore)
      const activePasses = (result?.docs || []).filter(docSnapshot => {
        const docData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot
        return !docData.deleted // Exclude passes with deleted: true
      })
      
      usedThisMonth = activePasses.length
      console.log(`📊 Counted ${usedThisMonth} ACTIVE passes this month for USER ${userId} in unit ${userUnit} (${result?.docs?.length || 0} total, excluding deleted)`)
    } catch (error) {
      console.error('❌ Error counting monthly passes:', error)
      // If counting fails, fall back to 0
      usedThisMonth = 0
    }

    if (usedThisMonth >= monthlyLimit) {
      return {
        success: false,
        error: 'Limit reached',
        message: `You have reached your monthly limit of ${monthlyLimit} passes for this project`,
        data: {
          canGenerate: false,
          reason: 'limit_reached',
          user: userData,
          usedThisMonth,
          monthlyLimit,
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
        user: userData,
        usedThisMonth,
        monthlyLimit,
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
 * Create a guest pass record in Firebase
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID creating the pass
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
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      const globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
      validityDurationHours = globalSettingsDoc?.validityDurationHours || 2
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

    // Generate QR code data with verification token
    const qrData = JSON.stringify({
      passId: passId,
      projectId: projectId,
      guestName: guestName,
      validUntil: validUntil.toISOString(),
      createdAt: createdAt.toISOString(),
      verificationToken: verificationToken
    })

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

    // Upload QR code to Firebase Storage
    console.log('☁️ Uploading QR code to Firebase Storage...')
    const storageRef = ref(storage, `guestPasses/${projectId}/${passId}.png`)
    await uploadBytes(storageRef, blob)
    const qrCodeUrl = await getDownloadURL(storageRef)
    console.log('✅ QR code uploaded successfully:', qrCodeUrl)

    // Get user's unit info (reuse eligibility data from earlier check)
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()
    const projectInfo = userData.projects?.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || userData.unit || ''
    
    console.log(`🏠 Creating pass for unit: ${userUnit}`)
    
    // Prepare pass data
    const passData = {
      id: passId,
      projectId: projectId,
      userId: userId,
      userName: userName,
      unit: userUnit, // Store unit for per-unit tracking
      guestName: guestName,
      purpose: purpose,
      validFrom: createdAt, // ✅ Add validFrom field
      validUntil: validUntil,
      phoneNumber: phoneNumber,
      createdAt: createdAt,
      sentStatus: false,
      sentAt: null,
      qrCodeUrl: qrCodeUrl,
      used: false,
      usedAt: null,
      verificationToken: verificationToken,
      updatedAt: createdAt,
    }
    
    console.log('💾 Saving pass to Firestore:', {
      passId,
      projectId,
      userId,
      guestName,
      purpose,
      unit: userUnit,
      path: `projects/${projectId}/guestPasses/${passId}`
    })
    
    // Create pass record in Firebase - use passId as document ID for easy public lookup
    const passRef = doc(db, `projects/${projectId}/guestPasses`, passId)
    await setDoc(passRef, passData)
    
    console.log('✅ Pass saved to Firestore with ID:', passId)

    // Update UNIT usage count in per-unit settings
    if (userUnit) {
      const unitSettingsRef = doc(db, `projects/${projectId}/unitGuestPassSettings`, userUnit)
      
      // Count current passes for this UNIT to get accurate count
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const result = await firestoreService.getDocs(
        `projects/${projectId}/guestPasses`,
        {
          filters: [
            { field: 'unit', operator: '==', value: userUnit },
            { field: 'createdAt', operator: '>=', value: firstDayOfMonth }
          ]
        }
      )
      const newUsed = result?.docs?.length || 0
      
      // Update or create per-unit settings
      try {
        const unitSettingsDoc = await getDoc(unitSettingsRef)
        if (unitSettingsDoc.exists()) {
          await updateDoc(unitSettingsRef, {
            usedThisMonth: newUsed,
            lastPassCreated: serverTimestamp(),
            lastPassCreatedBy: userId,
            lastPassCreatedByName: userName,
            updatedAt: serverTimestamp(),
          })
        } else {
          // Create new settings document
          await setDoc(unitSettingsRef, {
            usedThisMonth: newUsed,
            lastPassCreated: serverTimestamp(),
            lastPassCreatedBy: userId,
            lastPassCreatedByName: userName,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          })
        }
        
        console.log(`✅ Updated per-unit settings for unit ${userUnit} in project ${projectId}: used=${newUsed}`)
      } catch (error) {
        console.warn('⚠️ Could not update per-unit settings:', error)
        // Continue anyway, the pass was created successfully
      }
    }

    console.log('✅ Guest pass created successfully:', passId)

    return {
      success: true,
      passId: passId,
      passRef: passId, // Document ID is now the same as passId
      qrCodeUrl: qrCodeUrl,
      data: {
        id: passId,
        projectId: projectId,
        userId: userId,
        userName: userName,
        guestName: guestName,
        purpose: purpose,
        validUntil: validUntil,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      },
    }
  } catch (error) {
    console.error('❌ Error creating guest pass:', error)
    throw error
  }
}

/**
 * Mark a pass as sent (after WhatsApp delivery)
 * @param {string} passRefId - Firebase document ID of the pass
 * @param {string} projectId - Project ID (required for project-specific collection)
 * @returns {Promise<boolean>} Success status
 */
export const markPassAsSent = async (passRefId, projectId) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required to mark pass as sent')
    }

    const passRef = doc(db, `projects/${projectId}/guestPasses`, passRefId)

    await updateDoc(passRef, {
      sentStatus: true,
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log('✅ Pass marked as sent successfully')
    return true
  } catch (error) {
    console.error('❌ Error marking pass as sent:', error)
    throw error
  }
}

/**
 * Get user status and limits
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID (optional, for global settings)
 * @returns {Promise<Object>} User status
 */
export const getUserStatus = async (userId, projectId = null) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    
    // If no projectId provided, return basic user info
    if (!projectId) {
      return {
        success: true,
        data: {
          userId: userId,
          name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email,
          blocked: false,
          monthlyLimit: 10,
          usedThisMonth: 0,
          remainingQuota: 10,
        },
      }
    }

    // Get user's unit and role
    const projectInfo = userData.projects?.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || userData.unit || ''
    const userRole = projectInfo?.role || userData.role || ''
    const isFamilyMember = userRole === 'family'
    
    // Get monthly limit - check global settings first, then per-unit settings
    let monthlyLimit = 30
    let blocked = false
    
    try {
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      const globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
      
      // Check project-wide blocking
      if (globalSettingsDoc?.blockAllUsers === true) {
        blocked = true
      }
      
      // Check family members blocking
      if (globalSettingsDoc?.blockFamilyMembers === true && isFamilyMember) {
        blocked = true
      }
      
      if (globalSettingsDoc?.monthlyLimit) {
        // Handle both string and number values
        monthlyLimit = typeof globalSettingsDoc.monthlyLimit === 'string'
          ? parseInt(globalSettingsDoc.monthlyLimit, 10)
          : globalSettingsDoc.monthlyLimit
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
    }
    
    // Get per-unit settings
    let unitSettings = {}
    if (userUnit) {
      try {
        const unitSettingsResult = await firestoreService.getDoc(`projects/${projectId}/unitGuestPassSettings/${userUnit}`)
        unitSettings = unitSettingsResult.data ? unitSettingsResult.data() : unitSettingsResult
        
        // Check if unit is blocked
        if (unitSettings.blocked === true) {
          blocked = true
        }
        
        // Override with per-unit limit if set
        if (unitSettings.monthlyLimit !== undefined && unitSettings.monthlyLimit !== null) {
          monthlyLimit = typeof unitSettings.monthlyLimit === 'string'
            ? parseInt(unitSettings.monthlyLimit, 10)
            : unitSettings.monthlyLimit
        }
      } catch {
        console.log(`ℹ️ No per-unit settings found for unit ${userUnit} in project ${projectId}`)
      }
    }
    
    // Get actual usage for this UNIT this month
    let usedThisMonth = 0
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      if (userUnit) {
        const result = await firestoreService.getDocs(
          `projects/${projectId}/guestPasses`,
          {
            filters: [
              { field: 'unit', operator: '==', value: userUnit },
              { field: 'createdAt', operator: '>=', value: firstDayOfMonth }
            ]
          }
        )
        usedThisMonth = result?.docs?.length || 0
      } else {
        // Fallback to per-user for backward compatibility
        const result = await firestoreService.getDocs(
          `projects/${projectId}/guestPasses`,
          {
            filters: [
              { field: 'userId', operator: '==', value: userId },
              { field: 'createdAt', operator: '>=', value: firstDayOfMonth }
            ]
          }
        )
        usedThisMonth = result?.docs?.length || 0
      }
    } catch (error) {
      console.error('❌ Error counting passes:', error)
    }

    return {
      success: true,
      data: {
        userId: userId,
        name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        unit: userUnit,
        blocked: blocked,
        monthlyLimit: monthlyLimit,
        usedThisMonth: usedThisMonth,
        remainingQuota: Math.max(0, monthlyLimit - usedThisMonth),
      },
    }
  } catch (error) {
    console.error('❌ Error getting user status:', error)
    throw error
  }
}

/**
 * Initialize user with guest pass data (call when user first accesses guest passes)
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} Success status
 */
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

    // Find the pass document
    const passesResult = await firestoreService.getDocs(
      `projects/${projectId}/guestPasses`,
      {
        filters: [
          { field: 'id', operator: '==', value: passId }
        ]
      }
    )

    if (!passesResult?.docs || passesResult.docs.length === 0) {
      return {
        success: false,
        error: 'Pass not found',
        message: 'This guest pass does not exist'
      }
    }

    const passDoc = passesResult.docs[0]
    const passData = passDoc.data ? passDoc.data() : passDoc
    const passRef = doc(db, `projects/${projectId}/guestPasses`, passDoc.id)

    // Verify the token
    if (passData.verificationToken !== verificationToken) {
      return {
        success: false,
        error: 'Invalid token',
        message: 'Invalid verification token'
      }
    }

    // Check if already used
    if (passData.used) {
      return {
        success: false,
        error: 'Already used',
        message: 'This pass has already been used',
        data: {
          usedAt: passData.usedAt
        }
      }
    }

    // Check if expired
    const now = new Date()
    const validUntil = new Date(passData.validUntil)
    if (now > validUntil) {
      return {
        success: false,
        error: 'Expired',
        message: 'This pass has expired'
      }
    }

    // Mark as used
    await updateDoc(passRef, {
      used: true,
      usedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    console.log(`✅ Pass ${passId} marked as used`)

    return {
      success: true,
      message: 'Pass verified and marked as used',
      data: {
        passId: passId,
        guestName: passData.guestName,
        purpose: passData.purpose,
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

export const initializeUser = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const guestPassData = userData.guestPassData || {}

    // Only initialize if not already initialized
    if (!guestPassData.monthlyLimit) {
      await updateDoc(userDocRef, {
        guestPassData: {
          ...guestPassData,
          monthlyLimit: 10,
          usedThisMonth: 0,
          blocked: false,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })

      console.log('✅ User initialized with guest pass data')
    }

    return true
  } catch (error) {
    console.error('❌ Error initializing user:', error)
    throw error
  }
}
