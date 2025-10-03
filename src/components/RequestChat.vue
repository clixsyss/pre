<template>
  <div class="request-chat">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="chat-info">
        <h4>{{ requestData?.categoryName || 'Request Chat' }}</h4>
        <p class="chat-status" :class="requestData?.status">
          {{ formatStatus(requestData?.status) }}
        </p>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading-messages">
        <div class="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
      
      <div v-else-if="messages.length === 0" class="no-messages">
        <p>No messages yet. Start the conversation!</p>
      </div>
      
      <div v-else class="messages-list">
        <div v-for="message in messages" :key="message.id" 
             :class="['message', message.senderType]">
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div v-if="message.imageUrl" class="message-image">
              <img :src="message.imageUrl" :alt="message.text" @click="openImageModal(message.imageUrl)" />
            </div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="message-input">
        <button @click="openImagePicker" class="image-btn" :disabled="sending">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <input 
          v-model="newMessage" 
          @keypress.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="sending"
          class="message-field"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-btn">
          <svg v-if="!sending" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="sending-spinner"></div>
        </button>
      </div>
    </div>

    <!-- Hidden file input for image uploads -->
    <input 
      ref="imageInput" 
      type="file" 
      accept="image/*" 
      @change="handleImageSelect" 
      style="display: none"
    />

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="image-modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <img :src="selectedImageUrl" alt="Message image" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../boot/firebase';
import optimizedAuthService from '../services/optimizedAuthService';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../boot/firebase';

const props = defineProps({
  requestId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
});

// Reactive state
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const sending = ref(false);
const requestData = ref(null);
const showImageModal = ref(false);
const selectedImageUrl = ref('');
const messagesContainer = ref(null);
const imageInput = ref(null);

// Load messages when component mounts
onMounted(async () => {
  await loadMessages();
  await loadRequestData();
});

// Watch for new messages and scroll to bottom
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

const loadMessages = async () => {
  try {
    loading.value = true;
    
    const messagesRef = collection(db, `projects/${props.projectId}/requestSubmissions/${props.requestId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    // Store unsubscribe function for cleanup
    onUnmounted(() => {
      unsubscribe();
    });
    
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    loading.value = false;
  }
};

const loadRequestData = async () => {
  try {
    // This would typically load the request data from Firestore
    // For now, we'll use a placeholder
    requestData.value = {
      categoryName: 'Request Chat',
      status: 'pending'
    };
  } catch (error) {
    console.error('Error loading request data:', error);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return;
  
  try {
    sending.value = true;
    
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const messageData = {
      text: newMessage.value.trim(),
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      createdAt: serverTimestamp()
    };

    const messagesRef = collection(db, `projects/${props.projectId}/requestSubmissions/${props.requestId}/messages`);
    await addDoc(messagesRef, messageData);
    
    newMessage.value = '';
    
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    sending.value = false;
  }
};

const openImagePicker = () => {
  imageInput.value?.click();
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    sending.value = true;
    
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Upload image to Firebase Storage
    const timestamp = Date.now();
    const fileName = `message_${timestamp}_${file.name}`;
    const storagePath = `projects/${props.projectId}/request-submissions/${props.requestId}/messages/${fileName}`;
    const fileRef = storageRef(storage, storagePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    // Send message with image
    const messageData = {
      text: 'Image message',
      imageUrl: imageUrl,
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      createdAt: serverTimestamp()
    };

    const messagesRef = collection(db, `projects/${props.projectId}/requestSubmissions/${props.requestId}/messages`);
    await addDoc(messagesRef, messageData);
    
  } catch (error) {
    console.error('Error uploading image:', error);
  } finally {
    sending.value = false;
    // Reset file input
    if (imageInput.value) {
      imageInput.value.value = '';
    }
  }
};

const openImageModal = (imageUrl) => {
  selectedImageUrl.value = imageUrl;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImageUrl.value = '';
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.request-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.chat-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.chat-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.chat-status {
  font-size: 0.875rem;
  margin: 0;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
}

.chat-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.chat-status.in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.chat-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.chat-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-style: italic;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.message.user {
  justify-content: flex-end;
}

.message.admin {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: #AF1E23;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.admin .message-content {
  background: white;
  color: #333;
  border: 1px solid #e8e8e8;
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-image {
  margin-top: 8px;
}

.message-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.message-image img:hover {
  transform: scale(1.05);
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
}

.message-input-container {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.message-input {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
}

.image-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-btn:hover:not(:disabled) {
  background: #e8e8e8;
  color: #333;
}

.image-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-field {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 0.875rem;
  color: #333;
  padding: 8px 0;
}

.message-field::placeholder {
  color: #999;
}

.send-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #8B1A1E;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Image Modal */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.image-modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .message-image img {
    max-width: 150px;
    max-height: 150px;
  }
  
  .messages-container {
    padding: 12px;
  }
  
  .message-input-container {
    padding: 12px 16px;
  }
}
</style>
