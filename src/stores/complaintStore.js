import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import complaintService from '../services/complaintService';
import { useProjectStore } from './projectStore';
import optimizedAuthService from '../services/optimizedAuthService';

export const useComplaintStore = defineStore('complaint', () => {
  // State
  const complaints = ref([]);
  const currentComplaint = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const stats = ref({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const complaintCategories = ref([]);
  const categoriesLoading = ref(false);
  const categoriesLastFetch = ref(null);

  // Getters
  const userComplaints = computed(() => {
    // Since we're now filtering by userId at the service level,
    // all complaints in the store should belong to the current user
    return complaints.value;
  });

  const complaintsByStatus = computed(() => {
    return (status) => complaints.value.filter(complaint => complaint.status === status);
  });

  const recentComplaints = computed(() => {
    return complaints.value
      .sort((a, b) => new Date(b.lastMessageAt?.toDate()) - new Date(a.lastMessageAt?.toDate()))
      .slice(0, 5);
  });

  // Actions
  const fetchComplaints = async (filters = {}) => {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('🚀 ComplaintStore: Starting fetchComplaints...');
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      console.log('🔍 ComplaintStore: Project ID:', projectId);
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      // Get current user ID to filter complaints using optimized auth service
      const currentUser = await optimizedAuthService.getCurrentUser();
      
      console.log('🔍 ComplaintStore: Current user:', currentUser ? currentUser.uid : 'Not authenticated');
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Always filter by current user for user-specific complaints
      const userFilters = {
        ...filters,
        userId: currentUser.uid
      };

      console.log('🔍 ComplaintStore: Fetching complaints with filters:', { projectId, userFilters, currentUserId: currentUser.uid });

      const complaintsData = await complaintService.getComplaints(projectId, userFilters);
      
      console.log('🔍 ComplaintStore: Raw complaints data from service:', complaintsData.length, 'complaints');
      console.log('🔍 ComplaintStore: Sample complaint user IDs:', complaintsData.map(c => ({ id: c.id, userId: c.userId })));
      
      complaints.value = complaintsData;
      
      console.log('✅ ComplaintStore: Complaints fetched and stored:', complaintsData.length);
      console.log('✅ ComplaintStore: Final complaints array:', complaints.value);
      
      return complaintsData;
    } catch (err) {
      error.value = err.message;
      console.error('❌ ComplaintStore: Error fetching complaints:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchComplaint = async (complaintId) => {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('Fetching complaint in store:', complaintId);
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      console.log('Selected project:', projectId);
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const complaint = await complaintService.getComplaint(projectId, complaintId);
      currentComplaint.value = complaint;
      
      console.log('Complaint loaded in store:', complaint);
      return complaint;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching complaint:', err);
      currentComplaint.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createComplaint = async (complaintData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const user = await optimizedAuthService.getCurrentUser();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const newComplaint = await complaintService.createComplaint(
        projectId, 
        user.uid, 
        complaintData
      );
      
      complaints.value.unshift(newComplaint);
      return newComplaint;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating complaint:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addMessage = async (complaintId, messageData) => {
    let tempMessage = null;
    
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      // Add optimistic update
      tempMessage = {
        id: `temp_${Date.now()}`,
        ...messageData,
        timestamp: new Date(),
        isOptimistic: true
      };

      // Update current complaint optimistically
      if (currentComplaint.value && currentComplaint.value.id === complaintId) {
        currentComplaint.value.messages.push(tempMessage);
        currentComplaint.value.lastMessageAt = tempMessage.timestamp;
      }
      
      // Update complaints list optimistically
      const complaintIndex = complaints.value.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        complaints.value[complaintIndex].messages.push(tempMessage);
        complaints.value[complaintIndex].lastMessageAt = tempMessage.timestamp;
      }

      // Send to server
      const message = await complaintService.addMessage(projectId, complaintId, messageData);
      
      // Replace optimistic update with real message
      if (currentComplaint.value && currentComplaint.value.id === complaintId) {
        const messageIndex = currentComplaint.value.messages.findIndex(m => m.id === tempMessage.id);
        if (messageIndex !== -1) {
          currentComplaint.value.messages[messageIndex] = message;
        }
        currentComplaint.value.lastMessageAt = message.timestamp;
      }
      
      // Update complaints list with real message
      if (complaintIndex !== -1) {
        const messageIndex = complaints.value[complaintIndex].messages.findIndex(m => m.id === tempMessage.id);
        if (messageIndex !== -1) {
          complaints.value[complaintIndex].messages[messageIndex] = message;
        }
        complaints.value[complaintIndex].lastMessageAt = message.timestamp;
      }
      
      return message;
    } catch (err) {
      error.value = err.message;
      console.error('Error adding message:', err);
      
      // Remove optimistic update on error
      if (tempMessage) {
        if (currentComplaint.value && currentComplaint.value.id === complaintId) {
          currentComplaint.value.messages = currentComplaint.value.messages.filter(m => m.id !== tempMessage.id);
        }
        
        const complaintIndex = complaints.value.findIndex(c => c.id === complaintId);
        if (complaintIndex !== -1) {
          complaints.value[complaintIndex].messages = complaints.value[complaintIndex].messages.filter(m => m.id !== tempMessage.id);
        }
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadImage = async (file, complaintId) => {
    try {
      loading.value = true;
      error.value = null;
      
      const imageData = await complaintService.uploadComplaintImage(file, complaintId);
      return imageData;
    } catch (err) {
      error.value = err.message;
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateComplaintStatus = async (complaintId, status) => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      await complaintService.updateComplaintStatus(projectId, complaintId, status);
      
      // Update local state
      const complaintIndex = complaints.value.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        complaints.value[complaintIndex].status = status;
        complaints.value[complaintIndex].updatedAt = new Date();
      }
      
      if (currentComplaint.value && currentComplaint.value.id === complaintId) {
        currentComplaint.value.status = status;
        currentComplaint.value.updatedAt = new Date();
      }
      
      return true;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating complaint status:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const statsData = await complaintService.getComplaintStats(projectId);
      stats.value = statsData;
      
      return statsData;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching stats:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const subscribeToComplaints = (filters = {}) => {
    const projectStore = useProjectStore();
    const projectId = projectStore.selectedProject?.id;
    
    if (!projectId) {
      console.error('No project selected for subscription');
      return null;
    }

    return complaintService.subscribeToComplaints(projectId, filters, (updatedComplaints) => {
      complaints.value = updatedComplaints;
    });
  };

  const subscribeToComplaint = (complaintId) => {
    const projectStore = useProjectStore();
    const projectId = projectStore.selectedProject?.id;
    
    if (!projectId) {
      console.error('No project selected for subscription');
      return null;
    }

    return complaintService.subscribeToComplaint(projectId, complaintId, (updatedComplaint) => {
      if (updatedComplaint) {
        // Preserve temporary messages that haven't been confirmed yet
        const currentMessages = currentComplaint.value?.messages || [];
        const tempMessages = currentMessages.filter(msg => msg.isTemporary);
        
        // Update with real-time data
        currentComplaint.value = updatedComplaint;
        
        // Remove temporary messages that now have real versions
        if (tempMessages.length > 0 && updatedComplaint.messages) {
          const validTempMessages = tempMessages.filter(tempMsg => {
            // Keep temp message only if no real message with same text exists
            return !updatedComplaint.messages.some(realMsg => 
              !realMsg.isTemporary && 
              realMsg.text === tempMsg.text &&
              realMsg.senderType === 'user'
            );
          });
          
          // Add back remaining temp messages
          if (validTempMessages.length > 0) {
            currentComplaint.value.messages = [...updatedComplaint.messages, ...validTempMessages];
          }
        }
        
        console.log('⚡ ComplaintStore: Real-time complaint update with', currentComplaint.value.messages?.length, 'messages');
        
        // Update in complaints list
        const complaintIndex = complaints.value.findIndex(c => c.id === complaintId);
        if (complaintIndex !== -1) {
          complaints.value[complaintIndex] = currentComplaint.value;
        }
      }
    });
  };

  const clearCurrentComplaint = () => {
    currentComplaint.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  // Fetch complaint categories from Firestore
  const fetchComplaintCategories = async (force = false) => {
    const projectStore = useProjectStore();
    const projectId = projectStore.selectedProject?.id;
    
    if (!projectId) {
      console.error('No project selected for fetching complaint categories');
      return [];
    }

    // Check cache - fetch only if forced or older than 5 minutes
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (!force && 
        complaintCategories.value.length > 0 && 
        categoriesLastFetch.value && 
        (now - categoriesLastFetch.value) < CACHE_DURATION) {
      console.log('✨ Using cached complaint categories');
      return complaintCategories.value;
    }

    try {
      categoriesLoading.value = true;
      console.log('📡 Fetching complaint categories from Firestore...');
      console.log('📡 Project ID:', projectId);
      
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('../boot/firebase');
      
      const categoriesRef = collection(db, `projects/${projectId}/complaintCategories`);
      
      // Try with full query first (requires composite index)
      let snapshot;
      try {
        const q = query(
          categoriesRef,
          where('isActive', '==', true),
          orderBy('displayOrder', 'asc')
        );
        snapshot = await getDocs(q);
        console.log('✅ Fetched with composite query');
      } catch (indexError) {
        console.warn('⚠️ Composite index not available, falling back to simple query:', indexError.message);
        // Fallback: fetch all and filter/sort in memory
        snapshot = await getDocs(categoriesRef);
      }
      
      let categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter and sort in memory if we had to use fallback
      categories = categories
        .filter(cat => cat.isActive !== false) // Include if isActive is true or undefined
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      complaintCategories.value = categories;
      categoriesLastFetch.value = now;
      
      console.log('✅ Complaint categories fetched:', categories.length);
      console.log('📋 Categories data:', categories);
      return categories;
    } catch (err) {
      console.error('❌ Error fetching complaint categories:', err);
      console.error('❌ Error details:', err.message, err.code);
      error.value = err.message;
      
      // Don't use fallback - keep empty array to show proper empty state
      complaintCategories.value = [];
      return [];
    } finally {
      categoriesLoading.value = false;
    }
  };

  // Priority levels
  const priorityLevels = [
    { id: 'Low', name: 'Low', color: 'green' },
    { id: 'Medium', name: 'Medium', color: 'orange' },
    { id: 'High', name: 'High', color: 'red' },
    { id: 'Urgent', name: 'Urgent', color: 'purple' }
  ];

  return {
    // State
    complaints,
    currentComplaint,
    loading,
    error,
    stats,
    complaintCategories,
    categoriesLoading,
    
    // Getters
    userComplaints,
    complaintsByStatus,
    recentComplaints,
    
    // Actions
    fetchComplaints,
    fetchComplaint,
    createComplaint,
    addMessage,
    uploadImage,
    updateComplaintStatus,
    fetchStats,
    subscribeToComplaints,
    subscribeToComplaint,
    clearCurrentComplaint,
    clearError,
    fetchComplaintCategories,
    
    // Constants
    priorityLevels
  };
});