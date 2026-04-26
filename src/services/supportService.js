import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'
import { createNotification, NOTIFICATION_TYPES } from './notificationCenterService'

// Create a new support chat
export const createSupportChat = async (projectId, data) => {
  return performanceService.timeOperation('createSupportChat', async () => {
    try {
      console.log('🚀 Creating support chat:', { projectId, data })
      
      const user = await optimizedAuthService.getCurrentUser()
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const supportChatData = {
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        title: data.title || `Support Chat - ${new Date().toLocaleString()}`,
        status: 'open',
        category: data.category || 'general',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date()
      };

      const collectionPath = `projects/${projectId}/supportChats`
      const result = await firestoreService.addDoc(collectionPath, supportChatData)
      
      console.log('✅ Support chat created successfully:', { chatId: result.id })
      
      // Send notification to user
      try {
        await createNotification({
          userId: user.uid,
          projectId,
          title: 'Support Chat Created',
          message: 'Your support request has been received. Our team will respond soon.',
          type: NOTIFICATION_TYPES.INFO,
          actionUrl: `/support-chat/${result.id}`
        });
        console.log('✅ Support chat notification sent');
      } catch (notifError) {
        console.error('⚠️ Failed to send support chat notification:', notifError);
      }
      
      return { id: result.id, ...supportChatData };
    } catch (error) {
      console.error('❌ Error creating support chat:', error);
      errorHandlingService.handleFirestoreError(error, 'createSupportChat')
      throw error;
    }
  })
};

