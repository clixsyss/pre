/**
 * Permissions Boot File
 * Requests critical permissions when app starts
 * Only runs after user is authenticated
 */

import { defineBoot } from '#q-app/wrappers'
import permissionsService from 'src/services/permissionsService'
import { auth } from 'src/boot/firebase'
import { Capacitor } from '@capacitor/core'

export default defineBoot(async ({ app }) => {
  console.log('🔐 Permissions Boot: Starting...')

  // Make permissions service available globally
  app.config.globalProperties.$permissions = permissionsService

  // Helper function to request permissions (uses permissionsService's internal tracking)
  const requestPermissions = async (source) => {
    // Check if permissions already requested
    if (permissionsService.permissionsRequested) {
      console.log(`🔐 Permissions Boot: Already requested, skipping (source: ${source})`)
      return
    }

    console.log(`🔐 Permissions Boot: Requesting permissions (source: ${source})...`)
    
    try {
      await permissionsService.requestAllPermissions()
      console.log(`✅ Permissions Boot: All permissions requested (source: ${source})`)
    } catch (error) {
      console.error(`❌ Permissions Boot: Error requesting permissions (source: ${source}):`, error)
    }
  }

  // Check if user is already authenticated (works for web)
  const currentUser = auth.currentUser
  if (currentUser) {
    console.log('🔐 Permissions Boot: User already authenticated (Web SDK), requesting permissions...')
    // Delay to ensure everything is ready
    setTimeout(() => {
      requestPermissions('auth.currentUser')
    }, 2000)
  }

  // Wait for authentication before requesting permissions
  // This prevents permission dialogs from appearing before user logs in
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('🔐 Permissions Boot: Auth state changed - user authenticated')
      
      // Delay permission requests to ensure app UI is fully loaded
      // This provides better UX by not overwhelming users with permission dialogs
      const platform = Capacitor.getPlatform()
      const delay = platform === 'ios' ? 3000 : 2000 // Longer delay for iOS
      
      setTimeout(() => {
        requestPermissions('onAuthStateChanged')
      }, delay)
    } else {
      console.log('🔐 Permissions Boot: User logged out, skipping permissions')
    }
  })

  // iOS-specific: Check for authenticated user after a delay
  // This handles cases where Capacitor Firebase Auth uses persistence
  // and onAuthStateChanged doesn't fire on app launch
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') {
    console.log('🔐 Permissions Boot: iOS detected - Setting up fallback user check...')
    
    setTimeout(async () => {
      // Import Capacitor Firebase Authentication
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
        const { user } = await FirebaseAuthentication.getCurrentUser()
        
        if (user && user.uid && !permissionsService.permissionsRequested) {
          console.log('🔐 Permissions Boot: iOS fallback - Found authenticated user, requesting permissions...')
          console.log('🔐 Permissions Boot: User ID:', user.uid)
          
          // Wait a bit more to ensure UI is fully ready
          setTimeout(() => {
            requestPermissions('ios-fallback-check')
          }, 1000)
        } else if (!user) {
          console.log('🔐 Permissions Boot: iOS fallback - No user authenticated')
        } else if (permissionsService.permissionsRequested) {
          console.log('🔐 Permissions Boot: iOS fallback - Permissions already requested, skipping')
        }
      } catch (error) {
        console.error('🔐 Permissions Boot: iOS fallback check failed:', error)
      }
    }, 5000) // 5 seconds after boot (same as FCM)
  }

  console.log('🔐 Permissions Boot: Complete')
})

// Export permissions service for use in components
export { permissionsService }

