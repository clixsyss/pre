<template>
  <div class="support-chat">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 3H19C17.8954 3 17 3.89543 17 5V8M3 16V19C3 20.1046 3.89543 21 5 21H8M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading && !supportChat" class="loading-state">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>

      <div v-else-if="!supportChat" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="error-title">Support Chat Not Found</h3>
        <p class="error-message">The support chat you're looking for doesn't exist or has been deleted.</p>
        <button @click="goBack" class="btn-primary">Go Back</button>
      </div>

      <div v-else class="messages-list">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No messages yet</h3>
          <p>Start the conversation by sending a message below.</p>
        </div>

        <div v-for="message in messages" :key="message.id" :class="['message-wrapper', getMessageSenderType(message)]">
          <div class="message-avatar">
            <div v-if="getMessageSenderType(message) === 'user'" class="user-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div v-else class="admin-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ getSenderName(message) }}</span>
              <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
            </div>
            
            <div class="message-bubble">
              <div v-if="message.type === 'text'" class="message-text">
                {{ message.content }}
              </div>
              
              <div v-else-if="message.type === 'image'" class="message-image">
                <img 
                  :src="message.content" 
                  :alt="message.alt || 'Image'" 
                  @click="openImageModal(message.content)"
                  class="image-preview"
                />
              </div>
              
              <div v-else-if="message.type === 'file'" class="message-file">
                <div class="file-info">
                  <div class="file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ message.fileName || 'File' }}</div>
                    <div class="file-size">{{ formatFileSize(message.fileSize) }}</div>
                  </div>
                  <a :href="message.content" :download="message.fileName" class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-container">
        <button @click="toggleAttachmentMenu" class="attachment-btn" :disabled="uploading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="input-wrapper">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="handleKeyDown"
            @input="handleInput"
            placeholder="Type your message..."
            class="message-input"
            :disabled="uploading"
            rows="1"
            ref="messageInput"
          ></textarea>
        </div>
        
        <button 
          @click="sendMessage" 
          class="send-btn" 
          :disabled="!canSend || uploading"
          :class="{ 'sending': uploading }"
        >
          <svg v-if="!uploading" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="22,2 15,22 11,13 2,9 22,2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="sending-spinner"></div>
        </button>
      </div>
      
      <!-- Attachment Menu -->
      <div v-if="showAttachmentMenu" class="attachment-menu">
        <button @click="selectImage" class="attachment-option">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Photo</span>
        </button>
        <button @click="selectFile" class="attachment-option">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>File</span>
        </button>
      </div>
    </div>

    <!-- Hidden file inputs -->
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      @change="handleImageSelect"
      style="display: none"
    />
    <input
      ref="fileInput"
      type="file"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="close-image-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <img :src="selectedImage" alt="Full size image" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../boot/firebase'
import { getAuth } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'SupportChat'
})

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

// Props
const props = defineProps({
  supportChatId: {
    type: String,
    required: false
  }
})

// Reactive data
const supportChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const uploading = ref(false)
const showAttachmentMenu = ref(false)
const showImageModal = ref(false)
const selectedImage = ref('')
const isFullscreen = ref(false)

// Refs
const messagesContainer = ref(null)
const messageInput = ref(null)
const imageInput = ref(null)
const fileInput = ref(null)

// Computed
const canSend = computed(() => {
  return newMessage.value.trim().length > 0 && !uploading.value
})

const currentSupportChatId = computed(() => {
  return props.supportChatId || route.params.id
})

// Methods
const goBack = () => {
  router.go(-1)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const getCategoryName = (category) => {
  const categories = {
    'general': 'General',
    'technical': 'Technical',
    'billing': 'Billing',
    'feature': 'Feature Request',
    'suspension': 'Account Suspension',
    'other': 'Other'
  }
  return categories[category] || 'General'
}

const getMessageSenderType = (message) => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  
  if (!currentUser) return 'admin'
  
  // Check if message is from current user
  if (message.senderId === currentUser.uid) {
    return 'user'
  }
  
  // Check if message is from admin
  if (message.senderType === 'admin') {
    return 'admin'
  }
  
  return 'admin'
}

const getSenderName = (message) => {
  if (getMessageSenderType(message) === 'user') {
    return 'You'
  }
  return message.senderName || 'Support Team'
}

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // Auto-resize textarea
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
    }
  })
}

const sendMessage = async () => {
  if (!canSend.value || !supportChat.value) return
  
  const messageText = newMessage.value.trim()
  if (!messageText) return
  
  try {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      notificationStore.showError('You must be logged in to send messages')
      return
    }
    
    const messageData = {
      content: messageText,
      type: 'text',
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      senderType: 'user',
      timestamp: serverTimestamp(),
      readBy: [currentUser.uid]
    }
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'supportChats', currentSupportChatId.value, 'messages')
    await addDoc(messagesRef, messageData)
    
    // Update support chat last message and timestamp
    const supportChatRef = doc(db, 'supportChats', currentSupportChatId.value)
    await updateDoc(supportChatRef, {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    newMessage.value = ''
    
    // Reset textarea height
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
    
  } catch (error) {
    console.error('Error sending message:', error)
    notificationStore.showError('Failed to send message. Please try again.')
  }
}

