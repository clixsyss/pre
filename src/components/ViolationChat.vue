<template>
  <div class="violation-chat">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-info">
        <h1 class="chat-title">Violation Chat</h1>
        <p v-if="violation" class="chat-subtitle">{{ violation.reason }} - {{ formatCurrency(violation.amount) }}</p>
      </div>
      <div class="header-status">
        <span v-if="violation" class="status-badge" :class="getStatusClass(violation.status)">
          {{ formatStatus(violation.status) }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading violation...</p>
    </div>

    <!-- Chat Content -->
    <div v-else-if="violation" class="chat-content">
      <!-- Messages Container -->
      <div ref="messagesContainer" class="messages-container">
        <div v-if="violation.messages && violation.messages.length > 0" class="messages-list">
          <div 
            v-for="message in violation.messages" 
            :key="message.id"
            class="message"
            :class="getMessageClass(message)"
          >
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
            </div>
            <div v-if="message.imageUrl" class="message-image">
              <img :src="message.imageUrl" alt="Attached image" @click="toggleFullscreen(message.imageUrl)" />
            </div>
          </div>
        </div>
        
        <div v-else class="no-messages">
          <div class="no-messages-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No messages yet</h3>
          <p>Start the conversation about this violation.</p>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="!isViolationClosed" class="message-input-container">
        <div class="input-wrapper">
          <textarea
            ref="messageInput"
            v-model="newMessage"
            @keydown="handleEnterKey"
            @input="adjustTextareaHeight"
            placeholder="Type your message..."
            class="message-input"
            rows="1"
          ></textarea>
          
          <div class="input-actions">
            <button 
              @click="toggleImageUpload" 
              class="attach-button"
              :class="{ active: showImageUpload }"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            
            <button 
              @click="sendMessage" 
              :disabled="!newMessage.trim() && !selectedImage"
              class="send-button"
            >
              <svg v-if="sending" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Image Upload Section -->
        <div v-if="showImageUpload" class="image-upload-section">
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            style="display: none;"
          />
          
          <div v-if="!selectedImage" class="upload-area" @click="$refs.imageInput.click()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
              <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Tap to select image</span>
          </div>
          
          <div v-else class="selected-image">
            <img :src="selectedImageUrl" alt="Selected image" />
            <button @click="removeSelectedImage" class="remove-image-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Closed Violation Notice -->
      <div v-else class="closed-notice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>This violation is {{ violation.status }}. No new messages can be sent.</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>Error Loading Violation</h3>
      <p>{{ error }}</p>
      <button @click="loadViolation" class="retry-btn">Try Again</button>
    </div>

    <!-- Fullscreen Image Modal -->
    <div v-if="isFullscreen" class="fullscreen-modal" @click="toggleFullscreen()">
      <img :src="fullscreenImageUrl" alt="Fullscreen image" />
      <button @click="toggleFullscreen()" class="fullscreen-close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { getFine, addMessage, onFineChange, uploadFineImage } from '../services/finesService'

// Component name for ESLint
defineOptions({
  name: 'ViolationChat'
})

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

// Reactive state
const violation = ref(null)
const loading = ref(true)
const error = ref(null)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)
const imageInput = ref(null)
const unsubscribe = ref(null)
const uploading = ref(false)
const showImageUpload = ref(false)
const selectedImage = ref(null)
const selectedImageUrl = ref('')
const isFullscreen = ref(false)
const fullscreenImageUrl = ref('')

// Get violation ID from route
const violationId = computed(() => route.params.id)

// Check if violation is closed
const isViolationClosed = computed(() => {
  return violation.value?.status === 'paid' || 
         violation.value?.status === 'cancelled'
})

// Methods
const loadViolation = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (!projectStore.selectedProject) {
      throw new Error('No project selected')
    }
    
    const violationData = await getFine(projectStore.selectedProject.id, violationId.value)
    violation.value = violationData
    
    // Setup real-time listener
    setupRealtimeListener()
    
    // Scroll to bottom after loading
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error loading violation:', err)
    error.value = err.message || 'Failed to load violation'
  } finally {
    loading.value = false
  }
}

const setupRealtimeListener = () => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  
  unsubscribe.value = onFineChange(
    projectStore.selectedProject.id,
    violationId.value,
    (updatedViolation) => {
      if (updatedViolation) {
        violation.value = updatedViolation
        nextTick(() => scrollToBottom())
      }
    }
  )
}

