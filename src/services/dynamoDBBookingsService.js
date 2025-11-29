/**
 * DynamoDB Bookings Service
 * 
 * Handles all operations for the "projects__bookings" DynamoDB table.
 * This service replaces Firebase/Firestore calls for bookings data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Booking ID
 * - Fields: academyId, academyName, courtId, courtLocation, courtName, courtSurface,
 *           courtType, createdAt, date, enrollmentDate, participant (nested object),
 *           price, programId, programName, projectId, sport, sportType, status,
 *           timeSlots (array), totalPrice, type, updatedAt, userId
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__bookings'

/**
 * Convert DynamoDB formatted timeSlots array to JavaScript array
 * DynamoDB format: [ { "S" : "2:00 PM" }, { "S" : "3:00 PM" } ]
 * JavaScript format: [ "2:00 PM", "3:00 PM" ]
 * @param {Array} dynamoTimeSlots - Time slots array in DynamoDB format
 * @returns {Array} Time slots array in JavaScript format
 */
function convertTimeSlotsFromDynamoDB(dynamoTimeSlots) {
  if (!Array.isArray(dynamoTimeSlots)) {
    return []
  }
  
  return dynamoTimeSlots.map(slot => {
    if (slot && typeof slot === 'object' && slot.S) {
      return slot.S
    }
    return slot // Return as is if already in JavaScript format
  })
}

/**
 * Convert DynamoDB formatted participant object to JavaScript object
 * DynamoDB format: { "fullName" : { "S" : "Ahmed Hassan" }, "phone" : { "S" : "+20 123 456 789" }, ... }
 * JavaScript format: { fullName: "Ahmed Hassan", phone: "+20 123 456 789", ... }
 * @param {Object} dynamoParticipant - Participant object in DynamoDB format
 * @returns {Object} Participant object in JavaScript format
 */
function convertParticipantFromDynamoDB(dynamoParticipant) {
  if (!dynamoParticipant || typeof dynamoParticipant !== 'object') {
    return {}
  }
  
  const converted = {}
  
  for (const [key, value] of Object.entries(dynamoParticipant)) {
    if (value && typeof value === 'object') {
      if (value.S) {
        converted[key] = value.S
      } else if (value.N) {
        converted[key] = parseFloat(value.N)
      } else if (value.BOOL !== undefined) {
        converted[key] = value.BOOL
      } else if (value.L) {
        converted[key] = value.L.map(item => {
          if (item.S) return item.S
          if (item.N) return parseFloat(item.N)
          if (item.BOOL !== undefined) return item.BOOL
          return item
        })
      } else if (value.M) {
        converted[key] = convertParticipantFromDynamoDB(value.M)
      }
    } else {
      converted[key] = value
    }
  }
  
  return converted
}

