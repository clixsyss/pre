import { boot } from 'quasar/wrappers'
import { useProjectStore } from 'src/stores/projectStore'
import optimizedAuthService from 'src/services/optimizedAuthService'
import permissionsService from 'src/services/permissionsService'
import { Capacitor } from '@capacitor/core'

export default boot(async ({ app }) => {
  // Initialize project store when app starts
  const projectStore = useProjectStore()
  
  // Track if we've already processed the current user to prevent infinite loops
  let lastProcessedUserId = null
  let isProcessing = false // Guard to prevent concurrent processing
  
  // Get platform info - use enhanced detection like permissionsService
  const protocol = window.location.protocol
  const hasIOSBridge = window.webkit?.messageHandlers !== undefined
  let platform = Capacitor.getPlatform()
  
  // Enhanced platform detection for iOS (more reliable)
  if (protocol === 'capacitor:' || hasIOSBridge) {
    platform = 'ios'
  }
  
  const isNativePlatform = platform === 'ios' || platform === 'android'
  console.log('🔍 App boot: Platform detection:', { platform, isNativePlatform, protocol, hasIOSBridge })
  
  // Helper function to load user profile and get DynamoDB users table ID
  const loadUserProfileForProjects = async (user) => {
    try {
      // Get email and Cognito sub from user object
      const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
      const userEmail = user.email || cognitoAttrs.email || cognitoAttrs.Email || null
      // Use Cognito sub (stored as 'id' in DynamoDB users table) - this is the primary key
      const cognitoSub = cognitoAttrs.sub || user.attributes?.sub || user.uid
      
      // Try to get user from DynamoDB users table
      const { getUserByEmail, getUserById } = await import('src/services/dynamoDBUsersService')
      
      let dynamoUser = null
      
      // First, try by ID (Cognito sub) - this is the primary key and most reliable
      if (cognitoSub) {
        try {
          console.log('App boot: 🔍 Trying getUserById with Cognito sub:', cognitoSub)
          dynamoUser = await getUserById(cognitoSub)
          if (dynamoUser && dynamoUser.id) {
            console.log('App boot: ✅ Found user in DynamoDB users table by ID (Cognito sub), using ID:', dynamoUser.id)
            return dynamoUser.id
          }
        } catch (idError) {
          console.warn('App boot: Error looking up user by ID (Cognito sub), trying email fallback:', idError)
        }
      }
      
      // Fallback: Try by email if ID lookup failed
      if (!dynamoUser && userEmail) {
        try {
          console.log('App boot: User not found by ID, trying email lookup...')
          dynamoUser = await getUserByEmail(userEmail.trim().toLowerCase())
          if (dynamoUser && dynamoUser.id) {
            console.log('App boot: ✅ Found user in DynamoDB users table by email, using ID:', dynamoUser.id)
            return dynamoUser.id
          }
        } catch (emailError) {
          console.warn('App boot: Error looking up user by email:', emailError)
        }
      }
      
      // If still not found, use Cognito sub as fallback (not email)
      console.warn('App boot: User not found in DynamoDB users table (tried ID and email), using Cognito sub as fallback')
      return cognitoSub || user.uid
    } catch (error) {
      console.error('App boot: Error loading user profile for projects:', error)
      // Fallback to Cognito sub
      const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
      return cognitoAttrs.sub || user.attributes?.sub || user.uid
    }
  }
  
  // Listen for auth state changes and rehydrate project store
  const unsubscribe = optimizedAuthService.onAuthStateChanged(async (user) => {
    // Reduced logging - only log significant state changes
    if (user) {
      // Guard: Prevent concurrent processing
      if (isProcessing) {
        // Silently skip - no need to log every duplicate
        return
      }
      
      // Check if we need to fetch projects (either new user or no projects loaded)
      const needsFetch = lastProcessedUserId !== user.uid || projectStore.userProjects.length === 0
      
      if (!needsFetch) {
        // Silently validate - no need to log every time
        projectStore.validateAndFixSelectedProject()
        return
      }
      
      isProcessing = true
      lastProcessedUserId = user.uid
      console.log('App boot: User authenticated, loading profile and projects...', 'User ID:', user.uid)
      console.log('App boot: Current projects count:', projectStore.userProjects.length)
      
      try {
        // First, load user profile to get DynamoDB users table ID
        console.log('App boot: Loading user profile to get DynamoDB users table ID...')
        const dynamoDbUserId = await loadUserProfileForProjects(user)
        console.log('App boot: Using user ID for projects:', dynamoDbUserId)
        
        // Preload profile data in background (completely non-blocking)
        // This ensures profile data is ready when user visits profile page
        // Don't await this - let it run in the background
        ;(async () => {
          try {
            console.log('App boot: Starting background profile preload...')
            // Import and call the profile loading logic
            // We'll create a simple profile cache that ProfilePage can use
            const { getUserByEmail, getUserById } = await import('src/services/dynamoDBUsersService')
            const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
            const userEmail = user.email || cognitoAttrs.email || cognitoAttrs.Email || null
            const cognitoSub = cognitoAttrs.sub || user.attributes?.sub || user.uid
            
            let profileUser = null
            
            // Try by ID (Cognito sub) first - this is the primary key and most reliable
            if (cognitoSub) {
              try {
                profileUser = await getUserById(cognitoSub)
              } catch (idError) {
                console.warn('App boot: Error in background profile preload by ID (Cognito sub):', idError)
              }
            }
            
            // Fallback to email lookup if ID lookup failed
            if (!profileUser && userEmail) {
              try {
                profileUser = await getUserByEmail(userEmail.trim().toLowerCase())
              } catch (emailError) {
                console.warn('App boot: Error in background profile preload by email:', emailError)
              }
            }
            
            if (profileUser) {
              // Store in a global cache that ProfilePage can check
              window.__profileCache = {
                data: profileUser,
                userId: cognitoSub || user.uid,
                timestamp: Date.now()
              }
              console.log('App boot: ✅ Profile data preloaded and cached in background')
            } else {
              console.log('App boot: User not found in DynamoDB for profile preload (non-critical)')
            }
          } catch (error) {
            console.error('App boot: Error preloading profile (non-critical):', error)
            // Non-blocking, continue even if profile preload fails
          }
        })() // Immediately invoke, don't await
        
        // Now fetch projects using the DynamoDB users table ID
        // This is the critical path - don't wait for profile preload
        const restored = await projectStore.rehydrateStore(dynamoDbUserId)
        
        // Validate and fix selected project to ensure it's in user's available projects
        projectStore.validateAndFixSelectedProject()
        
        if (restored) {
          console.log('App boot: Project store rehydrated successfully')
          
          // Emit event for other components to know project is ready
          window.dispatchEvent(new CustomEvent('projectStoreReady', { 
            detail: { projectId: projectStore.selectedProject?.id } 
          }))
        } else {
          console.log('App boot: No project restored, user needs to select')
          console.log('App boot: Projects loaded:', projectStore.userProjects.length)
          
          // If we have projects but no selection, auto-select the first one
          if (projectStore.userProjects.length > 0 && !projectStore.hasSelectedProject) {
            console.log('App boot: Auto-selecting first available project')
            projectStore.selectProject(projectStore.userProjects[0])
          }
        }
        
        // Request permissions after successful authentication (like orange-app pattern)
        // Use enhanced platform detection to ensure we're really on native
        const isReallyNative = isNativePlatform || protocol === 'capacitor:' || hasIOSBridge
        
        if (isReallyNative && !permissionsService.permissionsRequested) {
          console.log('🔐 Requesting app permissions after authentication...')
          console.log('🔐 Platform check:', { isNativePlatform, isReallyNative, platform, permissionsRequested: permissionsService.permissionsRequested })
          
          // Request permissions with a delay to ensure everything is ready
          setTimeout(async () => {
            try {
              console.log('🔐 Starting permission requests...')
              const results = await permissionsService.requestAllPermissions()
              console.log('✅ All permissions requested:', results)
            } catch (error) {
              console.error('❌ Error requesting permissions:', error)
              console.error('❌ Error stack:', error.stack)
            }
          }, 2000) // Increased delay to 2 seconds
        } else {
          console.log('🔐 Skipping permission requests:', { 
            isNativePlatform, 
            isReallyNative, 
            platform, 
            permissionsRequested: permissionsService.permissionsRequested,
            protocol,
            hasIOSBridge
          })
        }
      } catch (error) {
        console.error('App boot: Error rehydrating project store:', error)
        lastProcessedUserId = null // Reset on error to allow retry
      } finally {
        isProcessing = false // Always clear the processing flag
      }
    } else {
      console.log('App boot: No user authenticated')
      lastProcessedUserId = null
      isProcessing = false
      projectStore.resetStore()
    }
  })
  
  // Cleanup subscription when app unmounts
  app.config.globalProperties.$cleanupProjectStore = () => {
    unsubscribe()
  }
})
