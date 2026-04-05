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
   * Uses the same lookup method as SignIn.vue for consistency
   * @param {string} userId - User's ID (Cognito sub, authUid, or email)
   * @param {Object} [options]
   * @param {string} [options.lookupEmail] - When userId is Cognito sub but authUid in DB is wrong, find user by email
   * @returns {Promise<{deviceKey: string|null, userExists: boolean}>} Device key and existence status
   */
  async getUserDeviceKey(userId, { lookupEmail } = {}) {
    try {
      console.log(`🔍 getUserDeviceKey: Looking up user with ID: ${userId}`)
      
      // Import DynamoDB user service for reliable user lookup
      const { getUserByAuthUid, getUserByEmail, getUserById } = await import('./dynamoDBUsersService')
      
      let user = null
      
      // Strategy 1: Try authUid lookup first (most reliable for Cognito sub)
      // Cognito sub typically looks like a UUID, not an email
      if (userId && !userId.includes('@')) {
        try {
          console.log(`🔍 getUserDeviceKey: Trying authUid lookup for: ${userId}`)
          user = await getUserByAuthUid(userId)
          if (user) {
            console.log(`✅ getUserDeviceKey: Found user via authUid: ${user.id}`)
            const deviceKey = user.deviceKey
            console.log(`📱 Device key from DB: ${deviceKey ? `Found (${deviceKey.substring(0, 20)}...)` : 'Empty/Null'}`)
            return {
              deviceKey: deviceKey && deviceKey !== '' ? deviceKey : null,
              userExists: true
            }
          }
        } catch (authUidError) {
          console.warn(`⚠️ getUserDeviceKey: authUid lookup failed:`, authUidError.message || authUidError)
        }
        
        // Strategy 2: Try getUserById as fallback (handles both id and userId keys)
        try {
          console.log(`🔍 getUserDeviceKey: Trying getUserById for: ${userId}`)
          user = await getUserById(userId)
          if (user) {
            console.log(`✅ getUserDeviceKey: Found user via getUserById: ${user.id}`)
            const deviceKey = user.deviceKey
            console.log(`📱 Device key from DB (via getUserById): ${deviceKey ? `Found (${deviceKey.substring(0, 20)}...)` : 'Empty/Null'}`)
            console.log(`📱 Full user object keys:`, Object.keys(user))
            console.log(`📱 deviceKey value:`, deviceKey)
            console.log(`📱 deviceKey type:`, typeof deviceKey)
            console.log(`📱 deviceKey length:`, deviceKey ? deviceKey.length : 0)
            
            // Also try direct firestoreService.getDoc to check raw data
            try {
              const { default: firestoreService } = await import('./firestoreService')
              const rawDoc = await firestoreService.getDoc(`users/${userId}`, { useCache: false })
              if (rawDoc.exists()) {
                const rawData = rawDoc.data()
                const rawDeviceKey = rawData?.deviceKey
                console.log(`📱 Raw device key from firestoreService.getDoc: ${rawDeviceKey ? `Found (${rawDeviceKey.substring(0, 20)}...)` : 'Empty/Null'}`)
                console.log(`📱 Raw data has deviceKey field:`, 'deviceKey' in (rawData || {}))
                
                // Use raw data if converted data is missing deviceKey
                if (!deviceKey && rawDeviceKey) {
                  console.log(`⚠️ deviceKey missing from converted user, using raw data`)
                  return {
                    deviceKey: rawDeviceKey && rawDeviceKey !== '' ? rawDeviceKey : null,
                    userExists: true
                  }
                }
              }
            } catch (rawError) {
              console.warn(`⚠️ Could not get raw data for verification:`, rawError.message || rawError)
            }
            
            return {
              deviceKey: deviceKey && deviceKey !== '' ? deviceKey : null,
              userExists: true
            }
          }
        } catch (idError) {
          console.warn(`⚠️ getUserDeviceKey: getUserById failed:`, idError.message || idError)
        }
      }

      // Strategy 2b: Cognito sub did not match authUid (e.g. buggy migration stored email as authUid)
      if (!user && userId && !userId.includes('@') && lookupEmail) {
        try {
          const normalized = lookupEmail.trim().toLowerCase()
          console.log(`🔍 getUserDeviceKey: lookupEmail fallback for Cognito sub: ${normalized}`)
          const u = await getUserByEmail(normalized)
          if (u) {
            const au = u.authUid || ''
            if (au !== userId && (au.includes('@') || !au)) {
              try {
                const { updateUser } = await import('./dynamoDBUsersService')
                const { default: cacheService } = await import('./cacheService')
                await updateUser(u.id, { authUid: userId })
                cacheService.delete(`users/${u.id}`)
                console.log(`✅ getUserDeviceKey: Repaired authUid → Cognito sub for ${u.id}`)
              } catch (healErr) {
                console.warn('⚠️ getUserDeviceKey: authUid repair failed:', healErr.message || healErr)
              }
            }
            const deviceKey = u.deviceKey
            console.log(
              `📱 Device key from DB (lookupEmail): ${deviceKey ? `Found (${deviceKey.substring(0, 20)}...)` : 'Empty/Null'}`,
            )
            return {
              deviceKey: deviceKey && deviceKey !== '' ? deviceKey : null,
              userExists: true,
            }
          }
        } catch (fallbackErr) {
          console.warn(`⚠️ getUserDeviceKey: lookupEmail fallback failed:`, fallbackErr.message || fallbackErr)
        }
      }

      // Strategy 3: If userId looks like an email, try email lookup
      if (userId && userId.includes('@')) {
        try {
          console.log(`🔍 getUserDeviceKey: Trying email lookup for: ${userId}`)
          user = await getUserByEmail(userId)
          if (user) {
            console.log(`✅ getUserDeviceKey: Found user via email: ${user.id}`)
            const deviceKey = user.deviceKey
            console.log(`📱 Device key from DB: ${deviceKey ? `Found (${deviceKey.substring(0, 20)}...)` : 'Empty/Null'}`)
            return {
              deviceKey: deviceKey && deviceKey !== '' ? deviceKey : null,
              userExists: true
            }
          }
        } catch (emailError) {
          console.warn(`⚠️ getUserDeviceKey: Email lookup failed:`, emailError.message || emailError)
        }
      }
      
      // Strategy 4: Fallback to firestoreService.getDoc (legacy support)
      try {
        console.log(`🔍 getUserDeviceKey: Trying firestoreService.getDoc fallback for: ${userId}`)
        const userDoc = await firestoreService.getDoc(`users/${userId}`)
        if (userDoc.exists()) {
          const deviceKey = userDoc.data().deviceKey
          console.log(`✅ getUserDeviceKey: Found user via firestoreService: ${userId}`)
          console.log(`📱 Device key from DB: ${deviceKey ? `Found (${deviceKey.substring(0, 20)}...)` : 'Empty/Null'}`)
          return {
            deviceKey: deviceKey && deviceKey !== '' ? deviceKey : null,
            userExists: true
          }
        }
      } catch (firestoreError) {
        console.warn(`⚠️ getUserDeviceKey: firestoreService.getDoc failed:`, firestoreError.message || firestoreError)
      }
      
      // User not found by any method
      console.log(`❌ getUserDeviceKey: User document not found for: ${userId}`)
      return { deviceKey: null, userExists: false }
    } catch (error) {
      console.error('❌ getUserDeviceKey: Error getting user device key:', error)
      // On error, return null deviceKey but userExists: false to prevent auto-registration
      return { deviceKey: null, userExists: false }
    }
  }

  /**
   * Save device key to user's Firestore document
   * Uses the same lookup strategy as getUserDeviceKey to ensure consistency
   * @param {string} userId - User's ID (Cognito sub, authUid, or email)
   * @param {string} deviceKey - Device key to save
   * @param {Object} [options]
   * @param {string} [options.lookupEmail] - Match getUserDeviceKey when authUid in DB is wrong
   */
  async saveUserDeviceKey(userId, deviceKey, { lookupEmail } = {}) {
    try {
      console.log(`💾 saveUserDeviceKey: Looking up user with ID: ${userId} before saving`)
      
      // Import DynamoDB user service for reliable user lookup (same as getUserDeviceKey)
      const { getUserByAuthUid, getUserByEmail, getUserById } = await import('./dynamoDBUsersService')
      
      let user = null
      let actualUserId = userId
      
      // Use the same lookup strategy as getUserDeviceKey to find the actual user
      // Strategy 1: Try authUid lookup first (most reliable for Cognito sub)
      if (userId && !userId.includes('@')) {
        try {
          console.log(`🔍 saveUserDeviceKey: Trying authUid lookup for: ${userId}`)
          user = await getUserByAuthUid(userId)
          if (user) {
            actualUserId = user.id // Use the actual user.id from DynamoDB
            console.log(`✅ saveUserDeviceKey: Found user via authUid, using id: ${actualUserId}`)
          }
        } catch (authUidError) {
          console.warn(`⚠️ saveUserDeviceKey: authUid lookup failed:`, authUidError.message || authUidError)
        }
        
        // Strategy 2: Try getUserById as fallback
        if (!user) {
          try {
            console.log(`🔍 saveUserDeviceKey: Trying getUserById for: ${userId}`)
            user = await getUserById(userId)
            if (user) {
              actualUserId = user.id
              console.log(`✅ saveUserDeviceKey: Found user via getUserById, using id: ${actualUserId}`)
            }
          } catch (idError) {
            console.warn(`⚠️ saveUserDeviceKey: getUserById failed:`, idError.message || idError)
          }
        }
      }

      if (!user && userId && !userId.includes('@') && lookupEmail) {
        try {
          const normalized = lookupEmail.trim().toLowerCase()
          console.log(`🔍 saveUserDeviceKey: lookupEmail fallback: ${normalized}`)
          user = await getUserByEmail(normalized)
          if (user) {
            actualUserId = user.id
            const au = user.authUid || ''
            if (au !== userId && (au.includes('@') || !au)) {
              try {
                const { updateUser } = await import('./dynamoDBUsersService')
                const { default: cacheService } = await import('./cacheService')
                await updateUser(user.id, { authUid: userId })
                cacheService.delete(`users/${user.id}`)
                console.log(`✅ saveUserDeviceKey: Repaired authUid → Cognito sub for ${user.id}`)
              } catch (healErr) {
                console.warn('⚠️ saveUserDeviceKey: authUid repair failed:', healErr.message || healErr)
              }
            }
            console.log(`✅ saveUserDeviceKey: Found user via lookupEmail, using id: ${actualUserId}`)
          }
        } catch (fallbackErr) {
          console.warn(`⚠️ saveUserDeviceKey: lookupEmail fallback failed:`, fallbackErr.message || fallbackErr)
        }
      }

      // Strategy 3: If userId looks like an email, try email lookup
      if (!user && userId && userId.includes('@')) {
        try {
          console.log(`🔍 saveUserDeviceKey: Trying email lookup for: ${userId}`)
          user = await getUserByEmail(userId)
          if (user) {
            actualUserId = user.id
            console.log(`✅ saveUserDeviceKey: Found user via email, using id: ${actualUserId}`)
          }
        } catch (emailError) {
          console.warn(`⚠️ saveUserDeviceKey: Email lookup failed:`, emailError.message || emailError)
        }
      }
      
      if (!user) {
        console.warn(`⚠️ saveUserDeviceKey: User not found via any lookup method, using provided userId: ${userId}`)
        actualUserId = userId
      }
      
      console.log(`💾 Saving device key to users/${actualUserId}`)
      await firestoreService.updateDoc(`users/${actualUserId}`, {
        deviceKey: deviceKey,
        deviceKeyUpdatedAt: new Date().toISOString()
      })
      console.log(`✅ Device key saved to DynamoDB for user: ${actualUserId}`)
      
      // Verify the save worked by directly querying DynamoDB via firestoreService
      // This respects cache clearing and ensures we get fresh data
      // Wait longer for DynamoDB eventual consistency
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`🔍 Verifying device key was saved correctly using actualUserId: ${actualUserId}...`)
      
      // Use firestoreService.getDoc directly to bypass any caching issues
      try {
        const userDoc = await firestoreService.getDoc(`users/${actualUserId}`)
        if (userDoc.exists()) {
          const savedDeviceKey = userDoc.data().deviceKey
          if (savedDeviceKey === deviceKey) {
            console.log('✅ Device key saved and verified successfully!', {
              userId: actualUserId,
              deviceKeyPrefix: deviceKey.substring(0, 20) + '...'
            })
          } else {
            console.error('❌ Device key verification failed - mismatch!', {
              expected: deviceKey ? deviceKey.substring(0, 30) + '...' : 'null',
              actual: savedDeviceKey ? savedDeviceKey.substring(0, 30) + '...' : 'null',
              userId: userId,
              actualUserId: actualUserId
            })
            // Wait a bit longer and try once more
            await new Promise(resolve => setTimeout(resolve, 1000))
            const userDocRetry = await firestoreService.getDoc(`users/${actualUserId}`)
            if (userDocRetry.exists()) {
              const retryDeviceKey = userDocRetry.data().deviceKey
              if (retryDeviceKey === deviceKey) {
                console.log('✅ Device key verified on retry!')
              } else {
                console.error('❌ Device key still not found after retry!')
                // Don't throw - DynamoDB eventual consistency can take time
              }
            }
          }
        } else {
          console.error('❌ Device key verification failed - user document not found!')
        }
      } catch (verifyError) {
        console.error('❌ Error during device key verification:', verifyError)
        // Don't throw - the save might have succeeded despite verification failure
      }
    } catch (error) {
      console.error('❌ Error saving user device key:', error)
      console.error('Error details:', {
        userId,
        errorMessage: error.message,
        errorCode: error.code,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Validate if current device matches the registered device for a user
   * @param {string} userId - User's ID
   * @param {Object} [options] - Passed to getUserDeviceKey (e.g. lookupEmail)
   * @returns {Promise<Object>} Validation result
   */
  async validateDeviceKey(userId, options = {}) {
    try {
      console.log('🔐 Validating device key for user:', userId)

      // Get local device key (synchronous now)
      const localKey = this.getLocalDeviceKey()
      console.log('📱 Local device key:', localKey ? 'Found' : 'Not found')

      // Get stored device key from Firestore (now returns object with deviceKey and userExists)
      const { deviceKey: storedKey, userExists } = await this.getUserDeviceKey(userId, options)
      console.log('☁️  Stored device key:', storedKey ? `Found: ${storedKey.substring(0, 20)}...` : 'Not found or empty')
      console.log('👤 User exists in DB:', userExists)

      // SECURITY CHECK: If user document doesn't exist, this is an error condition - deny login
      if (!userExists) {
        console.error('❌ User document does not exist - cannot validate device key')
        return {
          valid: false,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'User account not found. Please contact support.',
          error: 'User document not found'
        }
      }

      // If user exists but no stored key or empty string, this is first login or admin reset - allow and register device
      if (!storedKey || storedKey === '') {
        console.log('✅ User exists but no device key or empty - treating as first login/admin reset')
        return {
          valid: true,
          isFirstLogin: true,
          requiresRegistration: true,
          message: 'No device key set - will register new device'
        }
      }

      // SECURITY: If no local key but there IS a stored key, this is a DIFFERENT device
      // DO NOT auto-heal - this would allow unauthorized access from new devices
      // The stored key belongs to another device, and only admin reset or approved request should allow new registration
      if (!localKey) {
        console.log('❌ No local key but user has registered device - this is a different device')
        return {
          valid: false,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'This device is not registered. Your account is registered to another device. Please request a device key reset if you want to use this device.'
        }
      }

      // Compare keys - both must exist and match
      if (localKey === storedKey) {
        console.log('✅ Device key matches - login allowed')
        return {
          valid: true,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'Device validated successfully'
        }
      } else {
        console.log('❌ Device key mismatch - local key does not match stored key')
        return {
          valid: false,
          isFirstLogin: false,
          requiresRegistration: false,
          message: 'This device is not registered. Your account is registered to another device. Please request a device key reset if you want to use this device.'
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
   * @param {Object} [options] - Passed to saveUserDeviceKey (e.g. lookupEmail)
   * @returns {Promise<string>} Generated device key
   */
  async registerDevice(userId, options = {}) {
    try {
      console.log('📝 Registering device for user:', userId)

      // Generate new device key (synchronous now)
      const deviceKey = this.generateDeviceKey()

      // Save to local storage (synchronous now)
      this.saveLocalDeviceKey(deviceKey)

      // Save to Firestore (still async)
      await this.saveUserDeviceKey(userId, deviceKey, options)

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
        const requests = await firestoreService.getDocs(collectionPath, {
          filters: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'approved' }
          ]
        })
        console.log(`🔍 Checked project ${projectId}: Found ${requests.size || 0} approved requests`)
        return !requests.empty && (requests.size || requests.docs?.length || 0) > 0
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
      
      // If user has projects, check only those projects
      if (userProjects.length > 0) {
        console.log(`🔍 Checking ${userProjects.length} user projects for approved reset requests`)
        
        for (const project of userProjects) {
          const projectId = project.projectId || project.id
          if (!projectId) continue
          
          const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
          try {
            const requests = await firestoreService.getDocs(collectionPath, {
              filters: [
                { field: 'userId', operator: '==', value: userId },
                { field: 'status', operator: '==', value: 'approved' }
              ]
            })
            
            const hasApproved = !requests.empty && (requests.size || requests.docs?.length || 0) > 0
            if (hasApproved) {
              console.log(`✅ Found approved reset request in project: ${projectId}`)
              return true
            }
          } catch (err) {
            console.warn(`⚠️ Error checking requests in project ${projectId}:`, err.message || err)
          }
        }
        
        console.log('ℹ️ No approved reset requests found in user projects')
        return false
      }
      
      // If user has no projects, check ALL projects for approved reset requests
      // This handles cases where user was deleted from projects but reset was approved
      console.log('⚠️ User has no projects - checking ALL projects for approved reset requests')
      try {
        const allProjects = await firestoreService.getDocs('projects', {
          constraints: [{ _type: 'limit', limitCount: 100 }] // Limit to prevent excessive reads
        })
        
        console.log(`🔍 Checking ${allProjects.docs.length} projects for approved reset requests`)
        
        for (const projectDoc of allProjects.docs) {
          const projectId = projectDoc.id
          const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
          
          try {
            const requests = await firestoreService.getDocs(collectionPath, {
              filters: [
                { field: 'userId', operator: '==', value: userId },
                { field: 'status', operator: '==', value: 'approved' }
              ]
            })
            
            const hasApproved = !requests.empty && (requests.size || requests.docs?.length || 0) > 0
            if (hasApproved) {
              console.log(`✅ Found approved reset request in project: ${projectId}`)
              return true
            }
          } catch (err) {
            console.warn(`⚠️ Error checking requests in project ${projectId}:`, err.message || err)
          }
        }
        
        console.log('ℹ️ No approved reset requests found in any projects')
        return false
      } catch (error) {
        console.error('❌ Error checking all projects for reset requests:', error)
        return false
      }
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
        const requests = await firestoreService.getDocs(collectionPath, {
          filters: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'approved' }
          ]
        })

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
          const projectId = project.projectId || project.id
          if (!projectId) continue
          
          const collectionPath = `projects/${projectId}/deviceKeyResetRequests`
          try {
            const requests = await firestoreService.getDocs(collectionPath, {
              filters: [
                { field: 'userId', operator: '==', value: userId },
                { field: 'status', operator: '==', value: 'approved' }
              ]
            })

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
   * After account migration, clear any legacy device binding so the next sign-in
   * is treated as first login on this device (registerDevice) instead of
   * "wrong device" when localStorage has no key but DynamoDB still has an old deviceKey.
   *
   * @param {Object} opts
   * @param {string} [opts.cognitoSub] - Cognito user sub after NEW_PASSWORD_REQUIRED
   * @param {string} [opts.email] - User email (fallback lookup)
   * @param {string} [opts.dynamoUserId] - Known users table document id (e.g. from migration flow)
   * @returns {Promise<boolean>} True if a user record was updated
   */
  async resetDeviceBindingAfterMigration({ cognitoSub, email, dynamoUserId } = {}) {
    try {
      this.removeLocalDeviceKey()

      const { getUserByAuthUid, getUserByEmail, getUserById } = await import('./dynamoDBUsersService')

      let user = null
      if (dynamoUserId) {
        user = await getUserById(dynamoUserId)
      }
      if (!user && cognitoSub) {
        user = await getUserByAuthUid(cognitoSub)
      }
      if (!user && email) {
        user = await getUserByEmail(email)
      }

      if (!user?.id) {
        console.warn('[deviceKeyService] resetDeviceBindingAfterMigration: user not found; local device key still cleared')
        return false
      }

      const clearedAt = new Date().toISOString()
      await firestoreService.updateDoc(`users/${user.id}`, {
        deviceKey: '',
        deviceKeyUpdatedAt: clearedAt,
      })
      console.log('[deviceKeyService] ✅ Cleared stored device key after account migration for user:', user.id)
      return true
    } catch (error) {
      console.error('[deviceKeyService] resetDeviceBindingAfterMigration failed:', error)
      throw error
    }
  }

  /**
   * Handle device key validation and registration during login
   * @param {string} userId - User's ID
   * @param {Object} [options] - e.g. { lookupEmail } when Cognito sub may not match Dynamo authUid
   * @returns {Promise<Object>} Result with action to take
   */
  async handleLoginDeviceCheck(userId, options = {}) {
    try {
      // First check if device is valid
      const validation = await this.validateDeviceKey(userId, options)

      // If first login, register device
      if (validation.isFirstLogin && validation.requiresRegistration) {
        await this.registerDevice(userId, options)
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
        await this.registerDevice(userId, options)
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

