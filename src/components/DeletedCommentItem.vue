<template>
  <div class="deleted-comment-item">
    <div class="deleted-content">
      <div class="deleted-header">
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
        <div class="deleted-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Deleted</span>
        </div>
      </div>
      
      <div class="deleted-text">
        <p class="original-text">{{ comment.text }}</p>
        <div class="deletion-info">
          <div class="deletion-reason">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ comment.deletionReason || 'This comment was deleted by an administrator for violating community guidelines.' }}</span>
          </div>
          <div class="deletion-time">
            Deleted {{ formatTime(comment.deletedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeletedCommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  setup() {
    const formatTime = (timestamp) => {
      if (!timestamp) return 'recently';
      
      const now = new Date();
      const commentTime = timestamp instanceof Date ? timestamp : timestamp.toDate();
      const diffInSeconds = Math.floor((now - commentTime) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return commentTime.toLocaleDateString();
    };
    
    return {
      formatTime
    };
  }
};
</script>

<style scoped>
.deleted-comment-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  opacity: 0.7;
  position: relative;
  overflow: hidden;
}

.deleted-comment-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #AF1E23, #c10015);
}

.deleted-content {
  position: relative;
}

.deleted-header {
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
  background: linear-gradient(135deg, #64748b, #94a3b8);
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
  color: #64748b;
  margin: 0 0 4px 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.user-unit {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #64748b;
}

.deleted-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fef2f2;
  color: #AF1E23;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #fecaca;
}

.deleted-text {
  position: relative;
}

.original-text {
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 12px 0;
  word-wrap: break-word;
  text-decoration: line-through;
  opacity: 0.6;
}

.deletion-info {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
}

.deletion-reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.deletion-reason svg {
  color: #AF1E23;
  flex-shrink: 0;
  margin-top: 2px;
}

.deletion-reason span {
  font-size: 13px;
  color: #991b1b;
  line-height: 1.4;
}

.deletion-time {
  font-size: 12px;
  color: #991b1b;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 640px) {
  .deleted-comment-item {
    padding: 12px;
  }
  
  .deleted-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .deleted-badge {
    align-self: flex-end;
  }
}
</style>
