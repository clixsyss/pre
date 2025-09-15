<template>
  <div class="comment-item">
    <!-- Comment Header -->
    <div class="comment-header">
      <div class="user-info">
        <div class="user-avatar">
          <span class="avatar-text">{{ comment.userName?.charAt(0)?.toUpperCase() || 'A' }}</span>
        </div>
        <div class="user-details">
          <h4 class="user-name">{{ comment.userName || 'Anonymous' }}</h4>
          <div class="comment-meta">
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            <span v-if="comment.userUnit" class="user-unit">Unit {{ comment.userUnit }}</span>
          </div>
        </div>
      </div>
      <div class="comment-actions">
        <button @click="toggleReactions" class="action-btn" title="React">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button @click="handleReply" class="action-btn" title="Reply">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Comment Content -->
    <div class="comment-content">
      <p class="comment-text">{{ comment.text }}</p>
    </div>

    <!-- Reactions -->
    <div v-if="hasReactions" class="comment-reactions">
      <button
        v-for="(reaction, emoji) in comment.reactions"
        :key="emoji"
        @click="handleReaction(emoji)"
        class="reaction-btn"
        :class="{ active: hasUserReacted(emoji) }"
      >
        <span class="emoji">{{ emoji }}</span>
        <span class="count">{{ reaction.count }}</span>
      </button>
    </div>

    <!-- Quick Reactions -->
    <div v-if="showReactions" class="quick-reactions">
      <button
        v-for="emoji in availableEmojis"
        :key="emoji"
        @click="handleReaction(emoji)"
        class="quick-reaction-btn"
        :class="{ active: hasUserReacted(emoji) }"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- Replies -->
    <div v-if="replies.length > 0" class="replies">
      <div class="replies-header">
        <span class="replies-count">{{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}</span>
      </div>
      <div class="replies-list">
        <CommentItem
          v-for="reply in replies"
          :key="reply.id"
          :comment="reply"
          :news-id="newsId"
          @reply="$emit('reply', $event)"
          @react="$emit('react', $event, emoji)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';

export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    newsId: {
      type: String,
      required: true
    }
  },
  emits: ['reply', 'react', 'delete'],
  setup(props) {
    const showReactions = ref(false);
    const replies = ref([]);
    
    // Available emojis for reactions
    const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
    
    // Computed
    const hasReactions = computed(() => {
      return props.comment.reactions && Object.keys(props.comment.reactions).length > 0;
    });
    
    // Methods
    const formatTime = (timestamp) => {
      if (!timestamp) return 'Just now';
      
      const now = new Date();
      const commentTime = timestamp instanceof Date ? timestamp : timestamp.toDate();
      const diffInSeconds = Math.floor((now - commentTime) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return commentTime.toLocaleDateString();
    };
    
    const toggleReactions = () => {
      showReactions.value = !showReactions.value;
    };
    
    const handleReaction = (emoji) => {
      this.$emit('react', props.comment.id, emoji);
      showReactions.value = false;
    };
    
    const handleReply = () => {
      this.$emit('reply', props.comment.id);
    };
    
    const hasUserReacted = (emoji) => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return false;
      
      const reaction = props.comment.reactions?.[emoji];
      return reaction?.users?.includes(user.uid) || false;
    };
    
    // Load replies (if any)
    onMounted(() => {
      // This would typically load replies from the store
      // For now, we'll just show empty array
      replies.value = [];
    });
    
    return {
      showReactions,
      replies,
      availableEmojis,
      hasReactions,
      formatTime,
      toggleReactions,
      handleReaction,
      handleReply,
      hasUserReacted
    };
  }
};
</script>

<style scoped>
.comment-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.comment-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #AF1E23, #9c27b0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #231F20;
  margin: 0 0 4px 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.user-unit {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #475569;
}

.comment-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #231F20;
}

.comment-content {
  margin-bottom: 12px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
  margin: 0;
  word-wrap: break-word;
}

.comment-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.reaction-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.reaction-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.reaction-btn.active {
  background: #fef2f2;
  border-color: #AF1E23;
  color: #991b1b;
}

.emoji {
  font-size: 14px;
}

.count {
  font-weight: 500;
  color: inherit;
}

.quick-reactions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.quick-reaction-btn {
  background: none;
  border: none;
  font-size: 18px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-reaction-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.quick-reaction-btn.active {
  background: #fef2f2;
  transform: scale(1.1);
}

.replies {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #e2e8f0;
}

.replies-header {
  margin-bottom: 12px;
}

.replies-count {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.replies-list {
  space-y: 8px;
}

/* Responsive design */
@media (max-width: 640px) {
  .comment-item {
    padding: 12px;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .comment-actions {
    align-self: flex-end;
  }
  
  .replies {
    padding-left: 12px;
  }
}
</style>
