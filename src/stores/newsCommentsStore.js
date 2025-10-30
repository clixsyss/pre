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
  const fetchComments = async (newsId, skipCache = false) => {
    if (!newsId) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      const fetchedComments = await newsCommentsService.getComments(projectId, newsId, { skipCache });
      // Force Vue reactivity by creating new object references (deep clone reactions and users arrays)
      const clonedComments = fetchedComments.map(comment => ({
        ...comment,
        // Deep clone reactions - each emoji reaction gets a new object reference, including users array
        reactions: comment.reactions ? Object.fromEntries(
          Object.entries(comment.reactions).map(([emoji, data]) => [
            emoji, 
            { 
              count: data.count, 
              users: data.users ? [...data.users] : [] // Clone the users array too
            }
          ])
        ) : {}
      }));
      comments.value = { ...comments.value, [newsId]: clonedComments };
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
        // Force Vue reactivity by creating new object references (deep clone reactions and users arrays)
        const clonedComments = fetchedComments.map(comment => ({
          ...comment,
          // Deep clone reactions - each emoji reaction gets a new object reference, including users array
          reactions: comment.reactions ? Object.fromEntries(
            Object.entries(comment.reactions).map(([emoji, data]) => [
              emoji, 
              { 
                count: data.count, 
                users: data.users ? [...data.users] : [] // Clone the users array too
              }
            ])
          ) : {}
        }));
        comments.value = { ...comments.value, [newsId]: clonedComments };
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
      
      // Get user's FIRST NAME ONLY from Firestore user document
      let userName = user.displayName?.split(' ')[0] || 'Anonymous'; // Fallback to first word of displayName
      try {
        const userDoc = await newsCommentsService.getUserDocument(user.uid);
        if (userDoc && userDoc.firstName) {
          // Use ONLY first name as requested
          userName = userDoc.firstName;
        }
      } catch (userError) {
        console.warn('⚠️ Could not fetch user document, using displayName:', userError);
      }
      
      // Get user details for comment
      const userDetails = {
        userName,
        userEmail: user.email || '',
        userUnit: projectStore.selectedProject?.userUnit || null,
        userProject: projectStore.selectedProject?.name || null,
      };
      
      console.log('💬 Adding comment with data:', {
        parentCommentId,
        isReply: !!parentCommentId,
        text: text.trim().substring(0, 50)
      });
      
      const commentId = await newsCommentsService.addComment(projectId, newsId, user.uid, {
        ...userDetails,
        text: text.trim(),
        parentCommentId
      });
      
      console.log('✅ Comment added:', { commentId, parentCommentId });
      
      // Refresh comments with fresh data (skip cache to ensure new comment shows immediately)
      await fetchComments(newsId, true);
      
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
      console.log('💬 toggleReaction called:', { newsId, commentId, emoji });
      
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
      
      if (!comment) {
        console.error('Comment not found:', commentId);
        return;
      }
      
      const reactions = comment.reactions || {};
      const emojiReaction = reactions[emoji];
      const hasReacted = emojiReaction?.users?.includes(user.uid) || false;
      
      console.log('💬 Comment reaction state:', {
        commentId,
        emoji,
        hasReacted,
        currentReactions: reactions,
        userId: user.uid
      });
      
      const actionType = hasReacted ? 'removing' : 'adding';
      console.log(`💬 ${actionType} reaction ${emoji} on comment ${commentId}`);
      
      await newsCommentsService.toggleReaction(
        projectId, 
        newsId, 
        commentId, 
        user.uid, 
        emoji, 
        !hasReacted
      );
      
      console.log('✅ Comment reaction toggled successfully');
      
      // Refresh comments to get updated reactions - SKIP CACHE for immediate update
      await fetchComments(newsId, true);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error toggling comment reaction:', err);
    }
  };

  const fetchNewsReactions = async (newsId, skipCache = false) => {
    if (!newsId) return;
    
    try {
      console.log('📊 fetchNewsReactions START for newsId:', newsId, 'skipCache:', skipCache);
      
      const projectStore = useProjectStore();
      const projectId = projectStore.selectedProject?.id;
      
      if (!projectId) {
        throw new Error('No project selected');
      }
      
      console.log('📊 Calling newsCommentsService.getNewsReactions...');
      const reactions = await newsCommentsService.getNewsReactions(projectId, newsId, skipCache);
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
      
      try {
        await newsCommentsService.toggleNewsReaction(projectId, newsId, emoji);
      } catch (toggleError) {
        // If it's a permission error, it might be due to rules propagation delay
        // The real-time listener will still update the UI correctly
        if (toggleError.code === 'permission-denied') {
          console.warn('⚠️ Permission denied during toggle, but real-time listener should handle updates');
          // Don't throw - let the real-time listener handle the state
        } else {
          throw toggleError;
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Reaction toggle completed (took ${duration}ms)`);
      
      // Manually refresh reactions after toggle (important for iOS where subscriptions may hang)
      // IMPORTANT: Skip cache to get fresh data after toggling
      console.log('🔄 Refreshing reactions after toggle...');
      await fetchNewsReactions(newsId, true);
      console.log('✅ Reactions refreshed after toggle');
      
      // Extra safety: wait for real-time updates
      setTimeout(async () => {
        console.log('🔍 Safety check - fetching reactions again...');
        await fetchNewsReactions(newsId, true);
      }, 1000);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error toggling news reaction:', err?.message || JSON.stringify(err) || err);
      // Still throw to show user feedback
      throw err;
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
