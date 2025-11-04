/**
 * Location Service
 * Handles geolocation and distance calculations for guest pass restrictions
 */

import { Geolocation } from '@capacitor/geolocation'

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Get the user's current GPS position
 * @returns {Promise<Object>} Position object with coords
 */
export async function getCurrentPosition() {
  try {
    // Check permissions first
    const permission = await Geolocation.checkPermissions()
    
    console.log('📍 Current location permissions:', permission)
    
    if (permission.location !== 'granted') {
      console.log('📍 Location permission not granted, requesting...')
      
      // Request permissions if not granted
      // Note: On iOS, this will present a dialog with "While Using the App" and "Always" options
      // On Android, it will show "Precise" and "Approximate" location options
      const requestResult = await Geolocation.requestPermissions()
      
      console.log('📍 Permission request result:', requestResult)
      
      if (requestResult.location !== 'granted' && requestResult.location !== 'prompt') {
        // User denied permission
        const error = new Error('Location permission denied. Please enable location services in your device settings to generate guest passes.')
        error.code = 'PERMISSION_DENIED'
        throw error
      }
      
      // If permission was just granted or is prompt, try again
      if (requestResult.location === 'prompt') {
        console.log('📍 Permission is in prompt state, user needs to respond to dialog')
      }
    }

    console.log('📍 Getting current position with high accuracy...')
    
    // Get current position with high accuracy
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 10000, // Accept cached position up to 10 seconds old
    })

    console.log('📍 Raw position object:', position)

    // Validate position object structure
    if (!position || !position.coords) {
      const error = new Error('Invalid position object returned from Geolocation')
      error.code = 'INVALID_POSITION'
      throw error
    }

    // Check for invalid coordinates (0,0 is a common error case)
    if (position.coords.latitude === 0 && position.coords.longitude === 0) {
      const error = new Error('Invalid location coordinates (0,0). Location services may not be fully initialized. Please wait a moment and try again.')
      error.code = 'INVALID_POSITION'
      throw error
    }

    console.log('📍 Position obtained:', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    })

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    }
  } catch (error) {
    console.error('❌ Error getting current position:', error)
    
    const errorMessage = error?.message || String(error) || 'Unknown error'
    const errorCode = error?.code
    
    // Provide user-friendly error messages
    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('permission')) {
      const friendlyError = new Error(
        'Location access required. Please enable location permissions in Settings → PRE Group → Location.'
      )
      friendlyError.code = 'PERMISSION_DENIED'
      throw friendlyError
    }
    
    if (errorCode === 1 || errorMessage.includes('denied')) {
      const friendlyError = new Error(
        'Location permission denied. Please enable location services to generate guest passes.'
      )
      friendlyError.code = 'PERMISSION_DENIED'
      throw friendlyError
    }
    
    if (errorCode === 2 || errorMessage.includes('unavailable')) {
      const friendlyError = new Error(
        'Location currently unavailable. Please check that location services are enabled on your device.'
      )
      friendlyError.code = 'POSITION_UNAVAILABLE'
      throw friendlyError
    }
    
    if (errorCode === 3 || errorMessage.includes('timeout')) {
      const friendlyError = new Error(
        'Location request timed out. Please ensure you have a clear view of the sky and try again.'
      )
      friendlyError.code = 'TIMEOUT'
      throw friendlyError
    }
    
    if (errorCode === 'INVALID_POSITION') {
      const friendlyError = new Error(
        'Invalid location data received. Please try again.'
      )
      friendlyError.code = 'INVALID_POSITION'
      throw friendlyError
    }
    
    throw error
  }
}

/**
 * Check if user is within a project's location radius
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} projectLat - Project's latitude
 * @param {number} projectLng - Project's longitude
 * @param {number} radiusMeters - Allowed radius in meters
 * @returns {boolean} True if within radius
 */
export function isWithinRadius(userLat, userLng, projectLat, projectLng, radiusMeters) {
  const distance = getDistance(userLat, userLng, projectLat, projectLng)
  return distance <= radiusMeters
}

/**
 * Check if user location matches any project with restrictions enabled
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @param {Array} projects - Array of project objects
 * @returns {Object} Result with match status and details
 */
export function checkLocationRestriction(userLocation, projects) {
  // Filter projects with restriction enabled
  const restrictedProjects = projects.filter(
    (project) =>
      project.restrictionEnabled &&
      project.latitude &&
      project.longitude &&
      project.radiusMeters
  )

  // If no projects have restriction enabled, allow access
  if (restrictedProjects.length === 0) {
    return {
      allowed: true,
      reason: 'no_restrictions',
      message: 'Location restriction is not active',
    }
  }

  // Check each restricted project
  for (const project of restrictedProjects) {
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      project.latitude,
      project.longitude
    )

    if (distance <= project.radiusMeters) {
      return {
        allowed: true,
        reason: 'within_radius',
        message: `Within ${project.name} location`,
        matchedProject: project,
        distance: Math.round(distance),
      }
    }
  }

  // User is not within any restricted project's radius
  return {
    allowed: false,
    reason: 'outside_radius',
    message: 'You must be within a registered project location to generate a Guest Pass',
    nearestProject: findNearestProject(userLocation, restrictedProjects),
  }
}

/**
 * Find the nearest project to user's location
 * @param {Object} userLocation - User's current location
 * @param {Array} projects - Array of project objects
 * @returns {Object} Nearest project with distance
 */
function findNearestProject(userLocation, projects) {
  if (projects.length === 0) return null

  let nearest = null
  let minDistance = Infinity

  for (const project of projects) {
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      project.latitude,
      project.longitude
    )

    if (distance < minDistance) {
      minDistance = distance
      nearest = project
    }
  }

  return {
    project: nearest,
    distance: Math.round(minDistance),
  }
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export default {
  getDistance,
  getCurrentPosition,
  isWithinRadius,
  checkLocationRestriction,
  formatDistance,
}

