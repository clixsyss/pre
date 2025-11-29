<template>
  <div class="news-interactions">
    <!-- Reaction Summary (like Facebook) -->
    <div v-if="interactionsEnabled && totalReactions > 0" class="reaction-summary">
      <div class="reaction-emojis">
        <span 
          v-for="(reaction, emoji) in reactionSummary" 
          :key="emoji"
          class="reaction-emoji"
        >
          {{ emoji === 'like' ? '👍' : emoji === 'love' ? '❤️' : emoji === 'laugh' ? '😂' : emoji === 'sad' ? '😢' : '' }}
        </span>
      </div>
      <span class="reaction-count">{{ totalReactions }}</span>
    </div>

    <!-- Action Buttons (like Facebook) -->
    <div v-if="interactionsEnabled" class="action-buttons">
      <button 
        @click="toggleReaction('like')"
        class="action-btn"
        :class="{ active: userReactions.includes('like'), disabled: isTogglingReaction }"
        :disabled="isTogglingReaction"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10V19H4C3.46957 19 2.96086 18.7893 2.58579 18.4142C2.21071 18.0391 2 17.5304 2 17V12C2 11.4696 2.21071 10.9609 2.58579 10.5858C2.96086 10.2107 3.46957 10 4 10H7ZM7 10V5C7 4.20435 7.31607 3.44129 7.87868 2.87868C8.44129 2.31607 9.20435 2 10 2C10.7956 2 11.5587 2.31607 12.1213 2.87868C12.6839 3.44129 13 4.20435 13 5V8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V17C22 17.5304 21.7893 18.0391 21.4142 18.4142C21.0391 18.7893 20.5304 19 20 19H9L7 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Like</span>
      </button>
      
      <button 
        @click="toggleComments"
        class="action-btn"
        :class="{ active: showComments && activeComments.length > 0 }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Comments</span>
        <span v-if="activeComments.length > 0" class="comment-count-badge">({{ activeComments.length }})</span>
      </button>
      
    </div>

    <!-- Comment Input (only visible if interactions enabled) -->
    <div v-if="interactionsEnabled" class="comment-input-section">
      <!-- Reply indicator -->
      <div v-if="replyingTo" class="replying-to-indicator">
        <span class="replying-text">Replying to {{ getReplyingToName() }}</span>
        <button @click="cancelReply" class="cancel-reply-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="comment-input-wrapper">
        <textarea
          v-model="newComment"
          placeholder="Write a comment..."
          class="comment-input"
          rows="1"
          @keydown.enter.exact.prevent="handleAddComment"
          @keydown.enter.shift.exact="newComment += '\n'"
        ></textarea>
        <button 
          @click="handleAddComment"
          :disabled="!newComment.trim() || loading"
          class="send-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Comments List (collapsible) -->
    <div v-if="interactionsEnabled" class="comments-section">
      <!-- Show loading state while fetching initial comments -->
      <div v-if="loading && activeComments.length === 0" class="comments-loading">
        <div class="loading-spinner"></div>
        <span class="loading-text">Loading comments...</span>
      </div>
      
      <!-- Show comments header and list when loaded -->
      <div v-else-if="activeComments.length > 0">
        <div class="comments-header">
          <span class="comments-count">{{ activeComments.length }} {{ activeComments.length === 1 ? 'comment' : 'comments' }}</span>
          <div class="sort-dropdown">
            <button 
              @click="toggleSortDropdown" 
              class="sort-btn"
            >
              {{ currentSortOption }}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="showSortDropdown" class="sort-options">
              <button @click="setSortOption('Most relevant')" class="sort-option">Most relevant</button>
              <button @click="setSortOption('Latest')" class="sort-option">Latest</button>
              <button @click="setSortOption('Oldest')" class="sort-option">Oldest</button>
              <button @click="setSortOption('Most liked')" class="sort-option">Most liked</button>
            </div>
          </div>
        </div>

        <div v-if="showComments" class="comments-list">
          <CommentItem
            v-for="comment in groupedComments"
            :key="comment.id"
            :comment="comment"
            :news-id="newsId"
            @reply="handleReply"
            @react="handleReaction"
            @delete="handleDelete"
            @delete-with-replies="handleDeleteWithReplies"
          />
        </div>
      </div>
      
      <!-- Show empty state when no comments and not loading -->
      <div v-else-if="!loading" class="no-comments-message">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useNewsCommentsStore } from '../stores/newsCommentsStore';
