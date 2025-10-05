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
        :class="{ active: userReactions.includes('like') }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10V19H4C3.46957 19 2.96086 18.7893 2.58579 18.4142C2.21071 18.0391 2 17.5304 2 17V12C2 11.4696 2.21071 10.9609 2.58579 10.5858C2.96086 10.2107 3.46957 10 4 10H7ZM7 10V5C7 4.20435 7.31607 3.44129 7.87868 2.87868C8.44129 2.31607 9.20435 2 10 2C10.7956 2 11.5587 2.31607 12.1213 2.87868C12.6839 3.44129 13 4.20435 13 5V8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V17C22 17.5304 21.7893 18.0391 21.4142 18.4142C21.0391 18.7893 20.5304 19 20 19H9L7 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Like</span>
      </button>
      
      <button 
        @click="toggleComments"
        class="action-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Comment</span>
      </button>
      
    </div>

    <!-- Comment Input (only visible if interactions enabled) -->
    <div v-if="interactionsEnabled" class="comment-input-section">
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
    <div v-if="interactionsEnabled && activeComments.length > 0" class="comments-section">
      <div class="comments-header">
        <span class="comments-count">{{ activeComments.length }} comments</span>
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
        <div v-for="comment in groupedComments" :key="comment.id" class="comment-thread">
          <CommentItem
            :comment="comment"
            :news-id="newsId"
            @reply="handleReply"
            @react="handleReaction"
            @delete="handleDelete"
            @delete-with-replies="handleDeleteWithReplies"
          />
          <!-- Render replies -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
            <CommentItem
              v-for="reply in comment.replies"
              :key="reply.id"
              :comment="reply"
              :news-id="newsId"
              :is-reply="true"
              @reply="handleReply"
              @react="handleReaction"
              @delete="handleDelete"
              @delete-with-replies="handleDeleteWithReplies"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useNewsCommentsStore } from '../stores/newsCommentsStore';
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
     const showComments = ref(false);
     const newComment = ref('');
     const replyingTo = ref(null);
     const showSortDropdown = ref(false);
     const currentSortOption = ref('Most relevant');
    
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

       // First pass: create a map of all comments
       comments.forEach(comment => {
         commentMap.set(comment.id, { ...comment, replies: [] });
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
    
    // Get news reactions from store
    const newsReactions = computed(() => commentsStore.getNewsReactions(props.newsId));
    const userReactions = computed(() => commentsStore.getUserNewsReactions(props.newsId));
    
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
      if (showComments.value) {
        commentsStore.subscribeToComments(props.newsId);
      } else {
        commentsStore.unsubscribeFromComments(props.newsId);
      }
    };
    
    const toggleReaction = async (reactionType) => {
      try {
        // Check if the function exists
        if (typeof commentsStore.toggleNewsReaction !== 'function') {
          console.error('toggleNewsReaction function not found in store');
          return;
        }
        
        // If user already has this reaction, remove it
        if (userReactions.value.includes(reactionType)) {
          await commentsStore.toggleNewsReaction(props.newsId, reactionType);
        } else {
          // Remove any existing reaction first (Facebook-style: only one reaction per user)
          if (userReactions.value.length > 0) {
            const currentReaction = userReactions.value[0];
            await commentsStore.toggleNewsReaction(props.newsId, currentReaction);
          }
          
          // Add the new reaction
          await commentsStore.toggleNewsReaction(props.newsId, reactionType);
        }
      } catch (error) {
        console.error('Error toggling reaction:', error);
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
      replyingTo.value = commentId;
      newComment.value = `@${commentId} `;
      // Focus on textarea
      setTimeout(() => {
        const textarea = document.querySelector('.comment-input');
        if (textarea) textarea.focus();
      }, 100);
    };
    
    const handleReaction = (commentId, emoji) => {
      console.log('Handling reaction:', { commentId, emoji, newsId: props.newsId });
      commentsStore.toggleReaction(props.newsId, commentId, emoji);
    };
    
     const handleDelete = (commentId) => {
       // This would typically be admin-only
       if (confirm('Are you sure you want to delete this comment?')) {
         commentsStore.deleteComment(props.newsId, commentId);
       }
     };

     const handleDeleteWithReplies = (commentId) => {
       console.log('Handling delete with replies for comment:', commentId);
       commentsStore.deleteCommentWithReplies(props.projectId, props.newsId, commentId);
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
    await commentsStore.fetchNewsReactions(props.newsId);
    commentsStore.subscribeToNewsReactions(props.newsId);
  } catch (error) {
    console.error('Error loading news reactions:', error);
  }
};
    
    // Lifecycle
    onMounted(() => {
      console.log('NewsComments mounted, fetching comments for newsId:', props.newsId);
      commentsStore.fetchComments(props.newsId);
      loadNewsReactions();
    });
    
    onUnmounted(() => {
      commentsStore.unsubscribeFromComments(props.newsId);
      commentsStore.unsubscribeFromNewsReactions(props.newsId);
    });
    
    // Watch for newsId changes
    watch(() => props.newsId, (newId) => {
      if (newId) {
        commentsStore.fetchComments(newId);
        loadNewsReactions();
        if (showComments.value) {
          commentsStore.subscribeToComments(newId);
        }
      }
    });
    
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
       toggleComments,
       toggleReaction,
       handleAddComment,
       handleReply,
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

.reaction-emoji:hover {
  transform: scale(1.2);
}

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

.action-btn:hover {
  background-color: #f8fafc;
  color: #AF1E23;
}

.action-btn.active {
  color: #AF1E23;
  background-color: #fef2f2;
}

.action-btn svg {
  transition: transform 0.2s ease;
}

.action-btn:hover svg {
  transform: scale(1.1);
}

/* Comment Input - Compact */
.comment-input-section {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
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

.send-btn:hover:not(:disabled) {
  background: #991b1b;
  transform: scale(1.05);
}

.send-btn:disabled {
  cursor: not-allowed;
}

/* Comments Section - Compact */
.comments-section {
  background: #ffffff;
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

.sort-btn:hover {
  background-color: #f8fafc;
}

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

.sort-option:hover {
  background-color: #f8fafc;
  color: #AF1E23;
}

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
