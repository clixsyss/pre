import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../boot/firebase';
import { getAuth } from 'firebase/auth';

// Create a new support chat
export const createSupportChat = async (projectId, data) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
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

    const docRef = await addDoc(collection(db, `projects/${projectId}/supportChats`), supportChatData);
    return { id: docRef.id, ...supportChatData };
  } catch (error) {
    console.error('Error creating support chat:', error);
    throw error;
  }
};

// Get support chat by ID
export const getSupportChat = async (projectId, chatId) => {
  try {
    const chatRef = doc(db, `projects/${projectId}/supportChats`, chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      return { id: chatSnap.id, ...chatSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting support chat:', error);
    throw error;
  }
};

// Get user's support chats
export const getUserSupportChats = async (projectId, userId) => {
  try {
    const q = query(
      collection(db, `projects/${projectId}/supportChats`),
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user support chats:', error);
    throw error;
  }
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