import { useProjectStore } from '../stores/projectStore';
import CommentItem from './CommentItem.vue';

export default {
  name: 'NewsComments',
  components: {
    CommentItem
  },
  props: {
    newsId: {
      type: String,
      required: true
    },
    interactionsEnabled: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const commentsStore = useNewsCommentsStore();
    
    // Debug: Check store contents
    console.log('Comments store:', commentsStore);
    console.log('toggleNewsReaction function:', commentsStore.toggleNewsReaction);
    
     // Local state
     const showComments = ref(true); // Show comments by default
     const newComment = ref('');
     const replyingTo = ref(null);
     const showSortDropdown = ref(false);
     const currentSortOption = ref('Most relevant');
     const isTogglingReaction = ref(false); // Prevent rapid clicks
    
// Available reaction types
const availableReactions = ['like', 'love', 'laugh', 'sad'];
    
    // Computed
    const activeComments = computed(() => {
      const comments = commentsStore.getActiveComments(props.newsId);
      console.log('Active comments for newsId', props.newsId, ':', comments);
      return comments;
    });
    const deletedComments = computed(() => commentsStore.getDeletedComments(props.newsId));
    const loading = computed(() => commentsStore.loading);

     // Group comments by parent-child relationships
     const groupedComments = computed(() => {
       const comments = activeComments.value;
       const commentMap = new Map();
       const rootComments = [];

       // First pass: create a map of all comments with deep cloned reactions
       comments.forEach(comment => {
         commentMap.set(comment.id, { 
           ...comment, 
           replies: [],
           // Ensure reactions are properly cloned for reactivity
           reactions: comment.reactions ? JSON.parse(JSON.stringify(comment.reactions)) : {}
         });
       });

       // Second pass: build the tree structure
       comments.forEach(comment => {
         if (comment.parentCommentId) {
           // This is a reply, add it to its parent's replies
           const parent = commentMap.get(comment.parentCommentId);
           if (parent) {
             parent.replies.push(commentMap.get(comment.id));
           }
         } else {
           // This is a root comment
           rootComments.push(commentMap.get(comment.id));
         }
       });

       // Apply sorting based on current sort option
       const sortComments = (commentList) => {
         switch (currentSortOption.value) {
           case 'Most relevant':
             // Sort by total interactions (reactions + replies)
             return commentList.sort((a, b) => {
               const aInteractions = (a.reactions ? Object.keys(a.reactions).length : 0) + (a.replies ? a.replies.length : 0);
               const bInteractions = (b.reactions ? Object.keys(b.reactions).length : 0) + (b.replies ? b.replies.length : 0);
               return bInteractions - aInteractions;
             });
           case 'Latest':
             return commentList.sort((a, b) => {
               const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
               const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
               return dateB - dateA;
             });
           case 'Oldest':
             return commentList.sort((a, b) => {
               const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
               const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
               return dateA - dateB;
             });
           case 'Most liked':
             return commentList.sort((a, b) => {
               const aLikes = a.reactions ? Object.keys(a.reactions).length : 0;
               const bLikes = b.reactions ? Object.keys(b.reactions).length : 0;
               return bLikes - aLikes;
             });
           default:
             return commentList;
         }
       };

       // Sort root comments
       const sortedRootComments = sortComments(rootComments);

       // Sort replies by creation date (oldest first) for all sorting options
       sortedRootComments.forEach(comment => {
         if (comment.replies && comment.replies.length > 0) {
           comment.replies.sort((a, b) => {
             const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
             const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
             return dateA - dateB;
           });
         }
       });

       console.log('Grouped comments for newsId', props.newsId, ':', sortedRootComments);
       return sortedRootComments;
     });
    
    // Get news reactions from store - access the reactive refs directly for proper reactivity
    const newsReactions = computed(() => {
      // Direct access to the reactive ref to establish proper dependency tracking
      return commentsStore.newsReactions[props.newsId] || {};
    });
    const userReactions = computed(() => {
      // Direct access to the reactive ref to establish proper dependency tracking
      return commentsStore.userNewsReactions[props.newsId] || [];
    });
    
    // Reaction summary for display
    const reactionSummary = computed(() => {
      const summary = {};
      Object.entries(newsReactions.value).forEach(([emoji, reaction]) => {
        if (reaction.count > 0) {
          summary[emoji] = { count: reaction.count, users: reaction.users };
        }
      });
      return summary;
    });
    
    const totalReactions = computed(() => {
      return Object.values(newsReactions.value).reduce((sum, reaction) => sum + reaction.count, 0);
    });
    
    // Remove hasComments since input is always visible
    
    // Methods
    const toggleComments = () => {
      showComments.value = !showComments.value;
      // Don't unsubscribe when hiding - just toggle visibility
      // Subscription is managed in lifecycle hooks
    };
    
    const toggleReaction = async (reactionType) => {
      // Prevent multiple rapid clicks
      if (isTogglingReaction.value) {
        console.log('⏸️ Already toggling reaction, ignoring click');
        return;
      }
      
      try {
        isTogglingReaction.value = true;
        
        // Check if the function exists
        if (typeof commentsStore.toggleNewsReaction !== 'function') {
          console.error('toggleNewsReaction function not found in store');
          return;
        }
        
        console.log('👆 User clicked reaction button:', {
          newsId: props.newsId,
          reactionType,
          currentUserReactions: userReactions.value
        });
        
        // If user already has this reaction, remove it
        if (userReactions.value.includes(reactionType)) {
          console.log('🗑️ Removing existing reaction:', reactionType);
          await commentsStore.toggleNewsReaction(props.newsId, reactionType);
        } else {
          // Remove any existing reaction first (Facebook-style: only one reaction per user)
          if (userReactions.value.length > 0) {
            const currentReaction = userReactions.value[0];
            console.log('🔄 Switching from', currentReaction, 'to', reactionType);
            await commentsStore.toggleNewsReaction(props.newsId, currentReaction);
            // Wait a bit for the first write to complete
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Add the new reaction
          console.log('➕ Adding new reaction:', reactionType);
          await commentsStore.toggleNewsReaction(props.newsId, reactionType);
        }
        
        console.log('✅ Reaction toggle completed successfully');
      } catch (error) {
        console.error('❌ Error toggling reaction:', error);
        // You could show a user-friendly error message here
        alert('Failed to update reaction. Please try again.');
      } finally {
        // Always re-enable the button after 1 second
        setTimeout(() => {
          isTogglingReaction.value = false;
        }, 1000);
      }
    };
    
    const handleAddComment = async () => {
      if (!newComment.value.trim()) return;
      
      try {
        await commentsStore.addComment(props.newsId, newComment.value.trim(), replyingTo.value);
        newComment.value = '';
        replyingTo.value = null;
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };
    
    const handleReply = (commentId) => {
      console.log('Handling reply to comment:', commentId);
      
      // Find the comment to get the user's name
      const comment = activeComments.value.find(c => c.id === commentId);
      const userName = comment?.userName || 'User';
      
      replyingTo.value = commentId;
      newComment.value = `@${userName} `;
      
      // Focus on textarea
      setTimeout(() => {
        const textarea = document.querySelector('.comment-input');
        if (textarea) textarea.focus();
      }, 100);
    };
    
    const getReplyingToName = () => {
      if (!replyingTo.value) return '';
      const comment = activeComments.value.find(c => c.id === replyingTo.value);
      return comment?.userName || 'User';
    };
    
    const cancelReply = () => {
      replyingTo.value = null;
      // Remove the @mention from the comment text
      newComment.value = '';
    };
    
    const handleReaction = async (commentId, emoji) => {
      console.log('Handling reaction:', { commentId, emoji, newsId: props.newsId });
      
      try {
        await commentsStore.toggleReaction(props.newsId, commentId, emoji);
        // Refresh comments to get updated reaction counts - SKIP CACHE for immediate update
        await commentsStore.fetchComments(props.newsId, true);
      } catch (error) {
        console.error('Error handling comment reaction:', error);
      }
    };
    
     const handleDelete = (commentId) => {
       // This would typically be admin-only
       if (confirm('Are you sure you want to delete this comment?')) {
         commentsStore.deleteComment(props.newsId, commentId);
       }
     };

     const handleDeleteWithReplies = async (commentId) => {
       console.log('Handling delete with replies for comment:', commentId);
       
       // Get projectId from the project store
       const projectStore = useProjectStore();
       const projectId = projectStore.selectedProject?.id;
       
       if (!projectId) {
         console.error('No project selected');
         alert('Unable to delete comment: No project selected');
         return;
       }
       
       if (confirm('Are you sure you want to delete this comment? This will also delete all replies to this comment.')) {
         try {
           await commentsStore.deleteCommentWithReplies(projectId, props.newsId, commentId);
           // Refresh comments after deletion
           await commentsStore.fetchComments(props.newsId);
         } catch (error) {
           console.error('Error deleting comment:', error);
           alert('Failed to delete comment. Please try again.');
         }
       }
     };

     const toggleSortDropdown = () => {
       showSortDropdown.value = !showSortDropdown.value;
     };

     const setSortOption = (option) => {
       currentSortOption.value = option;
       showSortDropdown.value = false;
       // Apply sorting logic here if needed
     };
    
// Load news reactions
const loadNewsReactions = async () => {
  try {
    console.log('📊 Loading news reactions for newsId:', props.newsId);
    
    // Fetch initial reactions with timeout protection
    const fetchPromise = commentsStore.fetchNewsReactions(props.newsId);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => {
      console.warn('⏰ fetchNewsReactions timed out after 5s, continuing anyway...');
      resolve();
    }, 5000));
    
    await Promise.race([fetchPromise, timeoutPromise]);
    console.log('📊 Initial fetch complete (or timed out), subscribing to reactions...');
    
    // Set up subscription - don't await to avoid hanging
    commentsStore.subscribeToNewsReactions(props.newsId).then(() => {
      console.log('📊 Subscription set up successfully');
    }).catch((error) => {
      console.error('❌ Error setting up subscription:', error);
    });
    
    console.log('📊 Current reactions:', commentsStore.newsReactions[props.newsId]);
    console.log('📊 Current user reactions:', commentsStore.userNewsReactions[props.newsId]);
  } catch (error) {
    console.error('❌ Error loading news reactions:', error);
  }
};
    
    // Lifecycle
    onMounted(() => {
      console.log('NewsComments mounted, fetching comments for newsId:', props.newsId);
      // Skip cache on initial load to ensure fresh data
      commentsStore.fetchComments(props.newsId, true);
      commentsStore.subscribeToComments(props.newsId); // Subscribe to get real-time updates
      loadNewsReactions();
    });
    
    onUnmounted(() => {
      commentsStore.unsubscribeFromComments(props.newsId);
      commentsStore.unsubscribeFromNewsReactions(props.newsId);
    });
    
    // Watch for newsId changes
    watch(() => props.newsId, (newId, oldId) => {
      if (newId) {
        // Unsubscribe from old newsId if it changed
        if (oldId && oldId !== newId) {
          commentsStore.unsubscribeFromComments(oldId);
          commentsStore.unsubscribeFromNewsReactions(oldId);
        }
        
        // Fetch and subscribe to new newsId (skip cache to ensure fresh data)
        commentsStore.fetchComments(newId, true);
        commentsStore.subscribeToComments(newId);
        loadNewsReactions();
      }
    });
    
    // Debug: Watch for reaction changes
    watch(newsReactions, (newVal) => {
      console.log('🔄 newsReactions changed:', newVal);
    }, { deep: true });
    
    watch(userReactions, (newVal) => {
      console.log('🔄 userReactions changed:', newVal);
    }, { deep: true });
    
     return {
       showComments,
       newComment,
       replyingTo,
       showSortDropdown,
       currentSortOption,
       availableReactions,
       activeComments,
       groupedComments,
       deletedComments,
       loading,
       newsReactions,
       userReactions,
       reactionSummary,
       totalReactions,
       isTogglingReaction,
       toggleComments,
       toggleReaction,
       handleAddComment,
       handleReply,
       getReplyingToName,
       cancelReply,
       handleReaction,
       handleDelete,
       handleDeleteWithReplies,
       toggleSortDropdown,
       setSortOption
     };
  }
};
</script>

