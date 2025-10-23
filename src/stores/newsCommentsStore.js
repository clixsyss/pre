import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import newsCommentsService from '../services/newsCommentsService';
import optimizedAuthService from '../services/optimizedAuthService';
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

  // Getter functions for accessing reactions by newsId
  const getNewsReactions = (newsId) => {
    return newsReactions.value[newsId] || {};
  };

  const getUserNewsReactions = (newsId) => {
    return userNewsReactions.value[newsId] || [];
  };

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
      console.error('Error fetching comments:', err?.message || JSON.stringify(err) || err);
    } finally {
      loading.value = false;
    }
  };

  const subscribeToComments = async (newsId) => {
    if (!newsId || subscriptions.value[newsId]) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const unsubscribe = await newsCommentsService.subscribeToComments(projectId, newsId, (fetchedComments) => {
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
      const user = await optimizedAuthService.getCurrentUser();
      
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
      console.error('Error adding comment:', err?.message || JSON.stringify(err) || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleReaction = async (newsId, commentId, emoji) => {
    if (!newsId || !commentId || !emoji) return;
    
    try {
      const user = await optimizedAuthService.getCurrentUser();
      
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
      console.log('📊 fetchNewsReactions START for newsId:', newsId);
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      console.log('📊 Calling newsCommentsService.getNewsReactions...');
      const reactions = await newsCommentsService.getNewsReactions(projectId, newsId);
      console.log('📊 Got reactions:', reactions?.length || 0, reactions);
      
      // Process reactions to group by emoji
      const reactionGroups = {};
      const userReactions = [];
      const user = await optimizedAuthService.getCurrentUser();
      
      console.log('👤 Current user ID:', user?.uid);
      
      reactions.forEach(reaction => {
        console.log('Processing reaction:', {
          emoji: reaction.emoji,
          userId: reaction.userId,
          userName: reaction.userName,
          isCurrentUser: user && reaction.userId === user.uid
        });
        
        const emoji = reaction.emoji;
        if (!emoji) {
          console.warn('⚠️ Reaction missing emoji field:', reaction);
          return; // Skip reactions without emoji
        }
        
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
          console.log('✅ Found user reaction:', emoji);
          userReactions.push(emoji);
        }
      });
      
      // Update state in a reactive way - create new objects to ensure Vue detects changes
      newsReactions.value = {
        ...newsReactions.value,
        [newsId]: reactionGroups
      };
      userNewsReactions.value = {
        ...userNewsReactions.value,
        [newsId]: userReactions
      };
      
      console.log('✅ fetchNewsReactions COMPLETE:', {
        totalReactions: Object.values(reactionGroups).reduce((sum, r) => sum + r.count, 0),
        userReactions
      });
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error fetching news reactions:', err?.message || JSON.stringify(err) || err);
    }
  };

  const subscribeToNewsReactions = async (newsId) => {
    if (!newsId || reactionSubscriptions.value[newsId]) return;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      // Get user once before subscription
      const currentUser = await optimizedAuthService.getCurrentUser();
      
      const unsubscribe = await newsCommentsService.subscribeToNewsReactions(projectId, newsId, (reactions) => {
        console.log('🔔 Subscription callback received reactions:', reactions);
        
        // Process reactions to group by emoji
        const reactionGroups = {};
        const userReactions = [];
        
        reactions.forEach(reaction => {
          const emoji = reaction.emoji;
          
          if (!emoji) {
            console.warn('⚠️ Subscription: Reaction missing emoji field:', reaction);
            return; // Skip reactions without emoji
          }
          
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
          if (currentUser && reaction.userId === currentUser.uid) {
            console.log('✅ Subscription: Found user reaction:', emoji);
            userReactions.push(emoji);
          }
        });
        
        // Update state in a reactive way - create new objects to ensure Vue detects changes
        newsReactions.value = {
          ...newsReactions.value,
          [newsId]: reactionGroups
        };
        userNewsReactions.value = {
          ...userNewsReactions.value,
          [newsId]: userReactions
        };
        
        console.log('News reactions updated for', newsId, ':', {
          totalReactions: Object.values(reactionGroups).reduce((sum, r) => sum + r.count, 0),
          userReactions: userReactions
        });
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
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      console.log('🎯 Toggling reaction in Firestore...');
      const startTime = Date.now();
      
      await newsCommentsService.toggleNewsReaction(projectId, newsId, emoji);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Reaction toggled successfully (took ${duration}ms)`);
      
      // Manually refresh reactions after toggle (important for iOS where subscriptions may hang)
      console.log('🔄 Refreshing reactions after toggle...');
      await fetchNewsReactions(newsId);
      console.log('✅ Reactions refreshed after toggle');
      
      // Extra safety: if reactions still don't show user's reaction after 500ms, fetch again
      setTimeout(async () => {
        const currentUserReactions = userNewsReactions.value[newsId] || [];
        console.log('🔍 Safety check - current user reactions:', currentUserReactions);
        
        if (currentUserReactions.length === 0) {
          console.warn('⚠️ User reactions still empty, fetching again...');
          await fetchNewsReactions(newsId);
        }
      }, 500);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error toggling news reaction:', err?.message || JSON.stringify(err) || err);
    }
  };

  const deleteComment = async (newsId, commentId, reason = 'Violation of community guidelines') => {
    if (!newsId || !commentId) return;
    
    try {
      const user = await optimizedAuthService.getCurrentUser();
      
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