// Get support chat by ID
export const getSupportChat = async (projectId, chatId) => {
  return performanceService.timeOperation('getSupportChat', async () => {
    try {
      console.log('🔍 Getting support chat:', { projectId, chatId })
      
      // Use DynamoDB service first
      try {
        const { getSupportChatById } = await import('src/services/dynamoDBSupportChatsService')
        const chat = await getSupportChatById(projectId, chatId)
        if (chat) {
          console.log('✅ Support chat retrieved from DynamoDB')
          return chat
        }
      } catch (dynamoError) {
        console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
      }
      
      // Fallback to Firestore
      const docPath = `projects/${projectId}/supportChats/${chatId}`
      const result = await firestoreService.getDoc(docPath)
      
      if (result.exists()) {
        const chat = {
          id: result.id,
          ...result.data()
        }
        console.log('✅ Support chat retrieved from Firestore')
        return chat;
      } else {
        console.log('Support chat not found')
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching support chat:', error);
      errorHandlingService.handleFirestoreError(error, 'getSupportChat')
      throw error;
    }
  })
};

// Get user's support chats
export const getUserSupportChats = async (projectId, userId) => {
  return performanceService.timeOperation('getUserSupportChats', async () => {
    try {
      console.log('🔍 Getting user support chats:', { projectId, userId })
      
      // Try DynamoDB first, then always fall back to Firestore
      // (DynamoDB may return [] if migration is incomplete — don't trust an empty result)
      let dynamoChats = []
      try {
        const { getUserSupportChats: getDynamoDBUserSupportChats } = await import('src/services/dynamoDBSupportChatsService')
        dynamoChats = await getDynamoDBUserSupportChats(projectId, userId, { limit: 100 })
        console.log('✅ User support chats retrieved from DynamoDB:', { count: dynamoChats.length })
      } catch (dynamoError) {
        console.warn('⚠️ DynamoDB fetch failed, will use Firestore:', dynamoError)
      }

      // Always also fetch from Firestore — chats may have been created there
      const collectionPath = `projects/${projectId}/supportChats`
      const queryOptions = {
        filters: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: { field: 'lastMessageAt', direction: 'desc' }
      }
      let firestoreChats = []
      try {
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        firestoreChats = result.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('✅ User support chats retrieved from Firestore:', { count: firestoreChats.length })
      } catch (fsError) {
        console.warn('⚠️ Firestore fetch failed:', fsError)
      }

      // Merge: Firestore is the source of truth — DynamoDB entries with same id are skipped
      const firestoreIds = new Set(firestoreChats.map(c => c.id))
      const merged = [
        ...firestoreChats,
        ...dynamoChats.filter(c => !firestoreIds.has(c.id))
      ]
      merged.sort((a, b) => {
        const tA = a.lastMessageAt?.toDate?.() || new Date(a.lastMessageAt || 0)
        const tB = b.lastMessageAt?.toDate?.() || new Date(b.lastMessageAt || 0)
        return tB - tA
      })
      console.log('✅ Merged support chats total:', merged.length)
      return merged
    } catch (error) {
      console.error('❌ Error fetching user support chats:', error);
      errorHandlingService.handleFirestoreError(error, 'getUserSupportChats')
      throw error;
    }
  })
};

// Get all support chats (for admin)
export const getAllSupportChats = async (projectId) => {
  return performanceService.timeOperation('getAllSupportChats', async () => {
    try {
      console.log('🔍 Getting all support chats for project:', projectId)
      
      // Use DynamoDB service first
      try {
        const { getSupportChatsByProject } = await import('src/services/dynamoDBSupportChatsService')
        const chats = await getSupportChatsByProject(projectId, { limit: 100 })
        console.log('✅ All support chats retrieved from DynamoDB:', { count: chats.length })
        return chats
      } catch (dynamoError) {
        console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
        
        // Fallback to Firestore
        const collectionPath = `projects/${projectId}/supportChats`
        const queryOptions = {
          orderBy: { field: 'lastMessageAt', direction: 'desc' }
        }
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        const chats = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ All support chats retrieved from Firestore:', { count: chats.length })
        return chats;
      }
    } catch (error) {
      console.error('❌ Error getting all support chats:', error);
      errorHandlingService.handleFirestoreError(error, 'getAllSupportChats')
      throw error;
    }
  })
};

// Add message to support chat
export const addMessageToSupportChat = async (projectId, chatId, message) => {
  return performanceService.timeOperation('addMessageToSupportChat', async () => {
    try {
      console.log('🚀 Adding message to support chat:', { projectId, chatId })
      
      const user = await optimizedAuthService.getCurrentUser()
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const docPath = `projects/${projectId}/supportChats/${chatId}`
      const chatResult = await firestoreService.getDoc(docPath)
      
      if (!chatResult.exists()) {
        throw new Error('Support chat not found');
      }

      const chatData = chatResult.data()
      const now = new Date()
      const newMessage = {
        id: Date.now().toString(),
        text: message.text,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        senderType: user.uid === chatData.userId ? 'user' : 'admin',
        timestamp: now,
        type: message.type || 'text',
        imageUrl: message.imageUrl || null
      };

      // Get current messages and add new one
      const currentMessages = chatData.messages || [];
      const updatedMessages = [...currentMessages, newMessage];

      await firestoreService.updateDoc(docPath, {
        messages: updatedMessages,
        lastMessageAt: now.toISOString(),
        updatedAt: now.toISOString()
      });

      console.log('✅ Message added to support chat successfully')
      
      // Send notification if admin is replying to user
      try {
        if (newMessage.senderType === 'admin' && chatData.userId !== user.uid) {
          await createNotification({
            userId: chatData.userId,
            projectId,
            title: 'New Reply from Support Team',
            message: 'Support team has responded to your ticket.',
            type: NOTIFICATION_TYPES.INFO,
            actionUrl: `/support-chat/${chatId}`
          });
          console.log('✅ Support chat reply notification sent');
        }
      } catch (notifError) {
        console.error('⚠️ Failed to send support chat reply notification:', notifError);
      }
      
      return newMessage;
    } catch (error) {
      console.error('❌ Error adding message to support chat:', error);
      errorHandlingService.handleFirestoreError(error, 'addMessageToSupportChat')
      throw error;
    }
  })
};

// Update support chat status
export const updateSupportChatStatus = async (projectId, chatId, status) => {
  return performanceService.timeOperation('updateSupportChatStatus', async () => {
    try {
      console.log('🚀 Updating support chat status:', { projectId, chatId, status })
      
      const docPath = `projects/${projectId}/supportChats/${chatId}`
      await firestoreService.updateDoc(docPath, {
        status,
        updatedAt: new Date()
      });
      
      console.log('✅ Support chat status updated successfully')
    } catch (error) {
      console.error('❌ Error updating support chat status:', error);
      errorHandlingService.handleFirestoreError(error, 'updateSupportChatStatus')
      throw error;
    }
  })
};

// Listen to support chat changes
export const listenToSupportChat = (projectId, chatId, callback) => {
  try {
    const docPath = `projects/${projectId}/supportChats/${chatId}`
    return firestoreService.onSnapshot(docPath, (doc) => {
      if (doc && doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('❌ Error setting up support chat listener:', error);
    throw error;
  }
};

// Listen to user's support chats
export const listenToUserSupportChats = (projectId, userId, callback) => {
  try {
    const collectionPath = `projects/${projectId}/supportChats`
    const filters = [{ field: 'userId', operator: '==', value: userId }]
    const orderBy = { field: 'lastMessageAt', direction: 'desc' }
    
    return firestoreService.onSnapshot(collectionPath, (querySnapshot) => {
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(chats);
    }, { filters, orderBy });
  } catch (error) {
    console.error('❌ Error setting up user support chats listener:', error);
    throw error;
  }
};

// Get support chat stats
export const getSupportChatStats = async (projectId, userId) => {
  return performanceService.timeOperation('getSupportChatStats', async () => {
    try {
      console.log('🔍 Getting support chat stats:', { projectId, userId })
      
      const chats = await getUserSupportChats(projectId, userId);
      
      const stats = {
        total: chats.length,
        open: chats.filter(chat => chat.status === 'open').length,
        inProgress: chats.filter(chat => chat.status === 'in-progress').length,
        resolved: chats.filter(chat => chat.status === 'resolved').length,
        closed: chats.filter(chat => chat.status === 'closed').length
      };
      
      console.log('✅ Support chat stats retrieved:', stats)
      return stats;
    } catch (error) {
      console.error('❌ Error getting support chat stats:', error);
      errorHandlingService.handleFirestoreError(error, 'getSupportChatStats')
      throw error;
    }
  })
};

export default {
  createSupportChat,
  getSupportChat,
  getUserSupportChats,
  getAllSupportChats,
  addMessageToSupportChat,
  updateSupportChatStatus,
  listenToSupportChat,
  listenToUserSupportChats,
  getSupportChatStats
};
