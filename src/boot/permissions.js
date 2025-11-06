/**
 * Permissions Boot File
 * Makes permissions service available globally
 * Actual permission requests happen in projectStore boot file after authentication
 */

import { defineBoot } from '#q-app/wrappers'
import permissionsService from 'src/services/permissionsService'

export default defineBoot(async ({ app }) => {
  console.log('🔐 Permissions Boot: Making permissions service globally available')

  // Make permissions service available globally for components to use
  app.config.globalProperties.$permissions = permissionsService

  console.log('🔐 Permissions Boot: Complete')
})

// Export permissions service for use in components
export { permissionsService }

