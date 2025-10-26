import firestoreService from './firestoreService'

/**
 * Device Key Service - Manages device-based authentication
 * Ensures users can only login from their registered device unless reset is approved
 */
class DeviceKeyService {
  constructor() {
    this.DEVICE_KEY_STORAGE_KEY = 'pre_device_key'
    // Lazy load Capacitor plugins to avoid bundling issues
    this.Device = null
    this.Preferences = null
  }

  /**
   * Initialize Capacitor plugins (lazy loading)
   */
  async initializePlugins() {
    if (!this.Device || !this.Preferences) {
      try {
        const { Device } = await import('@capacitor/device')
        const { Preferences } = await import('@capacitor/preferences')
        this.Device = Device
        this.Preferences = Preferences
        console.log('✅ Capacitor plugins loaded successfully')
      } catch (error) {
        console.error('❌ Error loading Capacitor plugins:', error)
        throw new Error('Failed to load Capacitor plugins')
      }
    }
  }

  /**
   * Generate a unique device key based on device info
   * @returns {Promise<string>} Unique device key
   */
  async generateDeviceKey() {
    try {
      await this.initializePlugins()
      
      console.log('🔍 Getting device ID...')
      
      const deviceInfo = await this.Device.getId()
      
      console.log('📱 Device info received:', deviceInfo)
      
      const timestamp = Date.now()
      const randomPart = Math.random().toString(36).substring(2, 15)
      
      // Create a unique key combining device UUID, timestamp, and random string
      const deviceKey = `${deviceInfo.identifier || deviceInfo.uuid || randomPart}_${timestamp}_${randomPart}`
      
      console.log('🔑 Generated device key:', deviceKey.substring(0, 20) + '...')
      return deviceKey
    } catch (error) {
      console.error('❌ Error generating device key:', error.message || error)
      console.error('❌ Error stack:', error.stack)
      // Fallback to pure random if device info fails
      const fallbackKey = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      console.log('⚠️ Using fallback device key:', fallbackKey.substring(0, 20) + '...')
      return fallbackKey
    }
  }

  /**
   * Get the device key stored on this device
   * @returns {Promise<string|null>} Stored device key or null
   */
  async getLocalDeviceKey() {
    try {
      await this.initializePlugins()
      
      console.log('🔍 Getting local device key from Preferences...')
      
      const result = await this.Preferences.get({ key: this.DEVICE_KEY_STORAGE_KEY })
      
      console.log('📱 Preferences result:', result)
      
      return result.value
    } catch (error) {
      console.error('❌ Error getting local device key:', error.message || error)
      console.error('❌ Error stack:', error.stack)
      return null
    }
  }

  /**
   * Save device key to local storage
   * @param {string} deviceKey - Device key to save
   */
  async saveLocalDeviceKey(deviceKey) {
    try {
      await this.initializePlugins()
      
      console.log('💾 Saving device key to local storage...')
      
      await this.Preferences.set({
        key: this.DEVICE_KEY_STORAGE_KEY,
        value: deviceKey
      })
      
      console.log('✅ Device key saved to local storage')
    } catch (error) {
      console.error('❌ Error saving device key:', error.message || error)
      console.error('❌ Error stack:', error.stack)
      throw new Error('Failed to save device key: ' + (error.message || JSON.stringify(error)))
    }
  }

  /**
   * Remove device key from local storage
   */
  async removeLocalDeviceKey() {
    try {
      await this.initializePlugins()
      
      await this.Preferences.remove({ key: this.DEVICE_KEY_STORAGE_KEY })
      
      console.log('✅ Device key removed from local storage')
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

      // Get local device key
      const localKey = await this.getLocalDeviceKey()
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

      // If no local key but there is a stored key, device doesn't match
      if (!localKey) {
        console.log('❌ No local key but user has registered device')
        return {
          valid: false,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'This device is not registered. Please use your registered device or request a device key reset.'
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

      // Generate new device key
      const deviceKey = await this.generateDeviceKey()

      // Save to local storage
      await this.saveLocalDeviceKey(deviceKey)

      // Save to Firestore
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
      
      // Check all projects for approved requests
      const projectsSnapshot = await firestoreService.getDocs('projects')
      
      for (const projectDoc of projectsSnapshot.docs) {
        const collectionPath = `projects/${projectDoc.id}/deviceKeyResetRequests`
        try {
          const requests = await firestoreService.getDocs(collectionPath, [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'approved' }
          ])
          if (!requests.empty) {
            return true
          }
        } catch (err) {
          console.warn(`Error checking requests in project ${projectDoc.id}:`, err)
        }
      }
      
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
        // Clear from all projects
        const projectsSnapshot = await firestoreService.getDocs('projects')
        
        for (const projectDoc of projectsSnapshot.docs) {
          const collectionPath = `projects/${projectDoc.id}/deviceKeyResetRequests`
          try {
            const requests = await firestoreService.getDocs(collectionPath, [
              { field: 'userId', operator: '==', value: userId },
              { field: 'status', operator: '==', value: 'approved' }
            ])

            for (const doc of requests.docs) {
              await firestoreService.deleteDoc(`${collectionPath}/${doc.id}`)
            }
          } catch (err) {
            console.warn(`Error clearing requests in project ${projectDoc.id}:`, err)
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

