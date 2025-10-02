<template>
  <div class="complaint-chat" :class="{ 'keyboard-visible': isKeyboardVisible }" :style="{ '--keyboard-height': keyboardHeight + 'px' }">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-info">
        <div class="header-title">
          <h2>{{ violation?.reason || 'Violation Chat' }}</h2>
          <div class="status-info">
            <span :class="['status-badge', getStatusClass(violation?.status)]">
              {{ violation?.status || 'Loading...' }}
            </span>
            <span class="category">{{ formatCurrency(violation?.amount) }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="toggleFullscreen" class="action-btn" title="Toggle Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 3H19C17.8954 3 17 3.89543 17 5V8M3 16V19C3 20.1046 3.89543 21 5 21H8M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading && !violation" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!violation" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="error-title">Violation Not Found</h3>
        <p class="error-message">The violation you're looking for doesn't exist or has been deleted.</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="message in violation.messages" 
          :key="message.id"
          :class="['message-wrapper', getMessageSenderType(message)]"
        >
          <!-- Message Avatar -->
          <div class="message-avatar">
            <div :class="['avatar', getMessageSenderType(message)]">
              <svg v-if="getMessageSenderType(message) === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- Message Content -->
          <div class="message-content">
            <div class="message-bubble">
              <!-- Image Message -->
              <div v-if="message.imageUrl" class="message-image" @click="viewImage(message.imageUrl)">
                <img :src="message.imageUrl" :alt="'Image message'" />
                <div class="image-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21V9M21 3L3 21M21 3V9H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <!-- Text Message -->
              <div v-if="message.text" class="message-text">
                {{ message.text }}
              </div>
              
              <!-- Message Time -->
              <div class="message-time">
                {{ formatMessageTime(message.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <!-- Closed Violation Notice -->
      <div v-if="isViolationClosed" class="closed-notice">
        <div class="closed-notice-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>This violation has been closed. You can view the conversation but cannot send new messages.</span>
        </div>
      </div>
      
      <div class="message-input" :class="{ 'disabled': isViolationClosed }">
        <button @click="toggleImageUpload" class="attachment-btn" :disabled="uploading || isViolationClosed" title="Attach Image">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00167 17.5872 2.00167 15.995C2.00167 14.4028 2.63417 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38787 15.79 1.38787C16.8614 1.38787 17.8794 1.80944 18.63 2.56C19.3806 3.31056 19.8021 4.32856 19.8021 5.4C19.8021 6.47144 19.3806 7.48944 18.63 8.24L9.41 17.46C9.03473 17.8353 8.53127 18.0499 8.005 18.0499C7.47873 18.0499 6.97527 17.8353 6.6 17.46C6.22473 17.0847 6.01013 16.5813 6.01013 16.055C6.01013 15.5287 6.22473 15.0253 6.6 14.65L15.07 6.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="input-wrapper">
          <textarea 
            ref="messageInput"
            v-model="newMessage"
            @keydown.enter.prevent="handleEnterKey"
            @input="adjustTextareaHeight"
            :placeholder="isViolationClosed ? 'This violation is closed' : 'Type your message...'"
            :disabled="loading || isViolationClosed"
            rows="1"
            class="message-textarea"
          ></textarea>
          <div v-if="uploading" class="upload-indicator">
            <div class="upload-spinner"></div>
          </div>
        </div>
        
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || loading || uploading || isViolationClosed" 
          class="send-btn"
          :title="isViolationClosed ? 'Cannot send messages to closed violations' : 'Send Message'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Image Upload -->
      <div v-if="showImageUpload" class="image-upload">
        <input 
          ref="imageInput"
          type="file" 
          accept="image/*,video/*" 
          @change="handleImageSelect"
          style="display: none"
        />
        <div class="upload-options">
          <button @click="$refs.imageInput.click()" class="select-image-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
              <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
            </svg>
            Select Image/Video
          </button>
          <button @click="showImageUpload = false" class="cancel-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Full Screen Image/Video Modal -->
    <div v-if="showImagePreview" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <button @click="closeFullscreen" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="media-actions">
            <button @click="downloadMedia" class="action-btn" title="Download">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="media-container">
          <img v-if="isImageFile(previewImageUrl)" :src="previewImageUrl" alt="Image preview" class="fullscreen-image" />
          <video v-else :src="previewImageUrl" controls class="fullscreen-video">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { getFine, addMessage, onFineChange, uploadFineImage, markMessagesAsRead as markViolationMessagesAsRead } from '../services/finesService';
import optimizedAuthService from '../services/optimizedAuthService';
import { Keyboard } from '@capacitor/keyboard';

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// Get violation ID from route params
const violationId = computed(() => route.params.id);

// Reactive data
const loading = ref(false);
const violation = ref(null);
const newMessage = ref('');
const showImageUpload = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const uploading = ref(false);
const unsubscribe = ref(null);
const messagesContainer = ref(null);
const messageInput = ref(null);
const imageInput = ref(null);
const keyboardHeight = ref(0);
const isKeyboardVisible = ref(false);

// Computed properties
const isViolationClosed = computed(() => violation.value?.status === 'cancelled');

// Methods
const goBack = () => {
  router.go(-1);
};

const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value;
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const closeFullscreen = () => {
  showImagePreview.value = false;
  previewImageUrl.value = '';
};

const isImageFile = (url) => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
};

const downloadMedia = () => {
  if (previewImageUrl.value) {
    const link = document.createElement('a');
    link.href = previewImageUrl.value;
    link.download = `violation-media-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const handleEnterKey = (event) => {
  if (event.shiftKey) {
    // Allow new line with Shift+Enter
    return;
  } else {
    // Send message with Enter
    event.preventDefault();
    sendMessage();
  }
};

const adjustTextareaHeight = () => {
  const textarea = messageInput.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  try {
    uploading.value = true;
    showImageUpload.value = false;

    // Upload image
    const imageUrl = await uploadFineImage(projectStore.selectedProject.id, violationId.value, file);
    
    // Send message with image
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    await addMessage(projectStore.selectedProject.id, violationId.value, {
      sender: 'user',
      senderId: user.uid,
      text: newMessage.value || 'Image message',
      imageUrl: imageUrl
    });

    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  } finally {
    uploading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || loading.value || isViolationClosed.value) return;

  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    await addMessage(projectStore.selectedProject.id, violationId.value, {
      sender: 'user',
      senderId: user.uid,
      text: newMessage.value.trim()
    });

    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
};

const viewImage = (imageUrl) => {
  previewImageUrl.value = imageUrl;
  showImagePreview.value = true;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Keyboard handling functions
const setupKeyboardListeners = async () => {
  try {
    // Listen for keyboard events
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('Keyboard will show:', info);
      keyboardHeight.value = info.keyboardHeight;
      isKeyboardVisible.value = true;
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
      keyboardHeight.value = 0;
      isKeyboardVisible.value = false;
    });

    // Set resize mode to ionic for better keyboard handling
    await Keyboard.setResizeMode({ mode: 'ionic' });
    
    // Set scroll to true to enable keyboard scrolling
    await Keyboard.setScroll({ isDisabled: false });
  } catch (error) {
    console.log('Keyboard API not available:', error);
  }
};

const cleanupKeyboardListeners = async () => {
  try {
    await Keyboard.removeAllListeners();
  } catch (error) {
    console.log('Error cleaning up keyboard listeners:', error);
  }
};

const getMessageSenderType = (message) => {
  if (message.sender === 'user') return 'user';
  return 'admin';
};

const getStatusClass = (status) => {
  const statusMap = {
    issued: 'open',
    paid: 'resolved',
    disputed: 'in-progress',
    cancelled: 'closed'
  };
  return statusMap[status] || 'open';
};

const formatCurrency = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount);
};

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now - date) / (1000 * 60);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

// Watch for new messages to auto-scroll
watch(() => violation.value?.messages?.length, () => {
  scrollToBottom();
});

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true;
    // Fetch violation data
    const violationData = await getFine(projectStore.selectedProject.id, violationId.value);
    violation.value = violationData;
    
    // Mark messages as read
    const user = await optimizedAuthService.getCurrentUser();
    if (user) {
      await markViolationMessagesAsRead(projectStore.selectedProject.id, violationId.value, user.uid);
    }
    
    // Subscribe to real-time updates
    unsubscribe.value = onFineChange(projectStore.selectedProject.id, violationId.value, async (updatedViolation) => {
      if (updatedViolation) {
        violation.value = updatedViolation;
        // Mark new messages as read
        const user = await optimizedAuthService.getCurrentUser();
        if (user) {
          markViolationMessagesAsRead(projectStore.selectedProject.id, violationId.value, user.uid);
        }
      }
    });
    
    // Set up keyboard listeners
    setupKeyboardListeners();
    
    // Focus on message input
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus();
      }
    });
    
    // Scroll to bottom
    scrollToBottom();
  } catch (error) {
    console.error('Error loading violation:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
  // Clean up keyboard listeners
  cleanupKeyboardListeners();
});
</script>

<style scoped>
.complaint-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px - 0px); /* Full height minus header and bottom nav */
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 80px; /* Bottom nav height */
  z-index: 100;
  transition: bottom 0.3s ease-in-out;
}

/* Adjust for keyboard visibility */
.complaint-chat.keyboard-visible {
  bottom: calc(80px + var(--keyboard-height, 0px));
}

/* When keyboard is visible, expand to full height */
@media (max-height: 600px) {
  .complaint-chat {
    bottom: 0;
    height: calc(100vh - 150px);
  }
}

/* Header Styles */
.chat-header {
  background: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  z-index: 10;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(175, 30, 35, 0.2);
}

.back-btn:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

.header-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.open {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.in-progress {
  background: #fed7aa;
  color: #ea580c;
}

.status-badge.resolved {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.category {
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.error-icon {
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.error-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.5;
  max-width: 400px;
}

.btn-primary {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #8b161a;
  transform: translateY(-1px);
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-wrapper.admin {
  flex-direction: row;
}

/* Message Avatar */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.avatar.user {
  background: #AF1E23;
}

.avatar.admin {
  background: #6b7280;
}

/* Message Content */
.message-content {
  flex: 1;
  max-width: 70%;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.message-wrapper.user .message-bubble {
  background: #AF1E23;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper.admin .message-bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

/* Message Image */
.message-image {
  margin-bottom: 0.5rem;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-image img {
  width: 100%;
  max-width: 250px;
  height: auto;
  border-radius: 12px;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 12px;
}

.message-image:hover .image-overlay {
  opacity: 1;
}

.image-overlay svg {
  color: white;
}

/* Message Text */
.message-text {
  line-height: 1.5;
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  text-align: right;
}

.message-wrapper.admin .message-time {
  text-align: left;
}

/* Message Input */
.message-input-container {
  background: white;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: -12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* Closed Violation Notice */
.closed-notice {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
}

.closed-notice-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 500;
}

.closed-notice-content svg {
  flex-shrink: 0;
  color: #f59e0b;
}

.message-input {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  max-width: 800px;
  margin: 0 auto;
}

.message-input.disabled {
  background: #f3f4f6;
  border-color: #d1d5db;
  opacity: 0.6;
  cursor: not-allowed;
}

.message-input:focus-within {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.attachment-btn, .send-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.attachment-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.send-btn {
  background: #AF1E23;
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: #8b161a;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.message-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #1f2937;
  font-family: inherit;
  min-height: 20px;
  max-height: 120px;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

.upload-indicator {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
}

.upload-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Image Upload */
.image-upload {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.upload-options {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.select-image-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.select-image-btn {
  background: #AF1E23;
  color: white;
}

.select-image-btn:hover {
  background: #8b161a;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Fullscreen Modal */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.fullscreen-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.fullscreen-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.fullscreen-header .close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.fullscreen-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.media-actions {
  display: flex;
  gap: 0.5rem;
}

.media-actions .action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.media-actions .action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.media-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem 1rem;
}

.fullscreen-image, .fullscreen-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.fullscreen-video {
  width: 100%;
  height: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .messages-container {
    padding: 1rem;
  }
  
  .message-input-container {
    padding: 1rem;
  }
  
  .message-wrapper {
    gap: 0.5rem;
  }
  
  .avatar {
    width: 28px;
    height: 28px;
  }
  
  .message-bubble {
    padding: 0.625rem 0.875rem;
  }
  
  .fullscreen-content {
    width: 95vw;
    height: 95vh;
  }
}
</style>