<style scoped>
.news-interactions {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 6px 12px 0 12px;
}

/* Reaction Summary - Compact */
.reaction-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 6px;
}

.reaction-emojis {
  display: flex;
  align-items: center;
  gap: 3px;
}

.reaction-emoji {
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .reaction-emoji:hover {
  transform: scale(1.2);
} */

.reaction-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Action Buttons - Compact */
.action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 3px 0;
  border-bottom: 1px solid #e2e8f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  flex: 1;
  justify-content: center;
}

/* Mobile app - hover effects disabled */
/* .action-btn:hover {
  background-color: #f8fafc;
  color: #AF1E23;
} */

.action-btn.active {
  color: #AF1E23;
  background-color: #fef2f2;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.comment-count-badge {
  font-size: 12px;
  color: inherit;
  opacity: 0.8;
  margin-left: 2px;
}

.action-btn svg {
  transition: transform 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .action-btn:hover svg {
  transform: scale(1.1);
} */

/* Comment Input - Compact */
.comment-input-section {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.replying-to-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 12px;
}

.replying-text {
  color: #991b1b;
  font-weight: 500;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.cancel-reply-btn:hover {
  background: #fee2e2;
}

.comment-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 6px 10px;
  transition: all 0.2s ease;
}

.comment-input-wrapper:focus-within {
  background: #ffffff;
  box-shadow: 0 0 0 1px #AF1E23;
}

.comment-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  min-height: 18px;
  max-height: 80px;
  font-family: inherit;
  color: #1e293b;
}

