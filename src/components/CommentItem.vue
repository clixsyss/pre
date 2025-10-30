<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <!-- Comment Header -->
    <div class="comment-header">
      <div class="user-info">
        <div class="user-avatar">
          <span class="avatar-text">{{ comment.userName?.charAt(0)?.toUpperCase() || 'A' }}</span>
        </div>
        <div class="user-details">
          <div class="user-name-row">
            <h4 class="user-name">{{ comment.userName || 'Anonymous' }}</h4>
          </div>
          <div class="comment-meta">
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div class="comment-actions">
        <!-- Only show like button on top-level comments, not replies -->
        <button 
          v-if="!isReply"
          @click="handleLike" 
          class="action-btn like-btn" 
          :class="{ active: isLiked }"
          :title="isLiked ? 'Unlike' : 'Like'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" 
              :stroke="isLiked ? '#AF1E23' : 'currentColor'" 
              :fill="isLiked ? '#AF1E23' : 'none'"
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
          </svg>
          <span v-if="likeCount > 0" class="like-count">{{ likeCount }}</span>
        </button>
        <button @click="handleReply" class="action-btn" title="Reply">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          v-if="isCurrentUser" 
          @click="handleDelete" 
          class="action-btn delete-btn" 
          title="Delete Comment"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Comment Content -->
    <div class="comment-content">
      <p class="comment-text">{{ comment.text }}</p>
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
          :is-reply="true"
          @reply="(commentId) => emit('reply', commentId)"
          @react="(commentId, emoji) => emit('react', commentId, emoji)"
          @delete="(commentId) => emit('delete', commentId)"
          @deleteWithReplies="(commentId) => emit('deleteWithReplies', commentId)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
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
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reply', 'react', 'delete', 'deleteWithReplies'],
  setup(props, { emit }) {
    // Use replies from the comment prop (passed from parent's groupedComments)
    const replies = computed(() => {
      return props.comment.replies || [];
    });
    
    // Check if this is the current user's comment
    const isCurrentUser = computed(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      return user && props.comment.userId === user.uid;
    });
    
    // Like functionality - using 👍 emoji
    const LIKE_EMOJI = '👍';
    
    const likeCount = computed(() => {
      return props.comment.reactions?.[LIKE_EMOJI]?.count || 0;
    });
    
    const isLiked = computed(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return false;
      
      const likeReaction = props.comment.reactions?.[LIKE_EMOJI];
      return likeReaction?.users?.includes(user.uid) || false;
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
      
      // Calculate months more accurately
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();
      const dateYear = commentTime.getFullYear();
      const dateMonth = commentTime.getMonth();
      
      const monthDiff = (nowYear - dateYear) * 12 + (nowMonth - dateMonth);
      
      if (monthDiff === 1) {
        return '1 month ago';
      } else if (monthDiff < 12) {
        return `${monthDiff} months ago`;
      } else if (monthDiff < 24) {
        return '1 year ago';
      } else {
        const years = Math.floor(monthDiff / 12);
        if (years === 1) {
          return '1 year ago';
        } else {
          return `${years} years ago`;
        }
      }
    };
    
    const handleLike = () => {
      // Emit react event with the like emoji
      emit('react', props.comment.id, LIKE_EMOJI);
    };
    
    const handleReply = () => {
      emit('reply', props.comment.id);
    };
    
    const handleDelete = () => {
      if (confirm('Are you sure you want to delete this comment? This will also delete all replies to this comment.')) {
        emit('deleteWithReplies', props.comment.id);
      }
    };
    
    return {
      replies,
      isCurrentUser,
      isLiked,
      likeCount,
      formatTime,
      handleLike,
      handleReply,
      handleDelete
    };
  }
};
</script>

<style scoped>
.comment-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.comment-item.is-reply {
  background: #f8fafc;
  border-left: 3px solid #AF1E23;
  margin-left: 0;
}

/* Mobile app - hover effects disabled */
/* .comment-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
} */

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #AF1E23, #991b1b);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #231F20;
  margin: 0 0 2px 0;
  line-height: normal;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
}

.user-unit {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 500;
  color: #475569;
}

.comment-actions {
  display: flex;
  gap: 2px;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .action-btn:hover {
  background: #f1f5f9;
  color: #AF1E23;
} */

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn.active {
  color: #AF1E23;
  background: #fef2f2;
}

.like-count {
  font-size: 12px;
  font-weight: 600;
}

.delete-btn {
  color: #dc2626;
}

/* Mobile app - hover effects disabled */
/* .delete-btn:hover {
  background: #fef2f2;
  color: #b91c1c;
} */

.comment-content {
  margin-bottom: 8px;
}

.comment-text {
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
  margin: 0;
  word-wrap: break-word;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Responsive design */
@media (max-width: 640px) {
  .comment-item {
    padding: 12px;
  }
  
  .comment-header {
    gap: 8px;
  }
  
  .comment-actions {
    align-self: flex-start;
  }
  
  .replies {
    padding-left: 12px;
  }
}
</style>
