import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import newsCommentsService from '../services/newsCommentsService';
import { getAuth } from 'firebase/auth';
import { useProjectStore } from './projectStore';

export const useNewsCommentsStore = defineStore('newsComments', () => {
  // State
  const comments = ref({}); // { newsId: [comments] }
  const newsReactions = ref({}); // { newsId: { emoji: { count, users } } }
  const userNewsReactions = ref({}); // { newsId: [userReactions] }
  const loading = ref(false);
  const error = ref(null);
  const subscriptions = ref({}); // { newsId: unsubscribeFunction }
  const reactionSubscriptions = ref({}); // { newsId: unsubscribeFunction }

  // Getters
  const getCommentsForNews = computed(() => {
    return (newsId) => {
      return comments.value[newsId] || [];
    };
  });

  const getActiveComments = computed(() => {
    return (newsId) => {
      const newsComments = comments.value[newsId] || [];
      return newsComments.filter(comment => !comment.isDeleted);
    };
  });

  const getDeletedComments = computed(() => {
    return (newsId) => {
      const newsComments = comments.value[newsId] || [];
      return newsComments.filter(comment => comment.isDeleted);
    };
  });

  const getNewsReactions = computed(() => {
    return (newsId) => {
      return newsReactions.value[newsId] || {};
    };
  });

  const getUserNewsReactions = computed(() => {
    return (newsId) => {
      return userNewsReactions.value[newsId] || [];
    };
  });

  // Actions
  const fetchComments = async (newsId) => {
    if (!newsId) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const fetchedComments = await newsCommentsService.getComments(projectId, newsId);
      comments.value[newsId] = fetchedComments;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching comments:', err);
    } finally {
      loading.value = false;
    }
  };

  const subscribeToComments = (newsId) => {
    if (!newsId || subscriptions.value[newsId]) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const unsubscribe = newsCommentsService.subscribeToComments(projectId, newsId, (fetchedComments) => {
        comments.value[newsId] = fetchedComments;
      });
      
      subscriptions.value[newsId] = unsubscribe;
    } catch (err) {
      error.value = err.message;
      console.error('Error subscribing to comments:', err);
    }
  };

  const unsubscribeFromComments = (newsId) => {
    if (subscriptions.value[newsId]) {
      subscriptions.value[newsId]();
      delete subscriptions.value[newsId];
    }
  };

  const addComment = async (newsId, text, parentCommentId = null) => {
    if (!newsId || !text?.trim()) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      // Get user details for comment
      const userDetails = {
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        userUnit: projectStore.selectedProject?.userUnit || null,
        userProject: projectStore.selectedProject?.name || null,
      };
      
      const commentId = await newsCommentsService.addComment(projectId, newsId, user.uid, {
        ...userDetails,
        text: text.trim(),
        parentCommentId
      });
      
      // Refresh comments
      await fetchComments(newsId);
      
      return commentId;
    } catch (err) {
      error.value = err.message;
      console.error('Error adding comment:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleReaction = async (newsId, commentId, emoji) => {
    if (!newsId || !commentId || !emoji) return;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      // Check if user already reacted with this emoji
      const newsComments = comments.value[newsId] || [];
      const comment = newsComments.find(c => c.id === commentId);
      
      if (!comment) return;
      
      const reactions = comment.reactions || {};
      const emojiReaction = reactions[emoji];
      const hasReacted = emojiReaction?.users?.includes(user.uid) || false;
      
      await newsCommentsService.toggleReaction(
        projectId, 
        newsId, 
        commentId, 
        user.uid, 
        emoji, 
        !hasReacted
      );
      
      // Refresh comments to get updated reactions
      await fetchComments(newsId);
    } catch (err) {
      error.value = err.message;
      console.error('Error toggling reaction:', err);
    }
  };

  const fetchNewsReactions = async (newsId) => {
    if (!newsId) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const reactions = await newsCommentsService.getNewsReactions(projectId, newsId);
      
      // Process reactions to group by emoji
      const reactionGroups = {};
      const userReactions = [];
      const auth = getAuth();
      const user = auth.currentUser;
      
      reactions.forEach(reaction => {
        const emoji = reaction.emoji;
        if (!reactionGroups[emoji]) {
          reactionGroups[emoji] = { count: 0, users: [] };
        }
        reactionGroups[emoji].count++;
        reactionGroups[emoji].users.push({
          userId: reaction.userId,
          userName: reaction.userName,
          timestamp: reaction.timestamp
        });
        
        // Track user's own reactions
        if (user && reaction.userId === user.uid) {
          userReactions.push(emoji);
        }
      });
      
      newsReactions.value[newsId] = reactionGroups;
      userNewsReactions.value[newsId] = userReactions;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching news reactions:', err);
    }
  };

  const subscribeToNewsReactions = (newsId) => {
    if (!newsId || reactionSubscriptions.value[newsId]) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const unsubscribe = newsCommentsService.subscribeToNewsReactions(projectId, newsId, (reactions) => {
        // Process reactions to group by emoji
        const reactionGroups = {};
        const userReactions = [];
        const auth = getAuth();
        const user = auth.currentUser;
        
        reactions.forEach(reaction => {
          const emoji = reaction.emoji;
          if (!reactionGroups[emoji]) {
            reactionGroups[emoji] = { count: 0, users: [] };
          }
          reactionGroups[emoji].count++;
          reactionGroups[emoji].users.push({
            userId: reaction.userId,
            userName: reaction.userName,
            timestamp: reaction.timestamp
          });
          
          // Track user's own reactions
          if (user && reaction.userId === user.uid) {
            userReactions.push(emoji);
          }
        });
        
        newsReactions.value[newsId] = reactionGroups;
        userNewsReactions.value[newsId] = userReactions;
      });
      
      reactionSubscriptions.value[newsId] = unsubscribe;
    } catch (err) {
      error.value = err.message;
      console.error('Error subscribing to news reactions:', err);
    }
  };

  const unsubscribeFromNewsReactions = (newsId) => {
    if (reactionSubscriptions.value[newsId]) {
      reactionSubscriptions.value[newsId]();
      delete reactionSubscriptions.value[newsId];
    }
  };

  const toggleNewsReaction = async (newsId, emoji) => {
    if (!newsId || !emoji) return;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      await newsCommentsService.toggleNewsReaction(projectId, newsId, emoji);
      
      // Refresh reactions after toggle
      await fetchNewsReactions(newsId);
    } catch (err) {
      error.value = err.message;
      console.error('Error toggling news reaction:', err);
    }
  };

  const deleteComment = async (newsId, commentId, reason = 'Violation of community guidelines') => {
    if (!newsId || !commentId) return;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      await newsCommentsService.deleteComment(projectId, newsId, commentId, user.uid, reason);
      
      // Refresh comments
      await fetchComments(newsId);
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  const restoreComment = async (newsId, commentId) => {
    if (!newsId || !commentId) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      await newsCommentsService.restoreComment(projectId, newsId, commentId);
      
      // Refresh comments
      await fetchComments(newsId);
    } catch (err) {
      error.value = err.message;
      console.error('Error restoring comment:', err);
      throw err;
    }
  };

  const getCommentStats = async (newsId) => {
    if (!newsId) return null;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      return await newsCommentsService.getCommentStats(projectId, newsId);
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching comment stats:', err);
      return null;
    }
  };

  const clearComments = (newsId) => {
    if (newsId) {
      delete comments.value[newsId];
      unsubscribeFromComments(newsId);
    } else {
      comments.value = {};
      Object.values(subscriptions.value).forEach(unsubscribe => unsubscribe());
      subscriptions.value = {};
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const deleteCommentWithReplies = async (projectId, newsId, commentId) => {
    try {
      loading.value = true;
      error.value = null;
      
      await newsCommentsService.deleteCommentWithReplies(projectId, newsId, commentId);
      
      // Remove the comment and its replies from local state
      const commentIndex = comments.value.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        // Remove the main comment
        comments.value.splice(commentIndex, 1);
        
        // Remove all replies to this comment
        comments.value = comments.value.filter(c => c.parentCommentId !== commentId);
      }
      
      console.log('Comment and replies deleted successfully');
    } catch (err) {
      console.error('Error deleting comment with replies:', err);
      error.value = err.message || 'Failed to delete comment';
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    comments,
    newsReactions,
    userNewsReactions,
    loading,
    error,
    
    // Getters
    getCommentsForNews,
    getActiveComments,
    getDeletedComments,
    getNewsReactions,
    getUserNewsReactions,
    
    // Actions
    fetchComments,
    subscribeToComments,
    unsubscribeFromComments,
    addComment,
    toggleReaction,
    fetchNewsReactions,
    subscribeToNewsReactions,
    unsubscribeFromNewsReactions,
    toggleNewsReaction,
    deleteComment,
    deleteCommentWithReplies,
    restoreComment,
    getCommentStats,
    clearComments,
    clearError
  };
});
