<template>
  <div class="service-booking-chat">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-info">
        <div class="header-title">
          <h2>{{ booking?.serviceName || 'Service Booking Chat' }}</h2>
          <div class="status-info">
            <span :class="['status-badge', booking?.status?.toLowerCase().replace(' ', '-')]">
              {{ booking?.status || 'Loading...' }}
            </span>
            <span class="category">{{ booking?.categoryName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading && !booking" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!booking" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="error-title">Booking Not Found</h3>
        <p class="error-message">The service booking you're looking for doesn't exist or has been removed.</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="message in booking.messages || []" 
          :key="message.id"
          :class="['message-wrapper', message.senderType]"
        >
          <!-- Message Avatar -->
          <div class="message-avatar">
            <div :class="['avatar', message.senderType]">
              <svg v-if="message.senderType === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="message.senderType === 'admin'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
      <!-- Closed Booking Notice -->
      <div v-if="isBookingClosed" class="closed-notice">
        <div class="closed-notice-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>This service booking has been closed. You can view the conversation but cannot send new messages.</span>
        </div>
      </div>
      
      <div class="message-input" :class="{ 'disabled': isBookingClosed }">
        <button @click="toggleImageUpload" class="attachment-btn" :disabled="uploading || isBookingClosed" title="Attach Image">
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
            :placeholder="isBookingClosed ? 'This service booking is closed' : 'Type your message...'"
            :disabled="loading || isBookingClosed"
            rows="1"
            class="message-textarea"
          ></textarea>
          <div v-if="uploading" class="upload-indicator">
            <div class="upload-spinner"></div>
          </div>
        </div>
        
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || loading || uploading || isBookingClosed" 
          class="send-btn"
          :title="isBookingClosed ? 'Cannot send messages to closed bookings' : 'Send Message'"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import serviceBookingService from '../services/serviceBookingService';

// Component name for ESLint
defineOptions({
  name: 'ServiceBookingChat'
});

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// Reactive state
const booking = ref(null);
const loading = ref(true);
const newMessage = ref('');
const sending = ref(false);
const messagesContainer = ref(null);
const messageInput = ref(null);
const imageInput = ref(null);
const unsubscribe = ref(null);
const uploading = ref(false);
const showImageUpload = ref(false);

// Get booking ID from route
const bookingId = route.params.id;

// Computed properties
const isBookingClosed = computed(() => booking.value?.status === 'closed');

// Load booking data
onMounted(async () => {
  await loadBooking();
  setupRealtimeListener();
  
  // Focus on message input
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus();
    }
  });
  
  scrollToBottom();
});

// Cleanup listener on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

// Watch for new messages to auto-scroll
watch(() => booking.value?.messages?.length, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

const loadBooking = async () => {
  if (!projectStore.selectedProject?.id || !bookingId) {
    loading.value = false;
    return;
  }

  try {
    const bookingData = await serviceBookingService.getServiceBooking(
      projectStore.selectedProject.id, 
      bookingId
    );
    booking.value = bookingData;
  } catch (error) {
    console.error('Error loading booking:', error);
    booking.value = null;
  } finally {
    loading.value = false;
  }
};

const setupRealtimeListener = () => {
  if (!projectStore.selectedProject?.id || !bookingId) return;

  unsubscribe.value = serviceBookingService.onServiceBookingChange(
    projectStore.selectedProject.id,
    bookingId,
    (updatedBooking) => {
      booking.value = updatedBooking;
    }
  );
};

// Image upload functions
const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value;
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
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

    // For now, we'll send a text message indicating image upload
    // You can implement actual image upload to Firebase Storage later
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        senderType: 'user'
      }
    );

    newMessage.value = '';
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  } finally {
    uploading.value = false;
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
  if (!newMessage.value.trim() || sending.value || !booking.value || isBookingClosed.value) return;

  try {
    sending.value = true;
    
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: newMessage.value.trim(),
        senderType: 'user'
      }
    );
    
    newMessage.value = '';
    adjustTextareaHeight();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    sending.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const goBack = () => {
  router.go(-1);
};

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate) {
    // Firestore timestamp object
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};
</script>

<style scoped>
.service-booking-chat {
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

/* When keyboard is visible, expand to full height */
@media (max-height: 600px) {
  .service-booking-chat {
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

.status-badge.processing {
  background: #fed7aa;
  color: #ea580c;
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

.btn-primary:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

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
  max-width: 100%;
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

.message-time {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.message-wrapper.user .message-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.message-wrapper.admin .message-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
}

.message-wrapper.system .message-time {
  color: #6b7280;
  text-align: left;
}

/* Message Input Container */
.message-input-container {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  position: sticky;
  bottom: 0;
  z-index: 10;
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

.attachment-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

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

.send-btn:hover:not(:disabled) {
  background: #8b161a;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

.send-btn:disabled {
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

/* Responsive Design */
@media (max-width: 768px) {
  .service-booking-chat {
    bottom: 72px;
  }
  
  .chat-header {
    padding: 0.75rem 1rem;
  }
  
  .messages-container {
    padding: 1rem;
  }
  
  .message-input-container {
    padding: 0.75rem 1rem;
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
  }
  
  .message-input-container {
    padding: 0.5rem 0.75rem;
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

