import { boot } from 'quasar/wrappers'
import { useProjectStore } from 'src/stores/projectStore'
import authService from 'src/services/authService'

export default boot(async ({ app }) => {
  // Initialize project store when app starts
  const projectStore = useProjectStore()
  
  // Listen for auth state changes and rehydrate project store
  const unsubscribe = authService.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('App boot: User authenticated, rehydrating project store...')
      try {
        const restored = await projectStore.rehydrateStore(user.uid)
        if (restored) {
          console.log('App boot: Project store rehydrated successfully')
        } else {
          console.log('App boot: No project restored, user needs to select')
        }
      } catch (error) {
        console.error('App boot: Error rehydrating project store:', error)
      }
    } else {
      console.log('App boot: No user authenticated')
    }
  })
  
  // Cleanup subscription when app unmounts
  app.config.globalProperties.$cleanupProjectStore = () => {
    unsubscribe()
  }
})
