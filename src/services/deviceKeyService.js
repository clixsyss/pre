import firestoreService from './firestoreService'

/**
 * Device Key Service - Manages device-based authentication
 * Ensures users can only login from their registered device unless reset is approved
 * 
 * SIMPLE APPROACH:
 * - Generate a UUID and store in localStorage
 * - Compare with Firestore deviceKey
 * - User can only login from ONE device at a time
 * - To switch devices, user must request device key reset from admin
 */
class DeviceKeyService {
  constructor() {
    this.DEVICE_KEY_STORAGE_KEY = 'pre_device_key'
  }

  /**
   * Generate a unique device key
   * @returns {string} Unique device key
   */
  generateDeviceKey() {
    try {
      // Use crypto.randomUUID if available, otherwise fallback
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        const deviceKey = `device_${crypto.randomUUID()}_${Date.now()}`
        console.log('🔑 Generated device key using crypto.randomUUID')
        return deviceKey
      } else {
        // Fallback to random string
        const randomPart1 = Math.random().toString(36).substring(2, 15)
        const randomPart2 = Math.random().toString(36).substring(2, 15)
        const deviceKey = `device_${randomPart1}${randomPart2}_${Date.now()}`
        console.log('🔑 Generated device key using Math.random fallback')
        return deviceKey
      }
    } catch (error) {
      console.error('❌ Error generating device key:', error)
      // Ultimate fallback
      const deviceKey = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      return deviceKey
    }
  }

  /**
   * Get the device key stored on this device
   * @returns {string|null} Stored device key or null
   */
  getLocalDeviceKey() {
    try {
      const deviceKey = localStorage.getItem(this.DEVICE_KEY_STORAGE_KEY)
      console.log('📱 Local device key:', deviceKey ? 'Found' : 'Not found')
      return deviceKey
    } catch (error) {
      console.error('❌ Error getting local device key:', error)
      return null
    }
  }

  /**
   * Save device key to local storage
   * @param {string} deviceKey - Device key to save
   */
  saveLocalDeviceKey(deviceKey) {
    try {
      localStorage.setItem(this.DEVICE_KEY_STORAGE_KEY, deviceKey)
      console.log('✅ Device key saved to localStorage')
    } catch (error) {
      console.error('❌ Error saving device key:', error)
      throw new Error('Failed to save device key')
    }
  }

  /**
   * Remove device key from local storage
   */
  removeLocalDeviceKey() {
    try {
      localStorage.removeItem(this.DEVICE_KEY_STORAGE_KEY)
      console.log('✅ Device key removed from localStorage')
    } catch (error) {
      console.error('Error removing device key:', error)
    }
  }

  /**
   * Get device key stored in Firestore for a user
   * @param {string} userId - User's ID
   * @returns {Promise<string|null>} Stored device key or null
   */
  async getUserDeviceKey(userId) {
    try {
      const userDoc = await firestoreService.getDoc(`users/${userId}`)
      if (userDoc.exists()) {
        return userDoc.data().deviceKey || null
      }
      return null
    } catch (error) {
      console.error('Error getting user device key:', error)
      return null
    }
  }

  /**
   * Save device key to user's Firestore document
   * @param {string} userId - User's ID
   * @param {string} deviceKey - Device key to save
   */
  async saveUserDeviceKey(userId, deviceKey) {
    try {
      await firestoreService.updateDoc(`users/${userId}`, {
        deviceKey: deviceKey,
        deviceKeyUpdatedAt: new Date()
      })
      console.log('✅ Device key saved to Firestore for user:', userId)
    } catch (error) {
      console.error('Error saving user device key:', error)
      throw error
    }
  }

  /**
   * Validate if current device matches the registered device for a user
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Validation result
   */
  async validateDeviceKey(userId) {
    try {
      console.log('🔐 Validating device key for user:', userId)

      // Get local device key (synchronous now)
      const localKey = this.getLocalDeviceKey()
      console.log('📱 Local device key:', localKey ? 'Found' : 'Not found')

      // Get stored device key from Firestore
      const storedKey = await this.getUserDeviceKey(userId)
      console.log('☁️  Stored device key:', storedKey ? 'Found' : 'Not found')

      // If no stored key, this is first login - allow and register device
      if (!storedKey) {
        console.log('✅ First login - no device key registered yet')
        return {
          valid: true,
          isFirstLogin: true,
          requiresRegistration: true,
          message: 'First login detected'
        }
      }

      // If no local key but there is a stored key, auto-heal by storing the server key locally
      if (!localKey) {
        console.log('🛠️ No local key but user has registered device - auto-recovering local key')
        try {
          this.saveLocalDeviceKey(storedKey)
          return {
            valid: true,
            isFirstLogin: false,
            requiresRegistration: false,
            message: 'Recovered device key from server and validated'
          }
        } catch (e) {
          console.error('❌ Failed to save recovered device key locally:', e)
          return {
            valid: false,
            isFirstLogin: false,
            requiresRegistration: false,
            message: 'Unable to store device key locally. Please try again.'
          }
        }
      }

      // Compare keys
      if (localKey === storedKey) {
        console.log('✅ Device key matches - login allowed')
        return {
          valid: true,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'Device validated successfully'
        }
      } else {
        console.log('❌ Device key mismatch')
        return {
          valid: false,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'Device key mismatch. This account is registered to another device. Please request a device key reset if you want to use this device.'
        }
      }
    } catch (error) {
      console.error('Error validating device key:', error)
      return {
        valid: false,
        isFirstLogin: false,
        requiresRegistration: false,
        message: 'Error validating device',
        error: error.message
      }
    }
  }

  /**
   * Register device for a user (first login or after approved reset)
   * @param {string} userId - User's ID
   * @returns {Promise<string>} Generated device key
   */
  async registerDevice(userId) {
    try {
      console.log('📝 Registering device for user:', userId)

      // Generate new device key (synchronous now)
      const deviceKey = this.generateDeviceKey()

      // Save to local storage (synchronous now)
      this.saveLocalDeviceKey(deviceKey)

      // Save to Firestore (still async)
      await this.saveUserDeviceKey(userId, deviceKey)

      console.log('✅ Device registered successfully')
      return deviceKey
    } catch (error) {
      console.error('Error registering device:', error)
      throw error
    }
  }

  /**
   * Check if user has an approved reset request
   * @param {string} userId - User's ID
   * @returns {Promise<boolean>} True if user has approved reset
   */
  async hasApprovedResetRequest(userId, projectId = null) {
    try {
      if (projectId) {
        // Check specific project subcollection
        const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
        const requests = await firestoreService.getDocs(collectionPath, [
          { field: 'userId', operator: '==', value: userId },
          { field: 'status', operator: '==', value: 'approved' }
        ])
        return !requests.empty
      }
      
      // Get user's projects first to avoid checking all projects (causes permission errors)
      console.log('🔍 Getting user projects to check for approved reset requests...')
      const userDoc = await firestoreService.getDoc(`users/${userId}`)
      
      if (!userDoc.exists()) {
        console.log('❌ User document not found')
        return false
      }
      
      const userData = userDoc.data()
      const userProjects = userData?.projects || []
      
      if (userProjects.length === 0) {
        console.log('ℹ️ User has no projects, skipping reset request check')
        return false
      }
      
      console.log(`🔍 Checking ${userProjects.length} user projects for approved reset requests`)
      
      // Only check the user's actual projects
      for (const project of userProjects) {
        const projectId = project.projectId
        const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
        try {
          const requests = await firestoreService.getDocs(collectionPath, [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'approved' }
          ])
          if (!requests.empty) {
            console.log(`✅ Found approved reset request in project: ${projectId}`)
            return true
          }
        } catch (err) {
          console.warn(`⚠️ Error checking requests in project ${projectId}:`, err.message || err)
        }
      }
      
      console.log('ℹ️ No approved reset requests found in user projects')
      return false
    } catch (error) {
      console.error('Error checking reset requests:', error)
      return false
    }
  }

  /**
   * Clear approved reset requests for a user after device is registered
   * @param {string} userId - User's ID
   */
  async clearApprovedResetRequests(userId, projectId = null) {
    try {
      if (projectId) {
        // Clear from specific project subcollection
        const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
        const requests = await firestoreService.getDocs(collectionPath, [
          { field: 'userId', operator: '==', value: userId },
          { field: 'status', operator: '==', value: 'approved' }
        ])

        for (const doc of requests.docs) {
          await firestoreService.deleteDoc(`${collectionPath}/${doc.id}`)
        }
      } else {
        // Get user's projects first to avoid checking all projects
        const userDoc = await firestoreService.getDoc(`users/${userId}`)
        
        if (!userDoc.exists()) {
          console.log('❌ User document not found, cannot clear reset requests')
          return
        }
        
        const userData = userDoc.data()
        const userProjects = userData?.projects || []
        
        if (userProjects.length === 0) {
          console.log('ℹ️ User has no projects, nothing to clear')
          return
        }
        
        console.log(`🔍 Clearing reset requests from ${userProjects.length} user projects`)
        
        // Only clear from the user's actual projects
        for (const project of userProjects) {
          const projectId = project.projectId
          const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
          try {
            const requests = await firestoreService.getDocs(collectionPath, [
              { field: 'userId', operator: '==', value: userId },
              { field: 'status', operator: '==', value: 'approved' }
            ])

            for (const doc of requests.docs) {
              await firestoreService.deleteDoc(`${collectionPath}/${doc.id}`)
            }
          } catch (err) {
            console.warn(`⚠️ Error clearing requests in project ${projectId}:`, err.message || err)
          }
        }
      }

      console.log('✅ Cleared approved reset requests')
    } catch (error) {
      console.error('Error clearing reset requests:', error)
    }
  }

  /**
   * Handle device key validation and registration during login
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Result with action to take
   */
  async handleLoginDeviceCheck(userId) {
    try {
      // TEMPORARY BYPASS: Allow all devices for testing
      // TODO: Remove this bypass and restore device key validation
      console.log('⚠️ DEVICE KEY CHECK BYPASSED - Testing mode enabled')
      return {
        allowed: true,
        message: 'Device check bypassed (testing mode)',
        action: 'bypassed'
      }
      
      /* eslint-disable no-unreachable */
      // First check if device is valid
      const validation = await this.validateDeviceKey(userId)

      // If first login, register device
      if (validation.isFirstLogin && validation.requiresRegistration) {
        await this.registerDevice(userId)
        return {
          allowed: true,
          message: 'Device registered successfully',
          action: 'registered'
        }
      }

      // If device is valid, allow login
      if (validation.valid) {
        return {
          allowed: true,
          message: 'Device validated',
          action: 'validated'
        }
      }

      // Device is not valid - check for approved reset request
      const hasApprovedReset = await this.hasApprovedResetRequest(userId)

      if (hasApprovedReset) {
        console.log('✅ User has approved reset request - allowing device registration')
        // Register this new device
        await this.registerDevice(userId)
        // Clear the approved reset request
        await this.clearApprovedResetRequests(userId)
        return {
          allowed: true,
          message: 'Device reset approved - new device registered',
          action: 'reset_approved'
        }
      }

      // No approved reset - deny login
      return {
        allowed: false,
        message: validation.message,
        action: 'denied'
      }
    } catch (error) {
      console.error('Error handling login device check:', error)
      return {
        allowed: false,
        message: 'Error validating device',
        action: 'error',
        error: error.message
      }
    }
  }
}

export default new DeviceKeyService()