const sendMessage = async () => {
  if (!newMessage.value.trim() && !selectedImage.value) return
  
  try {
    sending.value = true
    
    let imageUrl = null
    if (selectedImage.value) {
      uploading.value = true
      imageUrl = await uploadFineImage(
        projectStore.selectedProject.id, 
        violationId.value, 
        selectedImage.value
      )
      uploading.value = false
    }
    
    const messageData = {
      text: newMessage.value.trim(),
      sender: 'user',
      imageUrl
    }
    
    await addMessage(projectStore.selectedProject.id, violationId.value, messageData)
    
    // Clear input
    newMessage.value = ''
    removeSelectedImage()
    showImageUpload.value = false
    
    // Reset textarea height
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
    
    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error sending message:', err)
    // Show error notification
  } finally {
    sending.value = false
    uploading.value = false
  }
}

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedImage.value = file
    selectedImageUrl.value = URL.createObjectURL(file)
  }
}

const removeSelectedImage = () => {
  if (selectedImageUrl.value) {
    URL.revokeObjectURL(selectedImageUrl.value)
  }
  selectedImage.value = null
  selectedImageUrl.value = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value
  if (!showImageUpload.value) {
    removeSelectedImage()
  }
}

const handleEnterKey = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const adjustTextareaHeight = () => {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

const toggleFullscreen = (imageUrl = null) => {
  if (imageUrl) {
    fullscreenImageUrl.value = imageUrl
    isFullscreen.value = true
  } else {
    isFullscreen.value = false
    fullscreenImageUrl.value = ''
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const goBack = () => {
  router.back()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount)
}

const formatStatus = (status) => {
  const statusMap = {
    issued: 'Issued',
    paid: 'Paid',
    disputed: 'Disputed',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    issued: 'status-issued',
    paid: 'status-paid',
    disputed: 'status-disputed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || 'status-issued'
}

const getMessageClass = (message) => {
  if (message.sender === 'system') return 'message-system'
  if (message.sender === 'admin') return 'message-admin'
  return 'message-user'
}

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  let date
  if (timestamp?.toDate) {
    date = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    return ''
  }
  
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadViolation()
  }
})

// Load violation on mount
onMounted(() => {
  loadViolation()
})

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  removeSelectedImage()
})
</script>

<style scoped>
.violation-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 74px; /* Account for mobile bottom nav */
  z-index: 100;
}

.chat-header {
  background: #231F20;
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.chat-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-issued {
  background: #fef3c7;
  color: #d97706;
}

.status-paid {
  background: #d1fae5;
  color: #059669;
}

.status-disputed {
  background: #fee2e2;
  color: #dc2626;
}

.status-cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.chat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message-user {
  align-self: flex-end;
}

.message-user .message-content {
  background: #AF1E23;
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.message-admin {
  align-self: flex-start;
}

.message-admin .message-content {
  background: white;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 18px 18px 18px 4px;
}

.message-system {
  align-self: center;
}

.message-system .message-content {
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 12px;
  text-align: center;
  font-size: 0.875rem;
}

.message-content {
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-text {
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
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
  transform: scale(1.02);
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  gap: 16px;
}

.no-messages-icon {
  color: #9ca3af;
}

.no-messages h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.no-messages p {
  margin: 0;
  color: #6b7280;
}

.message-input-container {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 8px 12px;
}

.message-input {
  flex: 1;
  border: none;
  background: none;
  resize: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.4;
  max-height: 120px;
  min-height: 20px;
  padding: 8px 0;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attach-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-button:hover,
.attach-button.active {
  background: #e5e7eb;
  color: #374151;
}

.send-button {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background: #991b1b;
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.image-upload-section {
  margin-top: 12px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.upload-area:hover {
  border-color: #AF1E23;
  background: #fef2f2;
  color: #AF1E23;
}

.selected-image {
  position: relative;
  display: inline-block;
}

.selected-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.closed-notice {
  background: #f3f4f6;
  color: #6b7280;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-size: 0.875rem;
  border-top: 1px solid #e5e7eb;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  padding: 40px;
  text-align: center;
}

.error-icon {
  color: #ef4444;
}

.error-container h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.error-container p {
  margin: 0;
  color: #6b7280;
}

.retry-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #991b1b;
  transform: translateY(-1px);
}

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
  padding: 20px;
}

.fullscreen-modal img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.fullscreen-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .messages-container {
    padding: 16px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .message-input-container {
    padding: 12px 16px;
  }
  
  .upload-area {
    padding: 16px;
  }
  
  .selected-image img {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
