/**
 * Permissions Boot File
 * Requests critical permissions when app starts
 * Only runs after user is authenticated
 */

import { defineBoot } from '#q-app/wrappers'
import permissionsService from 'src/services/permissionsService'
import { auth } from 'src/boot/firebase'

export default defineBoot(async ({ app }) => {
  console.log('🔐 Permissions Boot: Starting...')

  // Make permissions service available globally
  app.config.globalProperties.$permissions = permissionsService

  // Wait for authentication before requesting permissions
  // This prevents permission dialogs from appearing before user logs in
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('🔐 Permissions Boot: User authenticated, requesting permissions...')
      
      // Delay permission requests to ensure app UI is fully loaded
      // This provides better UX by not overwhelming users with permission dialogs
      setTimeout(async () => {
        try {
          await permissionsService.requestAllPermissions()
          console.log('✅ Permissions Boot: All permissions requested')
        } catch (error) {
          console.error('❌ Permissions Boot: Error requesting permissions:', error)
        }
      }, 2000) // Wait 2 seconds after authentication
    } else {
      console.log('🔐 Permissions Boot: No authenticated user, skipping permissions')
    }
  })

  console.log('🔐 Permissions Boot: Complete')
})

// Export permissions service for use in components
export { permissionsService }

