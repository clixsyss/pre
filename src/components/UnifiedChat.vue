<template>
  <div class="unified-chat">
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
          <h2>{{ chatData?.title || defaultTitle }}</h2>
          <div class="status-info">
            <span :class="['status-badge', getStatusClass(chatData?.status)]">
              {{ chatData?.status || 'Loading...' }}
            </span>
            <span class="category">{{ getCategoryInfo(chatData) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading && !chatData" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!chatData" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="error-title">{{ errorTitle }}</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div v-for="message in messages" :key="message.id" :class="['message-wrapper', message.senderType]">
          <!-- Message Avatar -->
          <div class="message-avatar">
            <div :class="['avatar', message.senderType]">
              <svg v-if="message.senderType === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
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
                    <path d="M15 3H21V9M21 3L3 21M21 3V9H15" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>

              <!-- Text Message -->
              <div v-if="message.text" class="message-text">
                {{ message.text }}
              </div>

              <!-- Message Time -->
              <div class="message-time">
                {{ formatMessageTime(message.timestamp || message.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <!-- Closed Notice -->
      <div v-if="isClosed" class="closed-notice">
        <div class="closed-notice-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <span>{{ closedMessage }}</span>
        </div>
      </div>

      <div class="message-input" :class="{ 'disabled': isClosed }">
        <button @click="toggleImageUpload" class="attachment-btn" :disabled="uploading || isClosed"
          title="Attach Image">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00167 17.5872 2.00167 15.995C2.00167 14.4028 2.63417 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38787 15.79 1.38787C16.8614 1.38787 17.8794 1.80944 18.63 2.56C19.3806 3.31056 19.8021 4.32856 19.8021 5.4C19.8021 6.47144 19.3806 7.48944 18.63 8.24L9.41 17.46C9.03473 17.8353 8.53127 18.0499 8.005 18.0499C7.47873 18.0499 6.97527 17.8353 6.6 17.46C6.22473 17.0847 6.01013 16.5813 6.01013 16.055C6.01013 15.5287 6.22473 15.0253 6.6 14.65L15.07 6.18"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="input-wrapper">
          <textarea ref="messageInput" v-model="newMessage" @keydown.enter.prevent="handleEnterKey"
            @input="adjustTextareaHeight" :placeholder="isClosed ? closedPlaceholder : 'Type your message...'"
            :disabled="loading || isClosed" rows="1" class="message-textarea"></textarea>
          <div v-if="uploading" class="upload-indicator">
            <div class="upload-spinner"></div>
          </div>
        </div>

        <!-- Admin Send Button (only for services) -->
        <button v-if="allowAdminSend && props.onAdminSend" @click="sendAsAdmin"
          :disabled="!newMessage.trim() || loading || uploading || isClosed" class="admin-send-btn"
          :title="isClosed ? 'Cannot send messages' : 'Send as Admin'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>

        <button @click="sendMessage" :disabled="!newMessage.trim() || loading || uploading || isClosed" class="send-btn"
          :title="isClosed ? 'Cannot send messages' : 'Send Message'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- Image Upload -->
      <div v-if="showImageUpload" class="image-upload">
        <input ref="imageInput" type="file" accept="image/*,video/*" @change="handleImageSelect"
          style="display: none" />
        <div class="upload-options">
          <button @click="$refs.imageInput.click()" class="select-image-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" />
              <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" />
            </svg>
            Select Image/Video
          </button>
          <button @click="showImageUpload = false" class="cancel-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
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
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <div class="media-actions">
            <button @click="downloadMedia" class="action-btn" title="Download">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div class="media-container">
          <img v-if="isImageFile(previewImageUrl)" :src="previewImageUrl" alt="Image preview"
            class="fullscreen-image" />
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
import { useRouter } from 'vue-router';
import { Keyboard } from '@capacitor/keyboard';

// Props
const props = defineProps({
  chatData: {
    type: Object,
    default: null
  },
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  chatType: {
    type: String,
    required: true,
    validator: (value) => ['complaint', 'service', 'support', 'violation', 'request'].includes(value)
  },
  defaultTitle: {
    type: String,
    default: 'Chat'
  },
  errorTitle: {
    type: String,
    default: 'Chat Not Found'
  },
  errorMessage: {
    type: String,
    default: 'The chat you\'re looking for doesn\'t exist or has been deleted.'
  },
  closedMessage: {
    type: String,
    default: 'This chat has been closed. You can view the conversation but cannot send new messages.'
  },
  closedPlaceholder: {
    type: String,
    default: 'This chat is closed'
  },
  onSendMessage: {
    type: Function,
    required: true
  },
  onImageUpload: {
    type: Function,
    required: true
  },
  allowAdminSend: {
    type: Boolean,
    default: false
  },
  onAdminSend: {
    type: Function,
    required: false
  }
});

// Emits
const emit = defineEmits(['back', 'message-sent', 'image-uploaded']);

const router = useRouter();

// Reactive data
const newMessage = ref('');
const showImageUpload = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const uploading = ref(false);
const messagesContainer = ref(null);
const messageInput = ref(null);
const imageInput = ref(null);
const keyboardHeight = ref(0);
const isKeyboardVisible = ref(false);
const documentFocusHandler = ref(null);
const documentBlurHandler = ref(null);

// Computed properties
const isClosed = computed(() => {
  if (!props.chatData) return false;
  const status = props.chatData.status?.toLowerCase();
  return status === 'closed' || status === 'completed' || status === 'resolved';
});

// Methods
const goBack = () => {
  emit('back');
  router.go(-1);
};

const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value;
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
    link.download = `chat-media-${Date.now()}`;
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
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px';
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || props.loading || isClosed.value) return;

  try {
    await props.onSendMessage(newMessage.value.trim());
    newMessage.value = '';
    adjustTextareaHeight();
    scrollToBottom();
    emit('message-sent');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const sendAsAdmin = async () => {
  if (!newMessage.value.trim() || props.loading || isClosed.value || !props.onAdminSend) return;

  try {
    await props.onAdminSend(newMessage.value.trim());
    newMessage.value = '';
    adjustTextareaHeight();
    scrollToBottom();
    emit('message-sent');
  } catch (error) {
    console.error('Error sending admin message:', error);
  }
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    alert('Please select an image or video file');
    return;
  }

  try {
    uploading.value = true;
    showImageUpload.value = false;

    await props.onImageUpload(file);
    emit('image-uploaded');
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload file. Please try again.');
  } finally {
    uploading.value = false;
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

const getStatusClass = (status) => {
  if (!status) return '';
  const statusLower = status.toLowerCase().replace(' ', '-');
  return statusLower;
};

const getCategoryInfo = (chatData) => {
  if (!chatData) return '';

  switch (props.chatType) {
    case 'complaint':
      return chatData.categoryName || 'Other';
    case 'service':
      return chatData.categoryName || chatData.serviceName || 'Service';
    case 'support':
      return chatData.category || 'General';
    case 'violation':
      return chatData.amount ? `$${chatData.amount}` : 'Violation';
    case 'request':
      return chatData.categoryName || 'Request';
    default:
      return '';
  }
};

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';

  let date;
  if (timestamp.toDate) {
    // Firestore Timestamp
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    // Firestore Timestamp object with seconds property
    date = new Date(timestamp.seconds * 1000);
  } else {
    // Regular Date or timestamp
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffInMinutes = (now - date) / (1000 * 60);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

// Keyboard handling functions
const setupKeyboardListeners = async () => {
  try {
    // Try Capacitor Keyboard API first
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('🔑 UnifiedChat: Keyboard will show:', info);
      keyboardHeight.value = info.keyboardHeight;
      isKeyboardVisible.value = true;
      
      // Add keyboard-open class to body to trigger global CSS
      document.body.classList.add('keyboard-open');
      console.log('✅ UnifiedChat: Added keyboard-open class to body');
      
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('🔑 UnifiedChat: Keyboard will hide');
      keyboardHeight.value = 0;
      isKeyboardVisible.value = false;
      
      // Remove keyboard-open class from body
      document.body.classList.remove('keyboard-open');
      console.log('✅ UnifiedChat: Removed keyboard-open class from body');
    });

    // Set resize mode to ionic for better keyboard handling
    await Keyboard.setResizeMode({ mode: 'ionic' });

    // Set scroll to true to enable keyboard scrolling
    await Keyboard.setScroll({ isDisabled: false });
    
    console.log('✅ UnifiedChat: Capacitor Keyboard API listeners set up');
  } catch (error) {
    console.log('⚠️ Capacitor Keyboard API not available, using fallback:', error);
  }
  
  // PRIMARY METHOD: Listen to document-level focus events for keyboard detection
  // This works on ALL platforms (iOS, Android, Web)
  console.log('🔍 UnifiedChat: Setting up PRIMARY keyboard detection via document focus');
  
  const handleDocumentFocus = (event) => {
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      console.log('🔑 UnifiedChat: Input focused - showing keyboard', {
        tagName: target.tagName,
        className: target.className,
        currentBodyClasses: document.body.className
      });
      
      // Force add keyboard-open class
      document.body.classList.add('keyboard-open');
      console.log('✅ UnifiedChat: Added keyboard-open class. Body classes now:', document.body.className);
      
      // Verify the class was added
      if (document.body.classList.contains('keyboard-open')) {
        console.log('✅ UnifiedChat: Keyboard-open class confirmed on body');
      } else {
        console.error('❌ UnifiedChat: Failed to add keyboard-open class!');
      }
      
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };
  
  const handleDocumentBlur = (event) => {
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      console.log('🔑 UnifiedChat: Input blurred - hiding keyboard');
      // Delay removal to catch any subsequent focus events
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
        if (!isInput && document.body.classList.contains('keyboard-open')) {
          document.body.classList.remove('keyboard-open');
          console.log('✅ UnifiedChat: Removed keyboard-open class');
        }
      }, 150);
    }
  };
  
  // Store handlers for cleanup
  documentFocusHandler.value = handleDocumentFocus;
  documentBlurHandler.value = handleDocumentBlur;
  
  // Attach document-level listeners
  document.addEventListener('focusin', handleDocumentFocus, true);
  document.addEventListener('focusout', handleDocumentBlur, true);
  console.log('✅ UnifiedChat: Document-level keyboard listeners attached');
  
  // Also attach direct listener to the message input for instant detection
  await nextTick();
  if (messageInput.value) {
    const directFocusHandler = () => {
      console.log('🔑 UnifiedChat: Message input focused directly');
      if (!document.body.classList.contains('keyboard-open')) {
        document.body.classList.add('keyboard-open');
        console.log('✅ UnifiedChat: Added keyboard-open class (direct)');
      }
    };
    
    const directBlurHandler = () => {
      console.log('🔑 UnifiedChat: Message input blurred directly');
      setTimeout(() => {
        if (!messageInput.value || document.activeElement !== messageInput.value) {
          if (document.body.classList.contains('keyboard-open')) {
            document.body.classList.remove('keyboard-open');
            console.log('✅ UnifiedChat: Removed keyboard-open class (direct)');
          }
        }
      }, 150);
    };
    
    messageInput.value.addEventListener('focus', directFocusHandler);
    messageInput.value.addEventListener('blur', directBlurHandler);
    console.log('✅ UnifiedChat: Direct listeners attached to message input');
  } else {
    console.warn('⚠️ UnifiedChat: Message input ref not available');
  }
};

const cleanupKeyboardListeners = async () => {
  try {
    await Keyboard.removeAllListeners();
    
    // Remove document-level listeners
    if (documentFocusHandler.value) {
      document.removeEventListener('focusin', documentFocusHandler.value, true);
    }
    if (documentBlurHandler.value) {
      document.removeEventListener('focusout', documentBlurHandler.value, true);
    }
    
    // Clean up body class
    document.body.classList.remove('keyboard-open');
    console.log('✅ UnifiedChat: Keyboard listeners cleaned up');
  } catch (error) {
    console.log('Error cleaning up keyboard listeners:', error);
  }
};

// Watch for new messages to auto-scroll instantly (WhatsApp-like behavior)
watch(() => props.messages?.length, (newCount, oldCount) => {
  if (newCount > oldCount) {
    console.log('⚡ UnifiedChat: New message detected, auto-scrolling instantly');
    nextTick(() => {
      scrollToBottom();
    });
  }
}, { immediate: false });

// Also watch for message content changes (for real-time updates replacing temp messages)
watch(() => props.messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// Lifecycle
onMounted(async () => {
  console.log('🎬 UnifiedChat: Component mounted, setting up keyboard listeners...');
  
  // Add chat-page-active class to body to hide navigation
  document.body.classList.add('chat-page-active');
  console.log('✅ UnifiedChat: Added chat-page-active class to hide navigation');
  
  // Set up keyboard listeners
  await setupKeyboardListeners();
  
  console.log('✅ UnifiedChat: Keyboard listeners setup complete');

  // Focus on message input
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus();
    }
  });

  // Scroll to bottom
  scrollToBottom();
});

