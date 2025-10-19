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
        
        const comment = {
          id: '', // Will be set after creation
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
      };

      const commentId = await firestoreService.addDoc(`projects/${projectId}/news/${newsId}/comments`, comment);
      
      // Update the comment with its ID
      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}/comments/${commentId}`, { id: commentId });
      
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
        limit: options.limit
      };
      
      const result = await firestoreService.getDocs(
        `projects/${projectId}/news/${newsId}/comments`,
        queryOptions
      );
      
      const comments = result.docs || [];
      
      return comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt?.toDate?.() || comment.createdAt,
        
        updatedAt: comment.updatedAt?.toDate?.() || comment.updatedAt,
        deletedAt: comment.deletedAt?.toDate?.() || comment.deletedAt,
      }));
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
            const comments = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
              };
            });
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
      
      await firestoreService.addDoc(`projects/${projectId}/news/${newsId}/reactions`, reactionData);
    } catch (error) {
      console.error('Error adding news reaction:', error);
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
      // Get current user from optimizedAuthService
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Find and delete the user's reaction with this emoji
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
        filters: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'emoji', operator: '==', value: emoji }
        ]
      });
      
      const reactions = result.docs || [];
      
      const deletePromises = reactions.map(reaction => 
        firestoreService.deleteDoc(`projects/${projectId}/news/${newsId}/reactions/${reaction.id}`)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing news reaction:', error?.message || error);
      throw error;
    }
  }

  /**
   * Get all reactions for a news item
   * @param {string} projectId - Project ID
   * @param {string} newsId - The news item ID
   * @returns {Promise<Array>} Array of reactions
   */
  async getNewsReactions(projectId, newsId) {
    try {
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
        orderBy: [{ field: 'createdAt', direction: 'desc' }]
      });
      
      const reactions = result.docs || [];
      
      return reactions.map(reaction => ({
        id: reaction.id,
        ...reaction
      }));
    } catch (error) {
      console.error('Error fetching news reactions:', error?.message || JSON.stringify(error) || error);
      throw error;
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
      // Check if iOS to use polling instead of real-time listeners
      const { Capacitor } = await import('@capacitor/core');
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
      
      if (isIOS) {
        // Use polling for iOS since collection listeners don't work reliably
        let intervalId;
        
        const pollReactions = async () => {
          try {
            const reactions = await this.getNewsReactions(projectId, newsId);
            callback(reactions);
          } catch (error) {
            console.error('Error polling reactions:', error?.message || JSON.stringify(error) || error);
          }
        };
        
        // Initial fetch
        await pollReactions();
        
        // Poll every 5 seconds
        intervalId = setInterval(pollReactions, 5000);
        
        // Return unsubscribe function
        return () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      } else {
        // Use real-time listeners for web
        return firestoreService.subscribeToQuery(
          `projects/${projectId}/news/${newsId}/reactions`,
          { orderByField: 'createdAt', orderDirection: 'desc' },
          (snapshot) => {
            const reactions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            callback(reactions);
          },
          (error) => {
            console.error('Error in reactions subscription:', error?.message || error);
            callback([]);
          }
        );
      }
    } catch (error) {
      console.error('Error subscribing to news reactions:', error);
      throw error;
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
      // Get current user from optimizedAuthService
      const user = await optimizedAuthService.getCurrentUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Check if user already has this reaction
      const result = await firestoreService.getDocs(`projects/${projectId}/news/${newsId}/reactions`, {
        filters: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'emoji', operator: '==', value: emoji }
        ]
      });
      
      const reactions = result.docs || [];
      
      if (reactions.length === 0) {
        // Add reaction
        await this.addNewsReaction(projectId, newsId, emoji);
      } else {
        // Remove reaction
        await this.removeNewsReaction(projectId, newsId, emoji);
      }
    } catch (error) {
      console.error('Error toggling news reaction:', error?.message || error);
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
      const allComments = result.docs || [];
      
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
