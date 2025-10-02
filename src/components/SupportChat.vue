<template>
  <div class="complaint-chat" :class="{ 'keyboard-visible': isKeyboardVisible }" :style="{ '--keyboard-height': keyboardHeight + 'px' }">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <div class="header-info">
        <div class="header-title">
          <h2>{{ supportChat?.title || 'Support Chat' }}</h2>
          <div class="status-info">
            <span :class="['status-badge', supportChat?.status?.toLowerCase().replace(' ', '-')]">
              {{ supportChat?.status || 'Loading...' }}
            </span>
            <span class="category">{{ getCategoryName(supportChat?.category) }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="toggleFullscreen" class="action-btn" title="Toggle Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 3H19C17.8954 3 17 3.89543 17 5V8M3 16V19C3 20.1046 3.89543 21 5 21H8M16 21H19C20.1046 21 21 20.1046 21 19V16"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="supportStore.loading && !supportChat" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!supportChat" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="error-title">Support Chat Not Found</h3>
        <p class="error-message">The support chat you're looking for doesn't exist or has been deleted.</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div v-for="message in supportChat.messages" :key="message.id" class="message-wrapper">
          <div :class="['message', getMessageSenderType(message)]">
            <div class="message-avatar">
              <div :class="['avatar', getMessageSenderType(message)]">
                <span>{{ getInitials(message.senderName) }}</span>
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-body">
                <div v-if="message.type === 'image' && message.imageUrl" class="message-image">
                  <img :src="message.imageUrl" :alt="message.text || 'Image'" @click="openFullscreen(message.imageUrl)"
                    class="image-preview" />
                  <p v-if="message.text" class="image-caption">{{ message.text }}</p>
                </div>
                <div v-else class="message-text">
                  <p>{{ message.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div v-if="supportChat" class="input-area">
      <div class="input-container">
        <button @click="toggleImageUpload" class="attach-btn" title="Attach Image">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00167 17.5872 2.00167 15.995C2.00167 14.4028 2.63417 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38778 15.785 1.38778C16.8514 1.38778 17.8694 1.80944 18.62 2.56C19.3706 3.31056 19.7922 4.32856 19.7922 5.395C19.7922 6.46144 19.3706 7.47944 18.62 8.23L9.41 17.42C9.03472 17.7953 8.53127 18.0083 8.005 18.0083C7.47873 18.0083 6.97528 17.7953 6.6 17.42C6.22472 17.0447 6.01167 16.5413 6.01167 16.015C6.01167 15.4887 6.22472 14.9853 6.6 14.61L15.07 6.13"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <input ref="messageInput" v-model="newMessage" @keyup.enter="sendMessage" type="text"
          placeholder="Type your message..." class="message-input" :disabled="sending" />

        <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-btn"
          :class="{ 'disabled': !newMessage.trim() || sending }">
          <svg v-if="!sending" width="20" height="20" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div v-else class="spinner-small"></div>
        </button>
      </div>

      <!-- Image Upload -->
      <div v-if="showImageUpload" class="image-upload">
        <input ref="imageInput" @change="handleImageSelect" type="file" accept="image/*" class="image-input" />
        <div class="upload-actions">
          <button @click="selectImage" class="btn-secondary">Select Image</button>
          <button @click="cancelImageUpload" class="btn-outline">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Image Modal -->
    <div v-if="fullscreenImage" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content">
        <button @click="closeFullscreen" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <img :src="fullscreenImage" alt="Fullscreen" class="fullscreen-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSupportStore } from '../stores/supportStore';
import { useNotificationStore } from '../stores/notifications';
import { Keyboard } from '@capacitor/keyboard';

const router = useRouter();
const route = useRoute();
const supportStore = useSupportStore();
const notificationStore = useNotificationStore();

// Get support chat ID from route params
const supportChatId = computed(() => route.params.id);

// Reactive data
const supportChat = computed(() => supportStore.currentSupportChat);
const newMessage = ref('');
const sending = ref(false);
const showImageUpload = ref(false);
const fullscreenImage = ref(null);
const messagesContainer = ref(null);
const messageInput = ref(null);
const imageInput = ref(null);
const keyboardHeight = ref(0);
const isKeyboardVisible = ref(false);

// Categories mapping
const categories = {
  'general': 'General Inquiry',
  'technical': 'Technical Support',
  'billing': 'Billing Issue',
  'feature': 'Feature Request',
  'bug': 'Bug Report',
  'other': 'Other'
};

// Methods
const goBack = () => {
  router.go(-1);
};

const getCategoryName = (category) => {
  return categories[category] || 'General';
};

const getMessageSenderType = (message) => {
  return message.senderType === 'admin' ? 'admin' : 'user';
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // More than 24 hours
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !supportChat.value) return;

  try {
    sending.value = true;

    await supportStore.addMessage(supportChatId.value, {
      text: newMessage.value.trim(),
      type: 'text'
    });

    // Refresh the chat to get the updated messages since real-time listeners are disabled
    await supportStore.fetchSupportChat(supportChatId.value);

    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to send message. Please try again.'
    });
  } finally {
    sending.value = false;
  }
};

