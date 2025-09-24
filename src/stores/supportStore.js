import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supportService from '../services/supportService';
import { useProjectStore } from './projectStore';
import { getAuth } from 'firebase/auth';

export const useSupportStore = defineStore('support', () => {
  // State
  const supportChats = ref([]);
  const currentSupportChat = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const stats = ref({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  // Getters
  const userSupportChats = computed(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    return supportChats.value.filter(chat => chat.userId === user?.uid);
  });

  const supportChatsByStatus = computed(() => {
    return (status) => supportChats.value.filter(chat => chat.status === status);
  });

  const recentSupportChats = computed(() => {
    return supportChats.value
      .sort((a, b) => new Date(b.lastMessageAt?.toDate()) - new Date(a.lastMessageAt?.toDate()))
      .slice(0, 5);
  });

  // Actions
  const fetchSupportChats = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const chats = await supportService.getUserSupportChats(projectId, user.uid);
      supportChats.value = chats;
      
      // Update stats
      await updateStats();
      
      return chats;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSupportChat = async (chatId) => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const chat = await supportService.getSupportChat(projectId, chatId);
      currentSupportChat.value = chat;
      
      return chat;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSupportChat = async (data) => {
    try {
      loading.value = true;
      error.value = null;
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const chat = await supportService.createSupportChat(projectId, data);
      
      // Add to local state
      supportChats.value.unshift(chat);
      currentSupportChat.value = chat;
      
      // Update stats
      await updateStats();
      
      return chat;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addMessage = async (chatId, message) => {
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      const newMessage = await supportService.addMessageToSupportChat(projectId, chatId, message);
      
      // Don't update local state here - let the real-time listener handle it
      // This prevents duplicate messages from appearing
      
      return newMessage;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const updateStatus = async (chatId, status) => {
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }

      await supportService.updateSupportChatStatus(projectId, chatId, status);
      
      // Update local state
      const chat = supportChats.value.find(c => c.id === chatId);
      if (chat) {
        chat.status = status;
        chat.updatedAt = new Date();
      }
      
      if (currentSupportChat.value?.id === chatId) {
        currentSupportChat.value.status = status;
        currentSupportChat.value.updatedAt = new Date();
      }
      
      // Update stats
      await updateStats();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const updateStats = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        stats.value = {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0
        };
        return;
      }

      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        stats.value = {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0
        };
        return;
      }

      const chatStats = await supportService.getSupportChatStats(projectId, user.uid);
      stats.value = chatStats;
    } catch (err) {
      console.error('Error updating support chat stats:', err);
    }
  };

  const listenToSupportChat = (chatId) => {
    const projectStore = useProjectStore();
    const projectId = projectStore.selectedProject?.id;
    
    if (!projectId) {
      return () => {};
    }

    return supportService.listenToSupportChat(projectId, chatId, (chat) => {
      currentSupportChat.value = chat;
      
      // Update in chats list
      const index = supportChats.value.findIndex(c => c.id === chatId);
      if (index !== -1) {
        supportChats.value[index] = chat;
      } else if (chat) {
        supportChats.value.unshift(chat);
      }
    });
  };

  const listenToUserSupportChats = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return null;

    const projectStore = useProjectStore();
    const projectId = projectStore.selectedProject?.id;
    
    if (!projectId) return null;
    
    return supportService.listenToUserSupportChats(projectId, user.uid, (chats) => {
      supportChats.value = chats;
      updateStats();
    });
  };

  const clearCurrentChat = () => {
    currentSupportChat.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    supportChats,
    currentSupportChat,
    loading,
    error,
    stats,
    
    // Getters
    userSupportChats,
    supportChatsByStatus,
    recentSupportChats,
    
    // Actions
    fetchSupportChats,
    fetchSupportChat,
    createSupportChat,
    addMessage,
    updateStatus,
    updateStats,
    listenToSupportChat,
    listenToUserSupportChats,
    clearCurrentChat,
    clearError
  };
});
