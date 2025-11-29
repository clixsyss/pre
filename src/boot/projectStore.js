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
  
  // Get platform info
  const platform = Capacitor.getPlatform()
  const isNativePlatform = platform === 'ios' || platform === 'android'
  
  // Helper function to load user profile and get DynamoDB users table ID
  const loadUserProfileForProjects = async (user) => {
    try {
      // Get email from user object
      const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
      const userEmail = user.email || cognitoAttrs.email || cognitoAttrs.Email || null
      
      if (!userEmail) {
        console.warn('App boot: No email available, using Cognito UID for projects')
        return user.uid
      }
      
      // Get user from DynamoDB users table by email
      const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
      const userByEmail = await getUserByEmail(userEmail.trim().toLowerCase())
      
      if (userByEmail && userByEmail.id) {
        console.log('App boot: ✅ Found user in DynamoDB users table, using ID:', userByEmail.id)
        return userByEmail.id
      } else {
        console.warn('App boot: User not found in DynamoDB users table by email, using Cognito UID')
        return user.uid
      }
    } catch (error) {
      console.error('App boot: Error loading user profile for projects:', error)
      // Fallback to Cognito UID
      return user.uid
    }
  }
  
  // Listen for auth state changes and rehydrate project store
  const unsubscribe = optimizedAuthService.onAuthStateChanged(async (user) => {
    console.log('App boot: Auth state changed, user:', user ? 'authenticated' : 'not authenticated')
    
    if (user) {
      // Check if we need to fetch projects (either new user or no projects loaded)
      const needsFetch = lastProcessedUserId !== user.uid || projectStore.userProjects.length === 0
      
      if (!needsFetch) {
        console.log('App boot: User already processed and has projects, validating selected project...')
        // Still validate the selected project even if we have projects
        projectStore.validateAndFixSelectedProject()
        return
      }
      
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
            const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
            const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
            const userEmail = user.email || cognitoAttrs.email || cognitoAttrs.Email || null
            
            if (userEmail) {
              const userByEmail = await getUserByEmail(userEmail.trim().toLowerCase())
              if (userByEmail) {
                // Store in a global cache that ProfilePage can check
                window.__profileCache = {
                  data: userByEmail,
                  userId: user.uid,
                  timestamp: Date.now()
                }
                console.log('App boot: ✅ Profile data preloaded and cached in background')
              } else {
                console.log('App boot: User not found in DynamoDB for profile preload (non-critical)')
              }
            } else {
              console.log('App boot: No email available for profile preload (non-critical)')
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
        if (isNativePlatform && !permissionsService.permissionsRequested) {
          console.log('🔐 Requesting app permissions after authentication...')
          setTimeout(async () => {
            try {
              await permissionsService.requestAllPermissions()
              console.log('✅ All permissions requested')
            } catch (error) {
              console.error('❌ Error requesting permissions:', error)
            }
          }, 1500)
        }
      } catch (error) {
        console.error('App boot: Error rehydrating project store:', error)
        lastProcessedUserId = null // Reset on error to allow retry
      }
    } else {
      console.log('App boot: No user authenticated')
      lastProcessedUserId = null
      projectStore.resetStore()
    }
  })
  
  // Cleanup subscription when app unmounts
  app.config.globalProperties.$cleanupProjectStore = () => {
    unsubscribe()
  }
})
