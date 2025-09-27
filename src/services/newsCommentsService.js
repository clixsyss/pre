import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, limit, onSnapshot, where, increment } from 'firebase/firestore'
import { db } from '../boot/firebase'

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

      const commentsRef = collection(db, `projects/${projectId}/news/${newsId}/comments`);
      const docRef = await addDoc(commentsRef, comment);
      
      // Update the comment with its ID
      await updateDoc(docRef, { id: docRef.id });
      
      // Update news item comment count
      await this.updateNewsCommentCount(projectId, newsId, 1);
      
      return docRef.id;
      } catch (error) {
        console.error('❌ Error adding comment:', error);
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
      const commentsRef = collection(this.db, `projects/${projectId}/news/${newsId}/comments`);
      let q = query(commentsRef, orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      const comments = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
        });
      });
      
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
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
  subscribeToComments(projectId, newsId, callback) {
    try {
      const commentsRef = collection(this.db, `projects/${projectId}/news/${newsId}/comments`);
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const comments = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          comments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
          });
        });
        callback(comments);
      });
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
      const commentRef = doc(this.db, `projects/${projectId}/news/${newsId}/comments`, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
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
      
      await updateDoc(commentRef, {
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
      const commentRef = doc(this.db, `projects/${projectId}/news/${newsId}/comments`, commentId);
      
      await updateDoc(commentRef, {
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
      const commentRef = doc(this.db, `projects/${projectId}/news/${newsId}/comments`, commentId);
      
      await updateDoc(commentRef, {
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
      const newsRef = doc(this.db, `projects/${projectId}/news`, newsId);
      await updateDoc(newsRef, {
        commentCount: increment(change),
        updatedAt: new Date()
      });
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
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('User not authenticated');
      
      const reactionData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        emoji,
        timestamp: new Date(),
        createdAt: new Date()
      };
      
      await addDoc(collection(this.db, `projects/${projectId}/news/${newsId}/reactions`), reactionData);
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
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('User not authenticated');
      
      // Find and delete the user's reaction with this emoji
      const reactionsRef = collection(this.db, `projects/${projectId}/news/${newsId}/reactions`);
      const q = query(reactionsRef, where('userId', '==', user.uid), where('emoji', '==', emoji));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing news reaction:', error);
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
      const reactionsRef = collection(this.db, `projects/${projectId}/news/${newsId}/reactions`);
      const q = query(reactionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching news reactions:', error);
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
  subscribeToNewsReactions(projectId, newsId, callback) {
    try {
      const reactionsRef = collection(this.db, `projects/${projectId}/news/${newsId}/reactions`);
      const q = query(reactionsRef, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const reactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(reactions);
      });
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
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('User not authenticated');
      
      // Check if user already has this reaction
      const reactionsRef = collection(this.db, `projects/${projectId}/news/${newsId}/reactions`);
      const q = query(reactionsRef, where('userId', '==', user.uid), where('emoji', '==', emoji));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add reaction
        await this.addNewsReaction(projectId, newsId, emoji);
      } else {
        // Remove reaction
        await this.removeNewsReaction(projectId, newsId, emoji);
      }
    } catch (error) {
      console.error('Error toggling news reaction:', error);
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
      const commentsRef = collection(this.db, `projects/${projectId}/news/${newsId}/comments`);
      
      // Get all comments to find replies
      const allCommentsSnapshot = await getDocs(commentsRef);
      const allComments = allCommentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
      const commentDoc = doc(commentsRef, commentId);
      await deleteDoc(commentDoc);
      
      // Delete all replies
      const deletePromises = repliesToDelete.map(replyId => {
        const replyDoc = doc(commentsRef, replyId);
        return deleteDoc(replyDoc);
      });
      
      await Promise.all(deletePromises);
      
      console.log(`Deleted comment ${commentId} and ${repliesToDelete.length} replies`);
    } catch (error) {
      console.error('Error deleting comment with replies:', error);
      throw error;
    }
  }
}

export default new NewsCommentsService();