onUnmounted(() => {
  // Remove chat-page-active class from body
  document.body.classList.remove('chat-page-active');
  console.log('✅ UnifiedChat: Removed chat-page-active class');
  
  // Clean up keyboard listeners
  cleanupKeyboardListeners();
});
</script>

<style>
/* GLOBAL STYLES - Hide navigation when chat is active */
body.chat-page-active .app-header,
body.chat-page-active .bottom-navigation {
  transform: translateY(-100%) !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transition: transform 0.3s ease-in-out, opacity 0.2s ease, visibility 0.2s ease !important;
}

body.chat-page-active .bottom-navigation {
  transform: translateY(100%) !important;
}

/* Also hide when keyboard is open (works with chat-page-active) */
body.keyboard-open.chat-page-active .app-header,
body.keyboard-open.chat-page-active .bottom-navigation {
  transform: translateY(-100%) !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

body.keyboard-open.chat-page-active .bottom-navigation {
  transform: translateY(100%) !important;
}
</style>

<style scoped>
.unified-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* Full height minus header and bottom nav */
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  /* Start below app header */
  bottom: 0;
  /* Bottom nav height */
  z-index: 9999999 !important;
  transition: bottom 0.3s ease-in-out, height 0.3s ease-in-out;
}

/* When chat page is active, take full viewport */
body.chat-page-active .unified-chat {
  top: 0 !important;
  bottom: 0 !important;
  height: 100vh !important;
}

