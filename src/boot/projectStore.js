import { boot } from 'quasar/wrappers'
import { useProjectStore } from 'src/stores/projectStore'
import optimizedAuthService from 'src/services/optimizedAuthService'

export default boot(async ({ app }) => {
  // Initialize project store when app starts
  const projectStore = useProjectStore()
  
  // Track if we've already processed the current user to prevent infinite loops
  let lastProcessedUserId = null
  
  // Listen for auth state changes and rehydrate project store
  const unsubscribe = optimizedAuthService.onAuthStateChanged(async (user) => {
    console.log('App boot: Auth state changed, user:', user ? 'authenticated' : 'not authenticated')
    
    if (user) {
      // Prevent re-processing the same user
      if (lastProcessedUserId === user.uid) {
        console.log('App boot: User already processed, skipping rehydration')
        return
      }
      
      lastProcessedUserId = user.uid
      console.log('App boot: User authenticated, rehydrating project store...', 'User ID:', user.uid)
      
      try {
        const restored = await projectStore.rehydrateStore(user.uid)
        if (restored) {
          console.log('App boot: Project store rehydrated successfully')
          
          // Emit event for other components to know project is ready
          window.dispatchEvent(new CustomEvent('projectStoreReady', { 
            detail: { projectId: projectStore.selectedProject?.id } 
          }))
        } else {
          console.log('App boot: No project restored, user needs to select')
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
