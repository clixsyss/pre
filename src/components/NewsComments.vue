<template>
  <div class="news-interactions">
    <!-- Modern Interactions Bar -->
    <div class="interactions-bar">
      <!-- Reaction Summary -->
      <div class="reaction-summary">
        <div v-if="totalReactions > 0" class="reaction-preview">
          <div class="reaction-emojis">
            <span 
              v-for="(reaction, emoji) in reactionSummary" 
              :key="emoji"
              class="reaction-emoji"
              :title="`${reaction.count} ${emoji}`"
            >
              {{ emoji === 'like' ? '👍' : emoji === 'love' ? '❤️' : emoji === 'laugh' ? '😂' : emoji === 'sad' ? '😢' : '' }}
            </span>
          </div>
          <span class="reaction-count">{{ totalReactions }}</span>
        </div>
        <div v-else class="no-reactions">
          <span>Be the first to react!</span>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="toggleReaction('like')"
          class="action-btn like-btn"
          :class="{ active: userReactions.length === 1 && userReactions.includes('like') }"
          title="Like"
        >
          <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10V19H4C3.46957 19 2.96086 18.7893 2.58579 18.4142C2.21071 18.0391 2 17.5304 2 17V12C2 11.4696 2.21071 10.9609 2.58579 10.5858C2.96086 10.2107 3.46957 10 4 10H7ZM7 10V5C7 4.20435 7.31607 3.44129 7.87868 2.87868C8.44129 2.31607 9.20435 2 10 2C10.7956 2 11.5587 2.31607 12.1213 2.87868C12.6839 3.44129 13 4.20435 13 5V8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V17C22 17.5304 21.7893 18.0391 21.4142 18.4142C21.0391 18.7893 20.5304 19 20 19H9L7 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="action-label">Like</span>
          <span class="action-count">{{ reactionSummary['like']?.count || 0 }}</span>
        </button>
        
        <button 
          @click="toggleReaction('love')"
          class="action-btn love-btn"
          :class="{ active: userReactions.length === 1 && userReactions.includes('love') }"
          title="Love"
        >
          <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="action-label">Love</span>
          <span class="action-count">{{ reactionSummary['love']?.count || 0 }}</span>
        </button>
        
        <button 
          @click="toggleReaction('laugh')"
          class="action-btn laugh-btn"
          :class="{ active: userReactions.length === 1 && userReactions.includes('laugh') }"
          title="Laugh"
        >
          <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 9H9.01M15 9H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="action-label">Laugh</span>
          <span class="action-count">{{ reactionSummary['laugh']?.count || 0 }}</span>
        </button>
        
        <button 
          @click="toggleReaction('sad')"
          class="action-btn sad-btn"
          :class="{ active: userReactions.length === 1 && userReactions.includes('sad') }"
          title="Cry"
        >
          <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 9H9.01M15 9H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9L8 8M15 9L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="action-label">Cry</span>
          <span class="action-count">{{ reactionSummary['sad']?.count || 0 }}</span>
        </button>
      </div>
    </div>

    <!-- Comment Input Section - Always Visible -->
    <div class="comment-input-section">
      <div class="comment-input-container">
        <div class="comment-input-wrapper">
          <textarea
            v-model="newComment"
            placeholder="Share your thoughts..."
            class="comment-input"
            rows="3"
            @keydown.enter.exact.prevent="handleAddComment"
            @keydown.enter.shift.exact="newComment += '\n'"
          ></textarea>
          <div class="comment-actions">
            <button 
              @click="handleAddComment"
              :disabled="!newComment.trim() || loading"
              class="send-btn"
              :class="{ disabled: !newComment.trim() || loading }"
            >
              <svg v-if="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments List Section - Collapsible -->
    <div v-if="activeComments.length > 0" class="comments-section">
      <div class="comments-header">
        <div class="comments-title-section">
          <svg class="comments-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h4 class="comments-title">Comments</h4>
          <span class="comments-count">{{ activeComments.length }}</span>
        </div>
        <button 
          @click="toggleComments" 
          class="toggle-btn"
          :class="{ active: showComments }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div v-if="showComments" class="comments-content">
        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="loading && activeComments.length === 0" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>

          <div v-else class="comments-container">
            <CommentItem
              v-for="comment in activeComments"
              :key="comment.id"
              :comment="comment"
              :news-id="newsId"
              @reply="handleReply"
              @react="handleReaction"
              @delete="handleDelete"
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
    const newsReactions = ref({});
    const userReactions = ref([]);
    
