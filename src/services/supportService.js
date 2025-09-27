import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../boot/firebase'

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
      
      const docPath = `projects/${projectId}/supportChats/${chatId}`
      const result = await firestoreService.getDoc(docPath)
      
      if (result.exists) {
        const chat = {
          id: result.id,
          ...result.data()
        }
        console.log('✅ Support chat retrieved successfully')
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
      
      const collectionPath = `projects/${projectId}/supportChats`
      const filters = {
        userId: { operator: '==', value: userId }
      }
      const orderBy = { field: 'lastMessageAt', direction: 'desc' }
      
      const result = await firestoreService.getDocs(collectionPath, filters, orderBy)
      const chats = result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ User support chats retrieved:', { count: chats.length })
      return chats;
    } catch (error) {
      console.error('❌ Error fetching user support chats:', error);
      errorHandlingService.handleFirestoreError(error, 'getUserSupportChats')
      throw error;
    }
  })
};

// Get all support chats (for admin)
export const getAllSupportChats = async (projectId) => {
  try {
    const q = query(
      collection(db, `projects/${projectId}/supportChats`),
      orderBy('lastMessageAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all support chats:', error);
    throw error;
  }
};

// Add message to support chat
export const addMessageToSupportChat = async (projectId, chatId, message) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const chatRef = doc(db, `projects/${projectId}/supportChats`, chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      throw new Error('Support chat not found');
    }

    const chatData = chatSnap.data();
    const now = new Date();
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

    // Get current messages and add new one (same as complaints)
    const currentMessages = chatData.messages || [];
    const updatedMessages = [...currentMessages, newMessage];

    await updateDoc(chatRef, {
      messages: updatedMessages,
      lastMessageAt: now,
      updatedAt: now
    });

    return newMessage;
  } catch (error) {
    console.error('Error adding message to support chat:', error);
    throw error;
  }
};

// Update support chat status
export const updateSupportChatStatus = async (projectId, chatId, status) => {
  try {
    const chatRef = doc(db, `projects/${projectId}/supportChats`, chatId);
    await updateDoc(chatRef, {
      status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating support chat status:', error);
    throw error;
  }
};

// Listen to support chat changes
export const listenToSupportChat = (projectId, chatId, callback) => {
  const chatRef = doc(db, `projects/${projectId}/supportChats`, chatId);
  return onSnapshot(chatRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Listen to user's support chats
export const listenToUserSupportChats = (projectId, userId, callback) => {
  const q = query(
    collection(db, `projects/${projectId}/supportChats`),
    where('userId', '==', userId),
    orderBy('lastMessageAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(chats);
  });
};

// Get support chat stats
export const getSupportChatStats = async (projectId, userId) => {
  try {
    const chats = await getUserSupportChats(projectId, userId);
    
    const stats = {
      total: chats.length,
      open: chats.filter(chat => chat.status === 'open').length,
      inProgress: chats.filter(chat => chat.status === 'in-progress').length,
      resolved: chats.filter(chat => chat.status === 'resolved').length,
      closed: chats.filter(chat => chat.status === 'closed').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting support chat stats:', error);
    throw error;
  }
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
