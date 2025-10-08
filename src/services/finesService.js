import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../boot/firebase'

// Create a new fine/violation
export const createFine = async (projectId, fineData) => {
  return performanceService.timeOperation('createFine', async () => {
    try {
      console.log('🚀 Creating fine:', { projectId, fineData })
      
      const collectionPath = `projects/${projectId}/fines`
      
      const fine = {
        ...fineData,
        status: 'issued', // issued, paid, disputed, cancelled
        messages: [],
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await firestoreService.addDoc(collectionPath, fine)
      
      console.log('✅ Fine created successfully:', { fineId: result.id })
      return { id: result.id, ...fine };
    } catch (error) {
      console.error('❌ Error creating fine:', error);
      errorHandlingService.handleFirestoreError(error, 'createFine')
      throw error;
    }
  })
};

// Get all fines for a project
export const getFines = async (projectId) => {
  return performanceService.timeOperation('getFines', async () => {
    try {
      console.log('🔍 Getting fines:', { projectId })
      
      const collectionPath = `projects/${projectId}/fines`
      const orderBy = { field: 'createdAt', direction: 'desc' }
      
      const result = await firestoreService.getDocs(collectionPath, null, orderBy)
      const fines = result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Fines retrieved:', { count: fines.length })
      return fines;
    } catch (error) {
      console.error('❌ Error fetching fines:', error);
      errorHandlingService.handleFirestoreError(error, 'getFines')
      throw error;
    }
  })
};

// Get fines for a specific user
export const getUserFines = async (projectId, userId) => {
  return performanceService.timeOperation('getUserFines', async () => {
    try {
      console.log('🔍 Getting user fines:', { projectId, userId })
      console.log('🔍 User ID being searched for:', userId)
      console.log('🔍 User ID length:', userId.length)
      
      // Check if user is authenticated using the optimized auth service
      const currentUser = await optimizedAuthService.getCurrentUser()
      console.log('🔍 Current user:', currentUser ? currentUser.uid : 'Not authenticated')
      console.log('🔍 Current user object:', currentUser)
      
      if (!currentUser) {
        console.error('❌ Authentication failed - no current user found')
        throw new Error('User not authenticated')
      }
      
      // Verify the user ID matches
      if (currentUser.uid !== userId) {
        console.warn('⚠️ User ID mismatch:', { currentUserUid: currentUser.uid, requestedUserId: userId })
      }
      
      // Additional auth debugging
      console.log('🔍 Auth token:', currentUser.accessToken ? 'Present' : 'Missing')
      console.log('🔍 Auth provider:', currentUser.providerData?.[0]?.providerId || 'Unknown')
      
      console.log('✅ Authentication verified, proceeding with query')
      
      const collectionPath = `projects/${projectId}/fines`
      console.log('🔍 Collection path:', collectionPath)
      
      // Use Firestore where clause for secure server-side filtering
      const queryOptions = {
        filters: [
          { field: 'userId', operator: '==', value: userId }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' },
        timeoutMs: 8000
      }
      
      console.log('🔍 Query options (with server-side filtering):', queryOptions)
      const result = await firestoreService.getDocs(collectionPath, queryOptions)
      console.log('✅ Query with server-side filtering succeeded')
      
      const userFines = result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ User fines retrieved (before client filter):', { count: userFines.length, userId })
      console.log('🔍 User fines data (before client filter):', userFines)
      
      // Additional client-side filtering for extra security
      const filteredFines = userFines.filter(fine => {
        console.log('🔍 Checking fine:', { fineId: fine.id, fineUserId: fine.userId, currentUserId: userId })
        return fine.userId === userId
      })
      console.log('✅ User fines after client-side filter:', filteredFines.length)
      
      return filteredFines;
    } catch (error) {
      console.error('❌ Error fetching user fines:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        projectId,
        userId
      });
      
      // If it's a permission error or timeout, return empty array instead of throwing
      if (error.code === 'permission-denied' || error.message?.includes('timeout')) {
        console.warn('⚠️ Permission denied or timeout for fines collection, returning empty array')
        return []
      }
      
      errorHandlingService.handleFirestoreError(error, 'getUserFines')
      throw error;
    }
  })
};

// Get fines by status
export const getFinesByStatus = async (projectId, status) => {
  try {
    const collectionPath = `projects/${projectId}/fines`
    const queryOptions = {
      filters: [
        { field: 'status', operator: '==', value: status }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' },
      timeoutMs: 8000
    }
    
    const result = await firestoreService.getDocs(collectionPath, queryOptions)
    
    return result.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching fines by status:', error);
    throw error;
  }
};

// Get a specific fine
export const getFine = async (projectId, fineId) => {
  try {
    const docPath = `projects/${projectId}/fines/${fineId}`
    const result = await firestoreService.getDoc(docPath)
    
    if (result.exists) {
      return { id: result.id, ...result.data };
    } else {
      throw new Error('Fine not found');
    }
  } catch (error) {
    console.error('Error fetching fine:', error);
    throw error;
  }
};

// Update fine status
export const updateFineStatus = async (projectId, fineId, status, reason = '') => {
  try {
    const fineDoc = doc(db, 'projects', projectId, 'fines', fineId);
    
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Add system message about status change
    if (reason) {
      const systemMessage = {
        id: Date.now().toString(),
        text: `Fine status updated to "${status}". Reason: ${reason}`,
        sender: 'system',
        timestamp: new Date(),
        type: 'system'
      };

      // Get current fine to append message
      const currentFine = await getFine(projectId, fineId);
      updateData.messages = [...(currentFine.messages || []), systemMessage];
      updateData.lastMessageAt = new Date();
    }

    await updateDoc(fineDoc, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating fine status:', error);
    throw error;
  }
};

// Update fine details
export const updateFineDetails = async (projectId, fineId, updates, reason = '') => {
  try {
    const fineDoc = doc(db, 'projects', projectId, 'fines', fineId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Add system message about the update
    if (reason) {
      const systemMessage = {
        id: Date.now().toString(),
        text: `Fine details updated. Reason: ${reason}`,
        sender: 'system',
        timestamp: new Date(),
        type: 'system'
      };

      // Get current fine to append message
      const currentFine = await getFine(projectId, fineId);
      updateData.messages = [...(currentFine.messages || []), systemMessage];
      updateData.lastMessageAt = new Date();
    }

    await updateDoc(fineDoc, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating fine details:', error);
    throw error;
  }
};

// Add message to fine chat
export const addMessage = async (projectId, fineId, messageData) => {
  try {
    const fineDoc = doc(db, 'projects', projectId, 'fines', fineId);
    
    // Get current fine to append message
    const currentFine = await getFine(projectId, fineId);
    
    const newMessage = {
      id: Date.now().toString(),
      ...messageData,
      timestamp: new Date()
    };

    const updatedMessages = [...(currentFine.messages || []), newMessage];

    await updateDoc(fineDoc, {
      messages: updatedMessages,
      lastMessageAt: new Date(),
      updatedAt: new Date()
    });

    return newMessage;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (projectId, fineId, userId) => {
  try {
    const fineDoc = doc(db, 'projects', projectId, 'fines', fineId);
    
    // Get current fine
    const currentFine = await getFine(projectId, fineId);
    
    if (!currentFine.messages || !Array.isArray(currentFine.messages)) {
      return { success: true };
    }
    
    // Update messages to mark as read by user
    const updatedMessages = currentFine.messages.map(message => {
      if ((message.sender === 'admin' || message.sender === 'system') && 
          !message.readBy?.includes(userId)) {
        return {
          ...message,
          readBy: [...(message.readBy || []), userId]
        };
      }
      return message;
    });

    await updateDoc(fineDoc, {
      messages: updatedMessages,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Listen to real-time fine changes
export const onFineChange = (projectId, fineId, callback) => {
  const fineDoc = doc(db, 'projects', projectId, 'fines', fineId);
  
  return onSnapshot(fineDoc, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Upload fine evidence image
export const uploadFineImage = async (projectId, fineId, imageFile) => {
  try {
    const imageRef = ref(storage, `projects/${projectId}/fines/${fineId}/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading fine image:', error);
    throw error;
  }
};

// Delete fine image
export const deleteFineImage = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting fine image:', error);
    throw error;
  }
};

// Search users for fine assignment
export const searchUsers = async (projectId, searchTerm) => {
  try {
    // Fetch all users from global collection
    const result = await firestoreService.getDocs('users', { timeoutMs: 8000 });
    const usersData = result.docs.map(doc => ({
      id: doc.id,
      ...doc.data
    }));

    // Filter users who belong to this specific project
    const projectUsersData = usersData.filter(user => {
      if (user.projects && Array.isArray(user.projects)) {
        return user.projects.some(project => project.projectId === projectId);
      }
      return false;
    });

    // Add project-specific info to users
    const enrichedUsers = projectUsersData.map(user => {
      const projectInfo = user.projects.find(project => project.projectId === projectId);
      return {
        ...user,
        // Fix: Use the correct field names from the projects array
        unitNumber: projectInfo?.unit || user.unitNumber || user.unit,
        userUnit: projectInfo?.unit || user.unitNumber || user.unit,
        userRole: projectInfo?.role || user.userRole || user.role,
        name: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name),
        phone: user.mobile || user.phone
      };
    });

    // Filter users based on search term
    const filteredUsers = enrichedUsers.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.mobile?.toLowerCase().includes(searchLower) ||
        user.unitNumber?.toLowerCase().includes(searchLower) ||
        user.id?.toLowerCase().includes(searchLower)
      );
    });

    return filteredUsers;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export default {
  createFine,
  getFines,
  getUserFines,
  getFinesByStatus,
  getFine,
  updateFineStatus,
  updateFineDetails,
  addMessage,
  markMessagesAsRead,
  onFineChange,
  uploadFineImage,
  deleteFineImage,
  searchUsers
};
