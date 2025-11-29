import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import firestoreService from './firestoreService'
import optimizedAuthService from './optimizedAuthService'

/**
 * News Comments Service
 * Handles all news commenting functionality including reactions, replies, and moderation
 */

class NewsCommentsService {
  constructor() {
    // No need for db reference - using firestoreService
  }

  /**
   * Get user document from Firestore
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserDocument(userId) {
    try {
      const userDoc = await firestoreService.getDoc(`users/${userId}`);
      return userDoc && userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user document:', error);
      return null;
    }
  }

  /**
   * Add a comment to a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {string} userId - User ID
   * @param {Object} commentData - Comment data
   * @returns {Promise<string>} - Comment ID
   */
  async addComment(projectId, newsId, userId, commentData) {
    return performanceService.timeOperation('addComment', async () => {
      try {
        console.log('🚀 Adding comment:', { projectId, newsId, userId, commentData })
        
        // const collectionPath = `projects/${projectId}/news/${newsId}/comments` // Not used in this method
        const now = new Date();
        
      // Get comment ID first
      const commentId = await firestoreService.addDoc(`projects/${projectId}/news/${newsId}/comments`, {
        // Create with the ID already set to avoid permission issues
        userId,
        userName: commentData.userName || 'Anonymous',
        userEmail: commentData.userEmail || '',
        text: commentData.text.trim(),
        parentCommentId: commentData.parentCommentId || null, // For replies
        reactions: {}, // { emoji: { count: number, users: [userId] } }
        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
        deletionReason: null,
        createdAt: now,
        updatedAt: now,
        // Additional metadata
        userUnit: commentData.userUnit || null,
        userProject: commentData.userProject || null,
      });
      
      // Update news item comment count
      await this.updateNewsCommentCount(projectId, newsId, 1);
      
      return commentId;
      } catch (error) {
        console.error('❌ Error adding comment:', error?.message || JSON.stringify(error) || error);
        errorHandlingService.handleFirestoreError(error, 'addComment')
        throw error;
      }
    })
  }

