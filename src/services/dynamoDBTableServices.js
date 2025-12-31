/**
 * DynamoDB Table Services - Placeholder Services
 * 
 * These are placeholder service files for all DynamoDB tables.
 * They are NOT yet integrated with UI - only the structure is defined.
 * 
 * Each service follows the same pattern:
 * - Uses centralized dynamodbClient from ../aws/dynamodbClient
 * - Provides CRUD operations for the specific table
 * - Returns data in format compatible with existing UI expectations
 */

import { getItem, putItem, query } from '../aws/dynamodbClient'

// ============================================================================
// USERS TOKENS SERVICE
// ============================================================================
const USERS_TOKENS_TABLE = 'users__tokens'

export const usersTokensService = {
  async getTokensByUserId(userId) {
    try {
      return await query(USERS_TOKENS_TABLE, {
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
    } catch (error) {
      console.error('[UsersTokensService] Error:', error)
      throw error
    }
  },
  
  async addToken(userId, tokenData) {
    try {
      const item = {
        userId,
        tokenId: tokenData.tokenId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...tokenData
      }
      await putItem(USERS_TOKENS_TABLE, item)
      return item
    } catch (error) {
      console.error('[UsersTokensService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// USERS NOTIFICATION READ STATUS SERVICE
// ============================================================================
const USERS_NOTIFICATION_READ_STATUS_TABLE = 'users__notificationReadStatus'

export const usersNotificationReadStatusService = {
  async getReadStatus(userId, notificationId) {
    try {
      return await getItem(USERS_NOTIFICATION_READ_STATUS_TABLE, {
        userId,
        notificationId
      })
    } catch (error) {
      console.error('[UsersNotificationReadStatusService] Error:', error)
      throw error
    }
  },
  
  async getAllReadStatuses(userId) {
    try {
      const { scan } = await import('../aws/dynamodbClient')
      const results = await scan(USERS_NOTIFICATION_READ_STATUS_TABLE, {
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      
      // Convert to Map for compatibility with existing code
      const readStatusMap = new Map()
      if (results && results.length > 0) {
        results.forEach(item => {
          if (item.notificationId && item.read) {
            readStatusMap.set(item.notificationId, {
              read: item.read,
              readAt: item.readAt
            })
          }
        })
      }
      return readStatusMap
    } catch (error) {
      console.error('[UsersNotificationReadStatusService] Error getting all read statuses:', error)
      // Return empty map on error (assume all unread)
      return new Map()
    }
  },
  
  async markAsRead(userId, notificationId) {
    try {
      const item = {
        userId,
        notificationId,
        read: true,
        readAt: new Date().toISOString()
      }
      await putItem(USERS_NOTIFICATION_READ_STATUS_TABLE, item)
      return item
    } catch (error) {
      console.error('[UsersNotificationReadStatusService] Error:', error)
      throw error
    }
  },
  
  async markMultipleAsRead(userId, notificationIds) {
    try {
      // Use Promise.all to mark multiple notifications as read in parallel
      const promises = notificationIds.map(notificationId => 
        this.markAsRead(userId, notificationId).catch(error => {
          console.error(`[UsersNotificationReadStatusService] Failed to mark ${notificationId} as read:`, error)
          // Continue with other notifications even if one fails
          return null
        })
      )
      
      const results = await Promise.all(promises)
      const successful = results.filter(r => r !== null)
      
      console.log(`[UsersNotificationReadStatusService] ✅ Marked ${successful.length}/${notificationIds.length} notifications as read`)
      return successful
    } catch (error) {
      console.error('[UsersNotificationReadStatusService] Error marking multiple as read:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS REQUEST SUBMISSIONS SERVICE
// ============================================================================
const PROJECTS_REQUEST_SUBMISSIONS_TABLE = 'projects_requestSubmissions'

export const projectsRequestSubmissionsService = {
  async getSubmissionsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_REQUEST_SUBMISSIONS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsRequestSubmissionsService] Error:', error)
      throw error
    }
  },
  
  async getSubmissionById(projectId, submissionId) {
    try {
      return await getItem(PROJECTS_REQUEST_SUBMISSIONS_TABLE, {
        projectId,
        id: submissionId
      })
    } catch (error) {
      console.error('[ProjectsRequestSubmissionsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS COMPLAINTS SERVICE
// ============================================================================
const PROJECTS_COMPLAINTS_TABLE = 'projects_complaints'

export const projectsComplaintsService = {
  async getComplaintsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_COMPLAINTS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsComplaintsService] Error:', error)
      throw error
    }
  },
  
  async getComplaintById(projectId, complaintId) {
    try {
      return await getItem(PROJECTS_COMPLAINTS_TABLE, {
        projectId,
        id: complaintId
      })
    } catch (error) {
      console.error('[ProjectsComplaintsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS USER GUEST PASS SETTINGS SERVICE
// ============================================================================
const PROJECTS_USER_GUEST_PASS_SETTINGS_TABLE = 'projects__userGuestPassSettings'

export const projectsUserGuestPassSettingsService = {
  async getSettings(projectId, userId) {
    try {
      return await getItem(PROJECTS_USER_GUEST_PASS_SETTINGS_TABLE, {
        projectId,
        userId
      })
    } catch (error) {
      console.error('[ProjectsUserGuestPassSettingsService] Error:', error)
      throw error
    }
  },
  
  async updateSettings(projectId, userId, settings) {
    try {
      const item = {
        projectId,
        userId,
        ...settings,
        updatedAt: new Date().toISOString()
      }
      await putItem(PROJECTS_USER_GUEST_PASS_SETTINGS_TABLE, item)
      return item
    } catch (error) {
      console.error('[ProjectsUserGuestPassSettingsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS UNITS SERVICE
// ============================================================================
const PROJECTS_UNITS_TABLE = 'projects__units'

export const projectsUnitsService = {
  async getUnitsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_UNITS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsUnitsService] Error:', error)
      throw error
    }
  },
  
  async getUnitById(projectId, unitId) {
    try {
      return await getItem(PROJECTS_UNITS_TABLE, {
        projectId,
        id: unitId
      })
    } catch (error) {
      console.error('[ProjectsUnitsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS UNIT GUEST PASS SETTINGS SERVICE
// ============================================================================
const PROJECTS_UNIT_GUEST_PASS_SETTINGS_TABLE = 'projects__unitGuestPassSettings'

export const projectsUnitGuestPassSettingsService = {
  async getSettings(projectId, unitId) {
    try {
      // Project tables use parentId as partition key and id as sort key
      return await getItem(PROJECTS_UNIT_GUEST_PASS_SETTINGS_TABLE, {
        parentId: projectId,
        id: unitId
      })
    } catch (error) {
      console.error('[ProjectsUnitGuestPassSettingsService] Error:', error)
      throw error
    }
  },
  
  async updateSettings(projectId, unitId, settings) {
    try {
      // Project tables use parentId as partition key and id as sort key
      const item = {
        parentId: projectId,
        id: unitId,
        projectId, // Keep for backward compatibility
        unitId, // Keep for backward compatibility
        ...settings,
        updatedAt: new Date().toISOString()
      }
      await putItem(PROJECTS_UNIT_GUEST_PASS_SETTINGS_TABLE, item)
      return item
    } catch (error) {
      console.error('[ProjectsUnitGuestPassSettingsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS SUPPORT CHATS SERVICE
// ============================================================================
const PROJECTS_SUPPORT_CHATS_TABLE = 'projects__supportChats'

export const projectsSupportChatsService = {
  async getChatsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_SUPPORT_CHATS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsSupportChatsService] Error:', error)
      throw error
    }
  },
  
  async getChatById(projectId, chatId) {
    try {
      return await getItem(PROJECTS_SUPPORT_CHATS_TABLE, {
        projectId,
        id: chatId
      })
    } catch (error) {
      console.error('[ProjectsSupportChatsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS NEWS COMMENTS SERVICE
// ============================================================================
const PROJECTS_NEWS_COMMENTS_TABLE = 'projects__news__comments'

export const projectsNewsCommentsService = {
  async getCommentsByNews(projectId, newsId, options = {}) {
    try {
      return await query(PROJECTS_NEWS_COMMENTS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId AND newsId = :newsId',
        ExpressionAttributeValues: {
          ':projectId': projectId,
          ':newsId': newsId
        },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsNewsCommentsService] Error:', error)
      throw error
    }
  },
  
  async getCommentById(projectId, newsId, commentId) {
    try {
      return await getItem(PROJECTS_NEWS_COMMENTS_TABLE, {
        projectId,
        newsId,
        id: commentId
      })
    } catch (error) {
      console.error('[ProjectsNewsCommentsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS NEWS REACTIONS SERVICE
// ============================================================================
const PROJECTS_NEWS_REACTIONS_TABLE = 'projects__news__reactions'

export const projectsNewsReactionsService = {
  async getReactionsByNews(projectId, newsId, options = {}) {
    try {
      return await query(PROJECTS_NEWS_REACTIONS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId AND newsId = :newsId',
        ExpressionAttributeValues: {
          ':projectId': projectId,
          ':newsId': newsId
        },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsNewsReactionsService] Error:', error)
      throw error
    }
  },
  
  async getReactionById(projectId, newsId, reactionId) {
    try {
      return await getItem(PROJECTS_NEWS_REACTIONS_TABLE, {
        projectId,
        newsId,
        id: reactionId
      })
    } catch (error) {
      console.error('[ProjectsNewsReactionsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS FINES SERVICE
// ============================================================================
const PROJECTS_FINES_TABLE = 'projects__fines'

export const projectsFinesService = {
  async getFinesByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_FINES_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsFinesService] Error:', error)
      throw error
    }
  },
  
  async getFineById(projectId, fineId) {
    try {
      return await getItem(PROJECTS_FINES_TABLE, {
        projectId,
        id: fineId
      })
    } catch (error) {
      console.error('[ProjectsFinesService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS GATE PASSES SERVICE
// ============================================================================
const PROJECTS_GATE_PASSES_TABLE = 'projects__gatePasses'

export const projectsGatePassesService = {
  async getGatePassesByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_GATE_PASSES_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsGatePassesService] Error:', error)
      throw error
    }
  },
  
  async getGatePassById(projectId, gatePassId) {
    try {
      return await getItem(PROJECTS_GATE_PASSES_TABLE, {
        projectId,
        id: gatePassId
      })
    } catch (error) {
      console.error('[ProjectsGatePassesService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS EMAIL GROUPS SERVICE
// ============================================================================
const PROJECTS_EMAIL_GROUPS_TABLE = 'projects__emailGroups'

export const projectsEmailGroupsService = {
  async getEmailGroupsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_EMAIL_GROUPS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsEmailGroupsService] Error:', error)
      throw error
    }
  },
  
  async getEmailGroupById(projectId, groupId) {
    try {
      return await getItem(PROJECTS_EMAIL_GROUPS_TABLE, {
        projectId,
        id: groupId
      })
    } catch (error) {
      console.error('[ProjectsEmailGroupsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECTS DEVICE KEY RESET REQUESTS SERVICE
// ============================================================================
const PROJECTS_DEVICE_KEY_RESET_REQUESTS_TABLE = 'projects__deviceKeyResetRequests'

export const projectsDeviceKeyResetRequestsService = {
  async getRequestsByProject(projectId, options = {}) {
    try {
      return await query(PROJECTS_DEVICE_KEY_RESET_REQUESTS_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectsDeviceKeyResetRequestsService] Error:', error)
      throw error
    }
  },
  
  async getRequestById(projectId, requestId) {
    try {
      return await getItem(PROJECTS_DEVICE_KEY_RESET_REQUESTS_TABLE, {
        projectId,
        id: requestId
      })
    } catch (error) {
      console.error('[ProjectsDeviceKeyResetRequestsService] Error:', error)
      throw error
    }
  }
}

// ============================================================================
// PROJECT FINES SERVICE (alternative naming)
// ============================================================================
const PROJECT_FINES_TABLE = 'project_fines'

export const projectFinesService = {
  async getFinesByProject(projectId, options = {}) {
    try {
      return await query(PROJECT_FINES_TABLE, {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: { ':projectId': projectId },
        ...options
      })
    } catch (error) {
      console.error('[ProjectFinesService] Error:', error)
      throw error
    }
  },
  
  async getFineById(projectId, fineId) {
    try {
      return await getItem(PROJECT_FINES_TABLE, {
        projectId,
        id: fineId
      })
    } catch (error) {
      console.error('[ProjectFinesService] Error:', error)
      throw error
    }
  }
}

// Export all services
export default {
  usersTokensService,
  usersNotificationReadStatusService,
  projectsRequestSubmissionsService,
  projectsComplaintsService,
  projectsUserGuestPassSettingsService,
  projectsUnitsService,
  projectsUnitGuestPassSettingsService,
  projectsSupportChatsService,
  projectsNewsCommentsService,
  projectsNewsReactionsService,
  projectsFinesService,
  projectsGatePassesService,
  projectsEmailGroupsService,
  projectsDeviceKeyResetRequestsService,
  projectFinesService
}



