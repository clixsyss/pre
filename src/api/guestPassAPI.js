import { doc, getDoc, collection, addDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import firestoreService from '../services/firestoreService'

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
      userSettings = userSettingsResult.data ? userSettingsResult.data() : userSettingsResult
      console.log(`📋 Per-project settings for user ${userId}:`, userSettings)
    } catch {
      console.log(`ℹ️ No per-project settings found for user ${userId}, will use defaults`)
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

    // Get monthly limit - per-project hierarchy:
    // 1. If user has custom limit for THIS project → use that
    // 2. If user has NO custom limit for THIS project → use global for THIS project
    // This allows different limits per project for the same user
    
    let monthlyLimit = 10 // Final fallback
    
    // Get global settings for this project
    try {
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      const globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
      
      if (globalSettingsDoc?.monthlyLimit) {
        // Handle both string and number values
        monthlyLimit = typeof globalSettingsDoc.monthlyLimit === 'string'
          ? parseInt(globalSettingsDoc.monthlyLimit, 10)
          : globalSettingsDoc.monthlyLimit
        console.log(`🌐 Global limit for project ${projectId}:`, monthlyLimit)
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
    }
    
    // Override with per-project user limit if set (this takes precedence)
    if (userSettings.monthlyLimit !== undefined && userSettings.monthlyLimit !== null) {
      // Handle both string and number values
      monthlyLimit = typeof userSettings.monthlyLimit === 'string'
        ? parseInt(userSettings.monthlyLimit, 10)
        : userSettings.monthlyLimit
      console.log(`🎯 User has CUSTOM limit for project ${projectId}:`, monthlyLimit)
      console.log('   ℹ️  This user-project limit is independent of other projects')
    } else {
      console.log(`🌐 User using GLOBAL limit for project ${projectId}:`, monthlyLimit)
      console.log('   ℹ️  This user WILL be affected by global limit changes for this project')
    }
    
    // Count actual passes for this month from the project-specific subcollection
    let usedThisMonth = 0
    
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      console.log(`📊 Counting passes for user ${userId} in project ${projectId} since ${firstDayOfMonth}`)
      
      // Query passes created this month for this user in this project using firestoreService
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
      
      console.log(`📊 Counted ${usedThisMonth} passes this month for user ${userId} in project ${projectId}`)
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
 * @param {string} validUntil - Valid until date
 * @param {string} phoneNumber - Phone number for WhatsApp (optional)
 * @returns {Promise<Object>} Created pass data
 */
export const createGuestPass = async (
  projectId,
  userId,
  userName,
  guestName,
  purpose,
  validUntil,
  phoneNumber = null,
) => {
  try {
    // First check eligibility
    const eligibility = await checkUserEligibility(projectId, userId)

    if (!eligibility.success || !eligibility.data.canGenerate) {
      throw new Error(eligibility.message)
    }

    // Generate unique pass ID
    const passId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()

    // Create pass record in Firebase - per project subcollection
    const passRef = await addDoc(collection(db, `projects/${projectId}/guestPasses`), {
      id: passId,
      projectId: projectId,
      userId: userId,
      userName: userName,
      guestName: guestName,
      purpose: purpose,
      validUntil: new Date(validUntil),
      phoneNumber: phoneNumber,
      createdAt: serverTimestamp(),
      sentStatus: false,
      sentAt: null,
      qrCodeUrl: null, // Will be set by mobile app
      updatedAt: serverTimestamp(),
    })

    // Update user's usage count in per-project settings
    const userSettingsRef = doc(db, `projects/${projectId}/userGuestPassSettings`, userId)
    
    // Count current passes to get accurate count
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const result = await firestoreService.getDocs(
      `projects/${projectId}/guestPasses`,
      {
        filters: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'createdAt', operator: '>=', value: firstDayOfMonth }
        ]
      }
    )
    const newUsed = result?.docs?.length || 0
    
    // Update or create per-project user settings
    try {
      const userSettingsDoc = await getDoc(userSettingsRef)
      if (userSettingsDoc.exists()) {
        await updateDoc(userSettingsRef, {
          usedThisMonth: newUsed,
          lastPassCreated: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        // Create new settings document
        await setDoc(userSettingsRef, {
          usedThisMonth: newUsed,
          lastPassCreated: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        })
      }
      
      console.log(`✅ Updated per-project settings for user ${userId} in project ${projectId}: used=${newUsed}`)
    } catch (error) {
      console.warn('⚠️ Could not update per-project user settings:', error)
      // Continue anyway, the pass was created successfully
    }

    console.log('✅ Guest pass created successfully:', passId)

    return {
      success: true,
      passId: passId,
      passRef: passRef.id,
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

    // Get per-project user settings
    let userSettings = {}
    try {
      const userSettingsResult = await firestoreService.getDoc(`projects/${projectId}/userGuestPassSettings/${userId}`)
      userSettings = userSettingsResult.data ? userSettingsResult.data() : userSettingsResult
    } catch {
      console.log(`ℹ️ No per-project settings found for user ${userId} in project ${projectId}`)
    }

    // Get monthly limit - check global settings first, then per-project user settings
    let monthlyLimit = 10
    try {
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      const globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
      
      if (globalSettingsDoc?.monthlyLimit) {
        // Handle both string and number values
        monthlyLimit = typeof globalSettingsDoc.monthlyLimit === 'string'
          ? parseInt(globalSettingsDoc.monthlyLimit, 10)
          : globalSettingsDoc.monthlyLimit
      }
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings:', settingsError)
    }
    
    // Override with per-project user limit if set
    if (userSettings.monthlyLimit !== undefined && userSettings.monthlyLimit !== null) {
      // Handle both string and number values
      monthlyLimit = typeof userSettings.monthlyLimit === 'string'
        ? parseInt(userSettings.monthlyLimit, 10)
        : userSettings.monthlyLimit
    }
    
    // Get actual usage for this project this month
    let usedThisMonth = 0
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
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
    } catch (error) {
      console.error('❌ Error counting passes:', error)
    }

    return {
      success: true,
      data: {
        userId: userId,
        name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        blocked: userSettings.blocked || false,
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
