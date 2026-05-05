import { boot } from 'quasar/wrappers'
import { useProjectStore } from 'src/stores/projectStore'
import optimizedAuthService from 'src/services/optimizedAuthService'
import permissionsService from 'src/services/permissionsService'
import { Capacitor } from '@capacitor/core'

export default boot(({ app }) => {
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
  // platform detection logged only in dev
  
  // Resolve the user's DynamoDB id and cache profile in window.__profileCache for ProfilePage.
  // Returns the resolved id (or Cognito sub as fallback).
  const loadUserProfileForProjects = async (user) => {
    try {
      const cognitoAttrs = user.cognitoAttributes || user.attributes || {}
      const userEmail = user.email || cognitoAttrs.email || cognitoAttrs.Email || null
      const cognitoSub = cognitoAttrs.sub || user.attributes?.sub || user.uid

      // Check if a fresh cache already exists (populated by a prior auth cycle)
      const existingCache = window.__profileCache
      if (existingCache?.data?.id && existingCache?.userId === cognitoSub && (Date.now() - existingCache.timestamp) < 300000) {
        return existingCache.data.id
      }

      const { getUserByEmail, getUserById } = await import('src/services/dynamoDBUsersService')

      // Fire both lookups simultaneously instead of sequentially
      const [byIdResult, byEmailResult] = await Promise.allSettled([
        cognitoSub ? getUserById(cognitoSub) : Promise.resolve(null),
        userEmail ? getUserByEmail(userEmail.trim().toLowerCase()) : Promise.resolve(null),
      ])

      const dynamoUser =
        (byIdResult.status === 'fulfilled' && byIdResult.value?.id ? byIdResult.value : null) ||
        (byEmailResult.status === 'fulfilled' && byEmailResult.value?.id ? byEmailResult.value : null)

      if (dynamoUser?.id) {
        // Cache for router guard and ProfilePage so they don't need a second fetch
        window.__profileCache = { data: dynamoUser, userId: cognitoSub || user.uid, timestamp: Date.now() }
        return dynamoUser.id
      }

      return cognitoSub || user.uid
    } catch (error) {
      console.error('App boot: Error loading user profile for projects:', error)
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

      try {
        // Resolve DynamoDB user ID (also populates window.__profileCache for ProfilePage)
        const dynamoDbUserId = await loadUserProfileForProjects(user)

        // Fetch projects — capped at 5s so a slow DynamoDB call never hangs the boot sequence
        const rehydrateWithTimeout = Promise.race([
          projectStore.rehydrateStore(dynamoDbUserId),
          new Promise((resolve) => setTimeout(() => resolve(false), 5000))
        ])
        const restored = await rehydrateWithTimeout
        
        // Validate and fix selected project to ensure it's in user's available projects
        projectStore.validateAndFixSelectedProject()
        
        projectStore.validateAndFixSelectedProject()

        if (restored) {
          window.dispatchEvent(new CustomEvent('projectStoreReady', {
            detail: { projectId: projectStore.selectedProject?.id }
          }))
        } else if (projectStore.userProjects.length > 0 && !projectStore.hasSelectedProject) {
          projectStore.selectProject(projectStore.userProjects[0])
        }

        // Request device permissions after auth — deferred so it doesn't block the boot path
        const isReallyNative = isNativePlatform || protocol === 'capacitor:' || hasIOSBridge
        if (isReallyNative && !permissionsService.permissionsRequested) {
          setTimeout(async () => {
            try {
              await permissionsService.requestAllPermissions()
            } catch (error) {
              console.error('App boot: Error requesting permissions:', error)
            }
          }, 2000)
        }
      } catch (error) {
        console.error('App boot: Error rehydrating project store:', error)
        lastProcessedUserId = null
      } finally {
        isProcessing = false
      }
    } else {
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
