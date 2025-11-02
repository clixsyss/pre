/**
 * Location Check Service
 * Validates user location for guest pass generation
 */

import firestoreService from './firestoreService'
import locationService from './locationService'

/**
 * Validate if user can generate guest pass based on location
 * @returns {Promise<Object>} Validation result
 */
export async function validateGuestPassLocation() {
  try {
    console.log('🔍 Validating location for guest pass generation...')

    // Fetch all projects from Firestore
    const projectsSnapshot = await firestoreService.getDocs('projects')
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`📍 Fetched ${projects.length} projects`)

    // Check if any project has restriction enabled
    const hasRestrictions = projects.some((p) => p.restrictionEnabled === true)

    if (!hasRestrictions) {
      console.log('✅ No location restrictions enabled')
      return {
        success: true,
        allowed: true,
        reason: 'no_restrictions',
        message: 'Location check passed - no restrictions active',
      }
    }

    // Get user's current location
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
export async function getLocationRestrictionStatus() {
  try {
    // Fetch all projects
    const projectsSnapshot = await firestoreService.getDocs('projects')
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Check if any project has restriction enabled
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