/* Adjust for keyboard visibility */
.unified-chat.keyboard-visible {
  bottom: var(--keyboard-height, 0px);
  height: calc(100vh - 68px - var(--keyboard-height, 0px));
}

/* When keyboard is visible, ensure proper positioning above keyboard */
body.keyboard-open .unified-chat {
  bottom: var(--keyboard-height, 0px);
  height: calc(100vh - 68px - var(--keyboard-height, 0px));
}

/* Header Styles */
.chat-header {
  background: #231F20;
  color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  z-index: 9999999 !important;
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

/* Mobile app - hover effects disabled */
/* .back-btn:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
} */

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
  color: white;
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

.status-badge.processing,
.status-badge.in-progress {
  background: #fed7aa;
  color: #ea580c;
}

.status-badge.closed,
.status-badge.completed,
.status-badge.resolved {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
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

/* Mobile app - hover effects disabled */
/* .action-btn:hover {
  background: #e5e7eb;
  color: #374151;
} */

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.loading-state,
.error-state {
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.error-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.btn-primary {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .btn-primary:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
} */

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 100%;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-wrapper.admin {
  flex-direction: row;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar.user {
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
}

.avatar.admin {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.avatar.system {
  background: linear-gradient(135deg, #616161 0%, #424242 100%);
}

.message-content {
  flex: 1;
}

.message-wrapper.user .message-content {
  display: flex;
  justify-content: flex-end;
}

.message-bubble {
  background: white;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: relative;
  max-width: 80%;
  word-wrap: break-word;
}

.message-wrapper.user .message-bubble {
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  border-color: #AF1E23;
}

.message-wrapper.admin .message-bubble {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #d1d5db;
  border-left: 4px solid #AF1E23;
}

.message-wrapper.system .message-bubble {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #d1d5db;
  border-left: 4px solid #AF1E23;
}

.message-text {
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-image {
  margin-bottom: 0.5rem;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.message-image img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .message-image:hover img {
  transform: scale(1.02);
} */

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

/* Mobile app - hover effects disabled */
/* .message-image:hover .image-overlay {
  opacity: 1;
} */

.image-overlay svg {
  color: white;
  width: 24px;
  height: 24px;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.message-wrapper.user .message-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: left !important;
  width: 120px;
}

.message-wrapper.admin .message-time {
  color: #6b7280;
  text-align: left !important;
  width: 120px;
}

.message-wrapper.system .message-time {
  color: #6b7280;
  text-align: left !important;
  width: 120px;
}

/* Message Input Container */
.message-input-container {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  padding-bottom: 30px;
  position: fixed;
  bottom: 0;
  z-index: 9999999 !important;
  width: 100%;
}

.closed-notice {
  margin-bottom: 1rem;
}

.closed-notice-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.message-input {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.message-input:focus-within {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.message-input.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.attachment-btn {
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
}

/* Mobile app - hover effects disabled */
/* .attachment-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
} */

.attachment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.message-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 0.5rem 0;
  max-height: 120px;
  overflow-y: auto;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

.upload-indicator {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.upload-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.send-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .send-btn:hover:not(:disabled) {
  background: #8b161a;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
} */

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.admin-send-btn {
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
  margin-right: 0.5rem;
}

/* Mobile app - hover effects disabled */
/* .admin-send-btn:hover:not(:disabled) {
  background: #1565c0;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
} */

.admin-send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Image Upload */
.image-upload {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.upload-options {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.select-image-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-image-btn {
  background: #AF1E23;
  color: white;
}

/* Mobile app - hover effects disabled */
/* .select-image-btn:hover {
  background: #8b161a;
  transform: translateY(-1px);
} */

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

/* Mobile app - hover effects disabled */
/* .cancel-btn:hover {
  background: #e5e7eb;
  color: #374151;
} */

/* Fullscreen Modal */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999 !important;
  cursor: pointer;
}

.fullscreen-content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  cursor: default;
}

.fullscreen-header {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 9999999 !important;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
} */

.media-actions {
  display: flex;
  gap: 0.5rem;
}

.media-actions .action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.media-actions /* Mobile app - hover effects disabled */
/* .action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
} */

.media-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.fullscreen-image,
.fullscreen-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.fullscreen-video {
  background: black;
}

/* Responsive Design */
@media (max-width: 768px) {
  .unified-chat {
    bottom: 72px;
  }

  .chat-header {
    padding: 0.75rem 1rem;
  }

  .messages-container {
    padding: 1rem;
    padding-bottom: 20px;
  }

  .message-input-container {
    padding: 0.75rem 1rem;
    padding-bottom: 30px;
  }

  .header-title h2 {
    font-size: 1.125rem;
  }

  .message-content {
    max-width: fit-content;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  .message-bubble {
    padding: 0.625rem 0.875rem;
  }

  .message-text {
    font-size: 0.875rem;
  }

  .upload-options {
    flex-direction: column;
    gap: 0.5rem;
  }

  .select-image-btn,
  .cancel-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 0.5rem 0.75rem;
  }

  .header-title h2 {
    font-size: 1rem;
  }

  .status-badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.5rem;
  }

  .category {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
  }

  .messages-container {
    padding: 0.75rem;
    padding-bottom: 20px;

  }

  .message-input-container {
    padding: 0.5rem 0.75rem;
    padding-bottom: 30px;
  }

  .message-bubble {
    padding: 0.5rem 0.75rem;
  }

  .message-text {
    font-size: 0.8rem;
  }

  .back-btn {
    width: 40px;
    height: 40px;
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