const toggleAttachmentMenu = () => {
  showAttachmentMenu.value = !showAttachmentMenu.value
}

const selectImage = () => {
  imageInput.value?.click()
  showAttachmentMenu.value = false
}

const selectFile = () => {
  fileInput.value?.click()
  showAttachmentMenu.value = false
}

const handleImageSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    notificationStore.showError('Please select an image file')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    notificationStore.showError('Image size must be less than 10MB')
    return
  }
  
  await uploadFile(file, 'image')
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    notificationStore.showError('File size must be less than 50MB')
    return
  }
  
  await uploadFile(file, 'file')
}

const uploadFile = async (file, type) => {
  if (!supportChat.value) return
  
  uploading.value = true
  
  try {
    // TODO: Implement file upload to Firebase Storage
    // For now, we'll simulate the upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      notificationStore.showError('You must be logged in to send files')
      return
    }
    
    const messageData = {
      content: URL.createObjectURL(file), // Temporary URL for demo
      type: type,
      fileName: file.name,
      fileSize: file.size,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      senderType: 'user',
      timestamp: serverTimestamp(),
      readBy: [currentUser.uid]
    }
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'supportChats', currentSupportChatId.value, 'messages')
    await addDoc(messagesRef, messageData)
    
    // Update support chat last message and timestamp
    const supportChatRef = doc(db, 'supportChats', currentSupportChatId.value)
    await updateDoc(supportChatRef, {
      lastMessage: type === 'image' ? '📷 Image' : `📎 ${file.name}`,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    notificationStore.showSuccess(`${type === 'image' ? 'Image' : 'File'} sent successfully`)
    
  } catch (error) {
    console.error('Error uploading file:', error)
    notificationStore.showError(`Failed to upload ${type}. Please try again.`)
  } finally {
    uploading.value = false
  }
}

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Load support chat data
const loadSupportChat = async () => {
  if (!currentSupportChatId.value) {
    loading.value = false
    return
  }
  
  try {
    const supportChatRef = doc(db, 'supportChats', currentSupportChatId.value)
    const supportChatSnap = await getDoc(supportChatRef)
    
    if (supportChatSnap.exists()) {
      supportChat.value = {
        id: supportChatSnap.id,
        ...supportChatSnap.data()
      }
    } else {
      supportChat.value = null
    }
  } catch (error) {
    console.error('Error loading support chat:', error)
    notificationStore.showError('Failed to load support chat')
  } finally {
    loading.value = false
  }
}

// Load messages
const loadMessages = () => {
  if (!currentSupportChatId.value) return
  
  const messagesRef = collection(db, 'supportChats', currentSupportChatId.value, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'asc'))
  
  return onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    scrollToBottom()
  })
}

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadSupportChat()
  }
})

// Lifecycle
onMounted(async () => {
  await loadSupportChat()
  
  if (currentSupportChatId.value) {
    loadMessages()
  }
})

// Close attachment menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.input-area')) {
      showAttachmentMenu.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.support-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px - 0px);
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.status-badge.in-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.resolved {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.category {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.error-title,
.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.error-message,
.empty-state p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.btn-primary {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #991b1b;
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-wrapper.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-wrapper.admin {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  background: #AF1E23;
  color: white;
}

.admin-avatar {
  background: #6b7280;
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user .message-header {
  justify-content: flex-end;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-bubble {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.user .message-bubble {
  background: #AF1E23;
  color: white;
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-image {
  margin: -12px -16px;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-preview:hover {
  transform: scale(1.02);
}

.message-file {
  margin: -12px -16px;
  padding: 12px 16px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.download-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Input Area */
.input-area {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 20px;
  position: relative;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 8px 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.input-container:focus-within {
  border-color: #AF1E23;
}

.attachment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.attachment-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.attachment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrapper {
  flex: 1;
  min-width: 0;
}

.message-input {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
  max-height: 120px;
  min-height: 20px;
}

.message-input::placeholder {
  color: #9ca3af;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #AF1E23;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #991b1b;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d1d5db;
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

/* Attachment Menu */
.attachment-menu {
  position: absolute;
  bottom: 100%;
  left: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
}

.attachment-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #374151;
}

.attachment-option:hover {
  background: #f3f4f6;
}

.attachment-option span {
  font-size: 0.8rem;
  font-weight: 500;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.close-image-btn {
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
  transition: background-color 0.2s ease;
}

.close-image-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .support-chat {
    height: calc(100vh - 100px);
  }
  
  .message-wrapper {
    max-width: 90%;
  }
  
  .attachment-menu {
    left: 10px;
    right: 10px;
  }
  
  .input-area {
    padding: 12px 16px;
  }
}
</style>
