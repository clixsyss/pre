/**
 * Location Check Service
 * Validates user location for guest pass generation
 */

import firestoreService from './firestoreService'
import locationService from './locationService'

/**
 * Validate if user can generate guest pass based on location
 * @param {string} currentProjectId - The ID of the current project (optional)
 * @returns {Promise<Object>} Validation result
 */
export async function validateGuestPassLocation(currentProjectId = null) {
  try {
    console.log('🔍 Validating location for guest pass generation...')
    console.log('🏢 Current project ID:', currentProjectId)

    // OPTIMIZATION: Fetch projects with limit
    const { limit } = await import('firebase/firestore')
    const projectsSnapshot = await firestoreService.getDocs('projects', {
      constraints: [limit(50)]
    })
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`📍 Fetched ${projects.length} projects`)

    // If currentProjectId is provided, check if ONLY THAT project has restrictions
    if (currentProjectId) {
      const currentProject = projects.find(p => p.id === currentProjectId)
      
      if (!currentProject) {
        console.warn('⚠️ Current project not found in projects list')
      } else if (!currentProject.restrictionEnabled) {
        console.log(`✅ Current project "${currentProject.name}" has NO location restrictions`)
        return {
          success: true,
          allowed: true,
          reason: 'project_not_restricted',
          message: 'Location check passed - current project has no restrictions',
        }
      }
      
      console.log(`🔍 Current project "${currentProject.name}" HAS location restrictions enabled`)
    }

    // Check if any project has restriction enabled
    const hasRestrictions = projects.some((p) => p.restrictionEnabled === true)

    if (!hasRestrictions) {
      console.log('✅ No location restrictions enabled across all projects')
      return {
        success: true,
        allowed: true,
        reason: 'no_restrictions',
        message: 'Location check passed - no restrictions active',
      }
    }

    // Get user's current location (only if restrictions exist)
    console.log('📱 Getting user location...')
    let userLocation
    try {
      userLocation = await locationService.getCurrentPosition()
      console.log(
        `📍 User location: ${userLocation.latitude}, ${userLocation.longitude} (accuracy: ${userLocation.accuracy}m)`
      )
    } catch (locationError) {
      console.error('❌ Failed to get user location:', locationError)
      const errorMessage = locationError?.message || String(locationError) || 'Unknown location error'
      return {
        success: false,
        allowed: false,
        reason: 'location_unavailable',
        message: 'Unable to determine your location. Please enable location services.',
        error: errorMessage,
      }
    }

    // Check location against restricted projects
    const locationCheck = locationService.checkLocationRestriction(userLocation, projects)

    if (locationCheck.allowed) {
      console.log('✅ Location check passed:', locationCheck.message)
      return {
        success: true,
        allowed: true,
        reason: locationCheck.reason,
        message: locationCheck.message,
        matchedProject: locationCheck.matchedProject,
        distance: locationCheck.distance,
      }
    } else {
      console.log('❌ Location check failed:', locationCheck.message)
      return {
        success: true, // Request succeeded, but location doesn't match
        allowed: false,
        reason: locationCheck.reason,
        message: locationCheck.message,
        nearestProject: locationCheck.nearestProject,
      }
    }
  } catch (error) {
    console.error('❌ Error in location validation:', error)
    return {
      success: false,
      allowed: false,
      reason: 'validation_error',
      message: 'Failed to validate location. Please try again.',
      error: error.message,
    }
  }
}

/**
 * Get location restriction status for display
 * @returns {Promise<Object>} Restriction status
 */
export async function getLocationRestrictionStatus(currentProjectId = null) {
  try {
    // OPTIMIZATION: Fetch projects with limit
    const { limit } = await import('firebase/firestore')
    const projectsSnapshot = await firestoreService.getDocs('projects', {
      constraints: [limit(50)]
    })
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // If currentProjectId is provided, check ONLY that project
    if (currentProjectId) {
      const currentProject = projects.find(p => p.id === currentProjectId)
      
      if (!currentProject) {
        console.warn('⚠️ Current project not found')
        return {
          active: false,
          projectCount: 0,
          projects: [],
        }
      }
      
      // Return status for CURRENT project only
      if (currentProject.restrictionEnabled === true) {
        return {
          active: true,
          projectCount: 1,
          projects: [{
            id: currentProject.id,
            name: currentProject.name,
            radius: currentProject.radiusMeters || 500,
          }],
        }
      } else {
        return {
          active: false,
          projectCount: 0,
          projects: [],
        }
      }
    }

    // If no currentProjectId, check all projects (legacy behavior)
    const restrictedProjects = projects.filter((p) => p.restrictionEnabled === true)

    return {
      active: restrictedProjects.length > 0,
      projectCount: restrictedProjects.length,
      projects: restrictedProjects.map((p) => ({
        id: p.id,
        name: p.name,
        radius: p.radiusMeters || 500,
      })),
    }
  } catch (error) {
    console.error('Error getting restriction status:', error)
    return {
      active: false,
      projectCount: 0,
      projects: [],
      error: error.message,
    }
  }
}

export default {
  validateGuestPassLocation,
  getLocationRestrictionStatus,
}