.comment-input::placeholder {
  color: #64748b;
}

.send-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.send-btn:not(:disabled) {
  opacity: 1;
}

/* Mobile app - hover effects disabled */
/* .send-btn:hover:not(:disabled) {
  background: #991b1b;
  transform: scale(1.05);
} */

.send-btn:disabled {
  cursor: not-allowed;
}

/* Comments Section - Compact */
.comments-section {
  background: #ffffff;
}

/* Loading State */
.comments-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Empty State */
.no-comments-message {
  text-align: center;
  padding: 24px 16px;
  color: #94a3b8;
  font-size: 14px;
}

.no-comments-message p {
  margin: 0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 6px 0;
  border-bottom: 1px solid #e2e8f0;
}

.comments-count {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.sort-dropdown {
  position: relative;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #AF1E23;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .sort-btn:hover {
  background-color: #f8fafc;
} */

.sort-options {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
  margin-bottom: 4px;
}

.sort-option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .sort-option:hover {
  background-color: #f8fafc;
  color: #AF1E23;
} */

.comments-list {
  padding: 6px 0;
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-thread {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.replies-container {
  margin-left: 32px;
  padding-left: 10px;
  border-left: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Responsive design */
@media (max-width: 640px) {
  .news-interactions {
    padding: 8px 12px 0 12px;
  }
  
  .action-btn {
    font-size: 14px;
    padding: 6px 8px;
  }
  
  .comment-input-wrapper {
    padding: 6px 10px;
  }
  
  .comment-input {
    font-size: 13px;
  }
  
  .replies-container {
    margin-left: 24px;
  }
}
</style>