const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value;
};

const selectImage = () => {
  imageInput.value?.click();
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    sending.value = true;

    // Here you would upload the image to Firebase Storage
    // For now, we'll just send a text message about the image
    await supportStore.addMessage(supportChatId.value, {
      text: `📷 Image: ${file.name}`,
      type: 'text'
    });

    // Refresh the chat to get the updated messages since real-time listeners are disabled
    await supportStore.fetchSupportChat(supportChatId.value);

    showImageUpload.value = false;
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error uploading image:', error);
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to upload image. Please try again.'
    });
  } finally {
    sending.value = false;
  }
};

const cancelImageUpload = () => {
  showImageUpload.value = false;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const openFullscreen = (imageUrl) => {
  fullscreenImage.value = imageUrl;
};

const closeFullscreen = () => {
  fullscreenImage.value = null;
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
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

// Lifecycle
onMounted(async () => {
  if (supportChatId.value) {
    try {
      // Load support chat data (real-time listeners are temporarily disabled)
      await supportStore.fetchSupportChat(supportChatId.value);
      console.log('✅ Support chat loaded successfully');
    } catch (error) {
      console.error('Error loading support chat:', error);
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to load support chat.'
      });
    }
  }

  // Set up keyboard listeners
  setupKeyboardListeners();

  // Focus input
  await nextTick();
  messageInput.value?.focus();
});

onUnmounted(() => {
  // Clean up keyboard listeners
  cleanupKeyboardListeners();
});

// Watch for new messages to scroll to bottom
watch(() => supportChat.value?.messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });
</script>

<style scoped>
.complaint-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px - 80px);
  /* Full height minus header and bottom nav */
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: fixed;
  left: 0;
  right: 0;
  top: 114px; /* Start below app header */
  bottom: 80px;
  /* Bottom nav height */
  z-index: 100;
  transition: bottom 0.3s ease-in-out;
}

/* Adjust for keyboard visibility */
.complaint-chat.keyboard-visible {
  bottom: var(--keyboard-height, 0px);
  height: calc(100vh - 100px - var(--keyboard-height, 0px));
}

/* When keyboard is visible, expand to full height */
@media (max-height: 600px) {
  .complaint-chat {
    bottom: 0;
    height: calc(100vh - 150px);
  }
}

/* Header */
.chat-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.open {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.resolved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #374151;
}

.category {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.admin {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.avatar.user {
  background: #3b82f6;
  color: white;
}

.avatar.admin {
  background: #10b981;
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.sender-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-body {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.user .message-body {
  background: #3b82f6;
  color: white;
}

.message-text p {
  margin: 0;
  line-height: 1.5;
}

.message-image {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-preview {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview:hover {
  transform: scale(1.02);
}

.image-caption {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Input Area */
.input-area {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 0.5rem;
}

.attach-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.message-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  padding: 0.5rem;
  font-size: 1rem;
  color: #1e293b;
}

.message-input::placeholder {
  color: #9ca3af;
}

.send-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
}

.send-btn:hover:not(.disabled) {
  background: #2563eb;
}

.send-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.image-upload {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.image-input {
  display: none;
}

.upload-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: none;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
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
  cursor: pointer;
}

.fullscreen-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 0.75rem;
  }

  .header-title h2 {
    font-size: 1.125rem;
  }

  .message {
    max-width: 90%;
  }

  .input-area {
    padding: 0.75rem;
  }
}
</style>