/**
 * Get all bookings for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of bookings to return
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.status - Filter by status (e.g., 'confirmed', 'pending', 'cancelled')
 * @param {string} options.type - Filter by type (e.g., 'court', 'academy')
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getBookingsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBBookingsService] Fetching bookings for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBBookingsService] No projectId provided')
      return []
    }
    
    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': projectId
      }
    }
    
    if (options.limit) {
      queryOptions.Limit = options.limit
    }
    
    // Add filter expressions if provided
    const filterParts = []
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    if (options.status) {
      filterParts.push('#status = :status')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#status'] = 'status'
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }
    if (options.type) {
      filterParts.push('#type = :type')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#type'] = 'type'
      queryOptions.ExpressionAttributeValues[':type'] = options.type
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const bookings = items.map(item => {
      const booking = {
        id: item.id,
        parentId: item.parentId || projectId,
        projectId: item.projectId || projectId,
        userId: item.userId || '',
        type: item.type || '',
        status: item.status || 'pending',
        date: item.date || null,
        enrollmentDate: item.enrollmentDate || null,
        price: item.price ? parseFloat(item.price) : 0,
        totalPrice: item.totalPrice ? parseFloat(item.totalPrice) : 0,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
        // Court-related fields
        courtId: item.courtId || '',
        courtName: item.courtName || '',
        courtLocation: item.courtLocation || '',
        courtSurface: item.courtSurface || '',
        courtType: item.courtType || '',
        sport: item.sport || '',
        sportType: item.sportType || '',
        // Academy-related fields
        academyId: item.academyId || '',
        academyName: item.academyName || '',
        programId: item.programId || '',
        programName: item.programName || '',
        // Convert nested objects/arrays
        timeSlots: convertTimeSlotsFromDynamoDB(item.timeSlots || []),
        participant: convertParticipantFromDynamoDB(item.participant || {})
      }
      
      return booking
    })
    
    console.log(`[DynamoDBBookingsService] ✅ Fetched ${bookings.length} bookings for project ${projectId}`)
    
    return bookings
  } catch (error) {
    console.error(`[DynamoDBBookingsService] ❌ Error fetching bookings for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get bookings for a specific user in a project
 * @param {string} projectId - Project ID (parentId)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of bookings to return
 * @param {string} options.status - Filter by status
 * @param {string} options.type - Filter by type
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getUserBookings(projectId, userId, options = {}) {
  try {
    console.log(`[DynamoDBBookingsService] Fetching bookings for user: ${userId} in project: ${projectId}`)
    
    if (!projectId || !userId) {
      console.warn('[DynamoDBBookingsService] Missing projectId or userId')
      return []
    }
    
    return await getBookingsByProject(projectId, {
      ...options,
      userId: userId
    })
  } catch (error) {
    console.error(`[DynamoDBBookingsService] ❌ Error fetching user bookings:`, error)
    throw error
  }
}

/**
 * Get bookings by status
 * @param {string} projectId - Project ID (parentId)
 * @param {string} status - Status (e.g., 'confirmed', 'pending', 'cancelled')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getBookingsByStatus(projectId, status, options = {}) {
  try {
    console.log(`[DynamoDBBookingsService] Fetching ${status} bookings for project: ${projectId}`)
    
    return await getBookingsByProject(projectId, {
      ...options,
      status: status
    })
  } catch (error) {
    console.error(`[DynamoDBBookingsService] ❌ Error fetching bookings by status:`, error)
    throw error
  }
}

/**
 * Get bookings by type (court or academy)
 * @param {string} projectId - Project ID (parentId)
 * @param {string} type - Type ('court' or 'academy')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getBookingsByType(projectId, type, options = {}) {
  try {
    console.log(`[DynamoDBBookingsService] Fetching ${type} bookings for project: ${projectId}`)
    
    return await getBookingsByProject(projectId, {
      ...options,
      type: type
    })
  } catch (error) {
    console.error(`[DynamoDBBookingsService] ❌ Error fetching bookings by type:`, error)
    throw error
  }
}

/**
 * Get a single booking by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} Booking object or null if not found
 */
export async function getBookingById(projectId, bookingId) {
  try {
    console.log(`[DynamoDBBookingsService] Fetching booking: ${bookingId} in project: ${projectId}`)
    
    if (!projectId || !bookingId) {
      console.warn('[DynamoDBBookingsService] Missing projectId or bookingId')
      return null
    }
    
    const booking = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: bookingId
    })
    
    if (booking) {
      // Convert to JavaScript format
      const converted = {
        id: booking.id,
        parentId: booking.parentId || projectId,
        projectId: booking.projectId || projectId,
        userId: booking.userId || '',
        type: booking.type || '',
        status: booking.status || 'pending',
        date: booking.date || null,
        enrollmentDate: booking.enrollmentDate || null,
        price: booking.price ? parseFloat(booking.price) : 0,
        totalPrice: booking.totalPrice ? parseFloat(booking.totalPrice) : 0,
        createdAt: booking.createdAt || null,
        updatedAt: booking.updatedAt || null,
        // Court-related fields
        courtId: booking.courtId || '',
        courtName: booking.courtName || '',
        courtLocation: booking.courtLocation || '',
        courtSurface: booking.courtSurface || '',
        courtType: booking.courtType || '',
        sport: booking.sport || '',
        sportType: booking.sportType || '',
        // Academy-related fields
        academyId: booking.academyId || '',
        academyName: booking.academyName || '',
        programId: booking.programId || '',
        programName: booking.programName || '',
        // Convert nested objects/arrays
        timeSlots: convertTimeSlotsFromDynamoDB(booking.timeSlots || []),
        participant: convertParticipantFromDynamoDB(booking.participant || {})
      }
      
      console.log(`[DynamoDBBookingsService] ✅ Found booking: ${bookingId}`)
      return converted
    }
    
    console.log(`[DynamoDBBookingsService] ⚠️ Booking not found: ${bookingId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBBookingsService] ❌ Error fetching booking ${bookingId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getBookingsByProject,
  getUserBookings,
  getBookingsByStatus,
  getBookingsByType,
  getBookingById
}