// Available reaction types
const availableReactions = ['like', 'love', 'laugh', 'sad'];
    
    // Computed
    const activeComments = computed(() => commentsStore.getActiveComments(props.newsId));
    const deletedComments = computed(() => commentsStore.getDeletedComments(props.newsId));
    const loading = computed(() => commentsStore.loading);
    
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
          userReactions.value = [];
          // Decrease count for this reaction
          if (newsReactions.value[reactionType]) {
            newsReactions.value[reactionType].count = Math.max(0, newsReactions.value[reactionType].count - 1);
          }
        } else {
          // Remove any existing reaction first
          if (userReactions.value.length > 0) {
            const currentReaction = userReactions.value[0];
            await commentsStore.toggleNewsReaction(props.newsId, currentReaction);
            // Decrease count for the previous reaction
            if (newsReactions.value[currentReaction]) {
              newsReactions.value[currentReaction].count = Math.max(0, newsReactions.value[currentReaction].count - 1);
            }
          }
          
          // Add the new reaction
          await commentsStore.toggleNewsReaction(props.newsId, reactionType);
          userReactions.value = [reactionType];
          
          // Increase count for the new reaction
          if (!newsReactions.value[reactionType]) {
            newsReactions.value[reactionType] = { count: 0, users: [] };
          }
          newsReactions.value[reactionType].count += 1;
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
      replyingTo.value = commentId;
      newComment.value = `@${commentId} `;
      // Focus on textarea
      setTimeout(() => {
        const textarea = document.querySelector('.comment-input');
        if (textarea) textarea.focus();
      }, 100);
    };
    
    const handleReaction = (commentId, emoji) => {
      commentsStore.toggleReaction(props.newsId, commentId, emoji);
    };
    
    const handleDelete = (commentId) => {
      // This would typically be admin-only
      if (confirm('Are you sure you want to delete this comment?')) {
        commentsStore.deleteComment(props.newsId, commentId);
      }
    };
    
// Load news reactions
const loadNewsReactions = async () => {
  try {
    // This would fetch reactions for the news item itself
    // For now, we'll simulate with empty state
    newsReactions.value = {
      'like': { count: 0, users: [] },
      'love': { count: 0, users: [] },
      'laugh': { count: 0, users: [] },
      'sad': { count: 0, users: [] }
    };
    
    // Initialize user reactions as empty array (single reaction only)
    userReactions.value = [];
  } catch (error) {
    console.error('Error loading news reactions:', error);
  }
};
    
    // Lifecycle
    onMounted(() => {
      commentsStore.fetchComments(props.newsId);
      loadNewsReactions();
    });
    
    onUnmounted(() => {
      commentsStore.unsubscribeFromComments(props.newsId);
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
      availableReactions,
      activeComments,
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
      handleDelete
    };
  }
};
</script>

<style scoped>
.news-interactions {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 16px 0;
}

.interactions-bar {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.reaction-summary {
  margin-bottom: 16px;
}

.reaction-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.reaction-emojis {
  display: flex;
  gap: 6px;
  align-items: center;
}

.reaction-emoji {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reaction-emoji:hover {
  transform: scale(1.15) translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.25);
}

.reaction-count {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #AF1E23, #c10015);
  padding: 4px 12px;
  border-radius: 20px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(175, 30, 35, 0.3);
}

.no-reactions {
  font-size: 14px;
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  padding: 12px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  position: relative;
  overflow: hidden;
  min-height: 70px;
  justify-content: center;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(175, 30, 35, 0.1), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #AF1E23;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.15);
  color: #AF1E23;
}

.action-btn.active {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  border-color: #AF1E23;
  color: #991b1b;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.2);
}

.action-btn.active::before {
  display: none;
}

.action-icon {
  transition: transform 0.2s ease;
}

.action-btn:hover .action-icon {
  transform: scale(1.1);
}

.action-btn.active .action-icon {
  transform: scale(1.15);
}

.action-label {
  font-size: 11px;
  font-weight: 600;
  color: inherit;
}

.action-count {
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  text-align: center;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 10px;
  color: #475569;
}

.action-btn.active .action-count {
  background: #fecaca;
  color: #991b1b;
}

/* Visual feedback for single selection */
.action-btn:not(.active) {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.action-btn:not(.active):hover {
  opacity: 1;
}

.action-btn.active {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.2);
}

/* Specific button styles */
.like-btn.active {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-color: #3b82f6;
  color: #1e40af;
}

.love-btn.active {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  border-color: #ef4444;
  color: #dc2626;
}

.laugh-btn.active {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
  color: #d97706;
}

.sad-btn.active {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-color: #6366f1;
  color: #4f46e5;
}

.comment-input-section {
  padding: 20px 24px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.comments-section {
  background: #ffffff;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.comments-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-icon {
  color: #AF1E23;
}

.comments-title {
  font-size: 16px;
  font-weight: 700;
  color: #231F20;
  margin: 0;
}

.comments-count {
  background: #AF1E23;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #231F20;
  margin: 0;
}

.count {
  background: #AF1E23;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.toggle-btn {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  padding: 8px;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn:hover {
  background: #f8fafc;
  border-color: #AF1E23;
  color: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn.active {
  transform: rotate(180deg);
  background: #AF1E23;
  border-color: #AF1E23;
  color: white;
}

.comments-content {
  padding: 0 24px 24px 24px;
}

.comment-input-container {
  position: relative;
}

.comment-input-wrapper {
  position: relative;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.comment-input-wrapper:focus-within {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
  background: #ffffff;
}

.comment-input {
  width: 100%;
  padding: 0;
  border: none;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  background: transparent;
  outline: none;
}

.comment-input::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.emoji-picker {
  display: flex;
  gap: 8px;
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 18px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.emoji-btn:hover {
  background: #f1f5f9;
}

.send-btn {
  background: linear-gradient(135deg, #AF1E23, #c10015);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(175, 30, 35, 0.3);
}

.send-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #991b1b, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.4);
}

.send-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.comments-list {
  min-height: 100px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #64748b;
  text-align: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
  color: #AF1E23;
}

.empty-state p {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deleted-comments {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.deleted-title {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
}

.deleted-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 640px) {
  .comments-header {
    padding: 12px 16px;
  }
  
  .comments-section {
    padding: 16px;
  }
  
  .comment-actions {
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
  
  .emoji-picker {
    justify-content: center;
  }
}
</style>