  /**
   * Get comments for a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of comments
   */
  async getComments(projectId, newsId, options = {}) {
    try {
      const queryOptions = {
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: options.limit,
        skipCache: options.skipCache || false
      };
      
      const result = await firestoreService.getDocs(
        `projects/${projectId}/news/${newsId}/comments`,
        queryOptions
      );
      
      const comments = result.docs || [];
      
      return comments.map(doc => {
        // Extract data from Firestore document (handle both DocumentSnapshot and plain objects)
        const data = typeof doc.data === 'function' ? doc.data() : doc;
        const docId = doc.id || '';
        
        // Spread data first, THEN override id to ensure correct id is used
        return {
          ...data,
          id: docId, // Override any id field in data with the actual document ID
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
        };
      });
    } catch (error) {
      console.error('Error fetching comments:', error?.message || JSON.stringify(error) || error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time comments updates
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  async subscribeToComments(projectId, newsId, callback) {
    try {
      // Check if iOS to use polling instead of real-time listeners
      const { Capacitor } = await import('@capacitor/core');
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
      
      if (isIOS) {
        // Use polling for iOS since collection listeners don't work reliably
        let intervalId;
        
        const pollComments = async () => {
          try {
            const comments = await this.getComments(projectId, newsId);
            callback(comments);
          } catch (error) {
            console.error('Error polling comments:', error?.message || JSON.stringify(error) || error);
          }
        };
        
        // Initial fetch
        await pollComments();
        
        // Poll every 5 seconds
        intervalId = setInterval(pollComments, 5000);
        
        // Return unsubscribe function
        return () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      } else {
        // Use real-time listeners for web
        return firestoreService.subscribeToQuery(
          `projects/${projectId}/news/${newsId}/comments`,
          { orderByField: 'createdAt', orderDirection: 'desc' },
          (snapshot) => {
            console.log('🔔 Comments subscription received:', snapshot.docs?.length || 0, 'documents');
            
            const comments = snapshot.docs.map(doc => {
              // Extract data - handle both Firestore document and plain objects
              const data = typeof doc.data === 'function' ? doc.data() : doc;
              const docId = doc.id || '';
              
              console.log('📝 Processing comment:', {
                docId,
                dataId: data.id,
                userName: data.userName,
                text: data.text,
                hasDataFunction: typeof doc.data === 'function'
              });
              
              // Spread data first, THEN override id to ensure correct id is used
              return {
                ...data,
                id: docId, // Override any id field in data with the actual document ID
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
              };
            });
            
            console.log('✅ Processed comments for subscription:', comments.map(c => ({ id: c.id, userName: c.userName, text: c.text })));
            callback(comments);
          },
          (error) => {
            console.error('Error in comments subscription:', error?.message || error);
            callback([]);
          }
        );
      }
    } catch (error) {
      console.error('Error setting up comments subscription:', error);
      throw error;
    }
  }

  /**
   * Add or remove a reaction to a comment
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {string} commentId - Comment ID
   * @param {string} userId - User ID
   * @param {string} emoji - Emoji to react with
   * @param {boolean} isAdding - Whether adding or removing reaction
   * @returns {Promise<void>}
   */
  async toggleReaction(projectId, newsId, commentId, userId, emoji, isAdding) {
    try {
      const commentDoc = await firestoreService.getDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`);
      
      if (!commentDoc || !commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      const commentData = commentDoc.data();
      const reactions = commentData.reactions || {};
      
      if (!reactions[emoji]) {
        reactions[emoji] = { count: 0, users: [] };
      }
      
      if (isAdding) {
        if (!reactions[emoji].users.includes(userId)) {
          reactions[emoji].users.push(userId);
          reactions[emoji].count += 1;
        }
      } else {
        const userIndex = reactions[emoji].users.indexOf(userId);
        if (userIndex > -1) {
          reactions[emoji].users.splice(userIndex, 1);
          reactions[emoji].count -= 1;
          
          // Remove emoji if no reactions left
          if (reactions[emoji].count <= 0) {
            delete reactions[emoji];
          }
        }
      }
      
      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`, {
        reactions,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  }

  /**
   * Delete a comment (admin only)
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {string} commentId - Comment ID
   * @param {string} adminId - Admin ID
   * @param {string} reason - Deletion reason
   * @returns {Promise<void>}
   */
  async deleteComment(projectId, newsId, commentId, adminId, reason = 'Violation of community guidelines') {
    try {
      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`, {
        isDeleted: true,
        deletedBy: adminId,
        deletedAt: new Date(),
        deletionReason: reason,
        updatedAt: new Date()
      });
      
      // Update news item comment count
      await this.updateNewsCommentCount(projectId, newsId, -1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Restore a deleted comment (admin only)
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  async restoreComment(projectId, newsId, commentId) {
    try {
      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`, {
        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
        deletionReason: null,
        updatedAt: new Date()
      });
      
      // Update news item comment count
      await this.updateNewsCommentCount(projectId, newsId, 1);
    } catch (error) {
      console.error('Error restoring comment:', error);
      throw error;
    }
  }

  /**
   * Update news item comment count
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @param {number} change - Change in count (1 or -1)
   * @returns {Promise<void>}
   */
  async updateNewsCommentCount(projectId, newsId, change) {
    try {
      // Get current comment count first
      const newsDoc = await firestoreService.getDoc(`projects/${projectId}/news/${newsId}`);
      if (newsDoc && newsDoc.exists()) {
        const currentCount = newsDoc.data().commentCount || 0;
        await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}`, {
          commentCount: currentCount + change,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating comment count:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get comment statistics for admin
   * @param {string} projectId - Project ID
   * @param {string} newsId - News item ID
   * @returns {Promise<Object>} - Comment statistics
   */
  async getCommentStats(projectId, newsId) {
    try {
      const comments = await this.getComments(projectId, newsId);
      
      const stats = {
        total: comments.length,
        active: comments.filter(c => !c.isDeleted).length,
        deleted: comments.filter(c => c.isDeleted).length,
        withReactions: comments.filter(c => Object.keys(c.reactions || {}).length > 0).length,
        totalReactions: comments.reduce((sum, c) => {
          return sum + Object.values(c.reactions || {}).reduce((emojiSum, emoji) => emojiSum + emoji.count, 0);
        }, 0)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching comment stats:', error);
      throw error;
    }
  }

  /**
   * Add a reaction to a news item (not a comment)
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @param {string} emoji - The emoji reaction
   * @returns {Promise<void>}
   */
  async addNewsReaction(projectId, newsId, emoji) {
    try {
      console.log('➕ addNewsReaction called:', { projectId, newsId, emoji });
      
      // Get current user from optimizedAuthService
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const reactionData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        emoji,
        timestamp: new Date(),
        createdAt: new Date()
      };
      
      console.log('💾 Writing reaction data:', reactionData);
      
      const result = await firestoreService.addDoc(`projects/${projectId}/news/${newsId}/reactions`, reactionData);
      
      console.log('✅ Reaction added successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error adding news reaction:', error);
      throw error;
    }
  }

  /**
   * Remove a reaction from a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @param {string} emoji - The emoji reaction to remove
   * @returns {Promise<void>}
   */
  async removeNewsReaction(projectId, newsId, emoji) {
    try {
      console.log('🗑️ removeNewsReaction called:', { projectId, newsId, emoji });
      
      // Get current user from optimizedAuthService
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) throw new Error('User not authenticated');
      
      console.log('👤 Current user:', user.uid);
      
      // Find and delete the user's reaction with this emoji - SKIP CACHE for real-time accuracy
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
        filters: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'emoji', operator: '==', value: emoji }
        ],
        skipCache: true // CRITICAL: Must skip cache to avoid deleting already-deleted reactions
      });
      
      const reactions = result.docs || [];
      
      console.log('📄 Found reactions to delete:', reactions.length, reactions.map(r => ({ id: r.id, userId: r.data?.()?.userId })));
      
      if (reactions.length === 0) {
        console.log('⚠️ No reaction found to delete, might have been already deleted');
        return; // Already deleted, no error
      }
      
      const deletePromises = reactions.map(async (reaction) => {
        try {
          console.log('🗑️ Deleting reaction document:', reaction.id);
          const reactionPath = `projects/${projectId}/news/${newsId}/reactions/${reaction.id}`;
          console.log('🗑️ Delete path:', reactionPath);
          await firestoreService.deleteDoc(reactionPath);
          console.log('✅ Reaction deleted successfully:', reaction.id);
        } catch (deleteError) {
          console.error('❌ Delete error for reaction:', reaction.id, deleteError);
          // If document doesn't exist or permission denied, that's fine (already deleted or rules issue)
          if (deleteError.code === 'not-found' || deleteError.code === 'permission-denied') {
            console.log('ℹ️ Reaction delete issue (might be already deleted or rules delay):', reaction.id, deleteError.code);
            return;
          }
          throw deleteError;
        }
      });
      
      await Promise.all(deletePromises);
      
      console.log('✅ All reactions removed successfully');
    } catch (error) {
      console.error('❌ Error removing news reaction:', error?.message || error);
      throw error;
    }
  }

  /**
   * Get all reactions for a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @returns {Promise<Array>} Array of reactions
   */
  async getNewsReactions(projectId, newsId, skipCache = false) {
    try {
      console.log('🔍 getNewsReactions called:', { projectId, newsId, skipCache });
      
      // Use DynamoDB service first
      try {
        const { getReactionsByNews } = await import('./dynamoDBNewsReactionsService');
        const reactions = await getReactionsByNews(projectId, newsId, { limit: 100 });
        
        console.log('✅ getNewsReactions result from DynamoDB:', { count: reactions.length });
        return reactions;
      } catch (dynamoError) {
        console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError);
        
        // Fallback to Firestore
        const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          timeoutMs: 5000, // 5 second timeout for iOS
          skipCache: skipCache // Skip cache when explicitly requested
        });
        
        console.log('✅ getNewsReactions result from Firestore:', { docsCount: result.docs?.length || 0 });
        
        const reactions = result.docs || [];
        
        // Extract data properly from Firestore documents
        const mappedReactions = reactions.map(reaction => {
          // Try to get data - it might be a function or already extracted
          const data = typeof reaction.data === 'function' ? reaction.data() : reaction;
          
          console.log('📄 Reaction document:', { 
            id: reaction.id, 
            hasDataFunction: typeof reaction.data === 'function',
            emoji: data.emoji,
            userId: data.userId
          });
          
          return {
            id: reaction.id,
            ...data
          };
        });
        
        console.log('📊 Mapped reactions:', mappedReactions);
        return mappedReactions;
      }
    } catch (error) {
      console.error('❌ Error fetching news reactions:', error?.message || JSON.stringify(error) || error);
      // Return empty array instead of throwing to prevent UI from breaking
      return [];
    }
  }

  /**
   * Subscribe to news reactions in real-time
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @param {Function} callback - Callback function to handle reactions
   * @returns {Function} Unsubscribe function
   */
  async subscribeToNewsReactions(projectId, newsId, callback) {
    try {
      console.log('🔔 subscribeToNewsReactions called:', { projectId, newsId });
      
      // Always use polling on iOS since Web SDK hangs in WKWebView
      const { Capacitor } = await import('@capacitor/core');
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
      
      console.log('🔔 Platform check:', { isIOS, platform: Capacitor.getPlatform() });
      
      if (isIOS) {
        console.log('📱 Using polling for iOS...');
        // Use polling for iOS since collection listeners hang in WKWebView
        let intervalId;
        
        const pollReactions = async () => {
          try {
            console.log('🔄 Polling reactions...');
            const reactions = await this.getNewsReactions(projectId, newsId);
            console.log('🔄 Poll result:', reactions.length, 'reactions');
            callback(reactions);
          } catch (error) {
            console.error('❌ Error polling reactions:', error?.message || JSON.stringify(error) || error);
            callback([]); // Call with empty array to prevent hanging
          }
        };
        
        // Initial fetch
        console.log('🔄 Initial poll...');
        await pollReactions();
        console.log('✅ Initial poll complete');
        
        // Poll every 3 seconds for updates
        intervalId = setInterval(pollReactions, 3000);
        console.log('✅ Polling interval set up');
        
        // Return unsubscribe function
        return () => {
          console.log('🛑 Unsubscribing from reactions polling');
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      } else {
        console.log('🌐 Using real-time listener for web...');
        // Use real-time listeners for web
        return firestoreService.subscribeToQuery(
          `projects/${projectId}/news/${newsId}/reactions`,
          { orderByField: 'createdAt', orderDirection: 'desc' },
          (snapshot) => {
            const reactions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log('🔔 Subscription update:', reactions.length, 'reactions');
            callback(reactions);
          },
          (error) => {
            console.error('❌ Error in reactions subscription:', error?.message || error);
            callback([]);
          }
        );
      }
    } catch (error) {
      console.error('❌ Error setting up subscription:', error);
      // Return a no-op unsubscribe function to prevent crashes
      return () => {};
    }
  }

  /**
   * Toggle a reaction on a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @param {string} emoji - The emoji reaction
   * @returns {Promise<void>}
   */
  async toggleNewsReaction(projectId, newsId, emoji) {
    try {
      console.log('🎯 toggleNewsReaction called:', { projectId, newsId, emoji });
      
      // Get current user from optimizedAuthService
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) throw new Error('User not authenticated');
      
      console.log('👤 User:', user.uid);
      
      // Check if user already has this reaction - SKIP CACHE to avoid stale data
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
        filters: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'emoji', operator: '==', value: emoji }
        ],
        skipCache: true // CRITICAL: Must skip cache to get real-time state
      });
      
      const reactions = result.docs || [];
      
      console.log('📊 Existing reactions found:', reactions.length);
      
      if (reactions.length === 0) {
        // Add reaction
        console.log('➕ No existing reaction, adding new one');
        await this.addNewsReaction(projectId, newsId, emoji);
      } else {
        // Remove reaction
        console.log('🗑️ Reaction exists, removing it');
        await this.removeNewsReaction(projectId, newsId, emoji);
      }
      
      console.log('✅ toggleNewsReaction completed');
    } catch (error) {
      console.error('❌ Error toggling news reaction:', error?.message || error);
      throw error;
    }
  }

  /**
   * Delete a comment and all its replies (cascade delete)
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @param {string} commentId - The comment ID to delete
   * @returns {Promise<void>}
   */
  async deleteCommentWithReplies(projectId, newsId, commentId) {
    try {
      // Get all comments to find replies
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/comments`);
      const docs = result.docs || [];
      
      // Extract data from Firestore documents
      const allComments = docs.map(doc => {
        const data = typeof doc.data === 'function' ? doc.data() : doc;
        return {
          id: doc.id || data.id,
          ...data
        };
      });
      
      // Find all replies to this comment (recursively)
      const repliesToDelete = [];
      const findReplies = (parentId) => {
        const replies = allComments.filter(comment => comment.parentCommentId === parentId);
        replies.forEach(reply => {
          repliesToDelete.push(reply.id);
          findReplies(reply.id); // Recursively find replies to replies
        });
      };
      
      findReplies(commentId);
      
      // Delete the main comment
      await firestoreService.deleteDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`);
      
      // Delete all replies
      const deletePromises = repliesToDelete.map(replyId => 
        firestoreService.deleteDoc(`projects/${projectId}/news/${newsId}/comments/${replyId}`)
      );
      
      await Promise.all(deletePromises);
      
      console.log(`Deleted comment ${commentId} and ${repliesToDelete.length} replies`);
    } catch (error) {
      console.error('Error deleting comment with replies:', error);
      throw error;
    }
  }
}

export default new NewsCommentsService();
