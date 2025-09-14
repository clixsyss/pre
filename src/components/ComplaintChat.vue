<template>
  <div class="complaint-chat">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div class="header-info">
        <h2>{{ complaint?.title || 'Complaint Chat' }}</h2>
        <div class="status-info">
          <span :class="['status-badge', complaint?.status?.toLowerCase().replace(' ', '-')]">
            {{ complaint?.status || 'Loading...' }}
          </span>
          <span class="category">{{ getCategoryName(complaint?.category) }}</span>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="complaintStore.loading && !complaint" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!complaint" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="error-title">Complaint Not Found</h3>
        <p class="error-message">The complaint you're looking for doesn't exist or has been deleted.</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="message in complaint.messages" 
          :key="message.id"
          :class="['message', message.senderType]"
        >
          <div class="message-bubble">
            <div v-if="message.imageUrl" class="message-image">
              <img :src="message.imageUrl" :alt="'Image message'" @click="viewImage(message.imageUrl)" />
            </div>
            <div v-if="message.text" class="message-text">
              {{ message.text }}
            </div>
            <div class="message-time">
              {{ formatMessageTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="message-input">
        <button @click="toggleImageUpload" class="image-btn" :disabled="uploading">
          <i class="fas fa-image"></i>
        </button>
        <input 
          ref="messageInput"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="complaintStore.loading"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim() || complaintStore.loading" class="send-btn">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <!-- Image Upload -->
      <div v-if="showImageUpload" class="image-upload">
        <input 
          ref="imageInput"
          type="file" 
          accept="image/*" 
          @change="handleImageSelect"
          style="display: none"
        />
        <button @click="$refs.imageInput.click()" class="select-image-btn">
          <i class="fas fa-camera"></i>
          Select Image
        </button>
        <button @click="showImageUpload = false" class="cancel-btn">
          Cancel
        </button>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="showImagePreview" class="image-preview-modal" @click="showImagePreview = false">
      <div class="image-preview-content" @click.stop>
        <img :src="previewImageUrl" alt="Image preview" />
        <button @click="showImagePreview = false" class="close-preview-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useComplaintStore } from '../stores/complaintStore';
import { getAuth } from 'firebase/auth';

const router = useRouter();
const route = useRoute();
const complaintStore = useComplaintStore();

// Get complaint ID from route params
const complaintId = computed(() => route.params.id);

// Reactive data
const newMessage = ref('');
const showImageUpload = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const uploading = ref(false);
const unsubscribe = ref(null);
const messagesContainer = ref(null);
const messageInput = ref(null);

// Computed properties
const complaint = computed(() => complaintStore.currentComplaint);

// Methods
const goBack = () => {
  router.go(-1);
};

const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value;
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
    const imageData = await complaintStore.uploadImage(file, complaintId.value);
    
    // Send message with image
    const auth = getAuth();
    const user = auth.currentUser;
    await complaintStore.addMessage(complaintId.value, {
      senderType: 'user',
      senderId: user.uid,
      text: newMessage.value || 'Image message',
      imageUrl: imageData.url,
      imageFileName: imageData.fileName
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
  if (!newMessage.value.trim() || complaintStore.loading) return;

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    await complaintStore.addMessage(complaintId.value, {
      senderType: 'user',
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

const getCategoryName = (categoryId) => {
  const category = complaintStore.complaintCategories.find(c => c.id === categoryId);
  return category ? category.name : 'Other';
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
watch(() => complaint.value?.messages?.length, () => {
  scrollToBottom();
});

// Lifecycle
onMounted(async () => {
  try {
    // Fetch complaint data
    await complaintStore.fetchComplaint(complaintId.value);
    
    // Subscribe to real-time updates
    unsubscribe.value = complaintStore.subscribeToComplaint(complaintId.value);
    
    // Focus on message input
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus();
      }
    });
    
    // Scroll to bottom
    scrollToBottom();
  } catch (error) {
    console.error('Error loading complaint:', error);
  }
});

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});
</script>

<style scoped>
.complaint-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.chat-header {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #2563eb;
}

.header-info {
  flex: 1;
}

.header-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
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
  border-radius: 4px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message.user {
  justify-content: flex-end;
}

.message.admin {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
}

.message.user .message-bubble {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.admin .message-bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.message-image {
  margin-bottom: 0.5rem;
}

.message-image img {
  width: 100%;
  max-width: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image img:hover {
  transform: scale(1.05);
}

.message-text {
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.message-input-container {
  background: white;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
}

.message-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f3f4f6;
  border-radius: 24px;
  padding: 0.5rem 1rem;
}

.image-btn, .send-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.image-btn:hover, .send-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.send-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.send-btn:not(:disabled) {
  color: #3b82f6;
}

.message-input input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 1rem;
  color: #1f2937;
}

.message-input input::placeholder {
  color: #9ca3af;
}

.image-upload {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.select-image-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-image-btn {
  background: #3b82f6;
  color: white;
}

.select-image-btn:hover {
  background: #2563eb;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.image-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.close-preview-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.close-preview-btn:hover {
  background: rgba(255,255,255,0.3);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 640px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .header-info h2 {
    font-size: 1.1rem;
  }
  
  .status-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
