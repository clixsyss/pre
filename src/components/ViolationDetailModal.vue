<template>
  <div v-if="isOpen" class="detail-modal-overlay" @click="closeModal">
    <div class="detail-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <button @click="closeModal" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-text">
            <h2>Violation Details</h2>
            <span class="status-badge" :class="getStatusClass(violation.status)">
              {{ formatStatus(violation.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="modal-body">
        <!-- Violation Summary -->
        <div class="violation-summary">
          <div class="summary-header">
            <div class="violation-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="summary-content">
              <h3>{{ violation.reason }}</h3>
              <div class="amount">{{ formatCurrency(violation.amount) }}</div>
            </div>
          </div>
          
          <div v-if="violation.description" class="summary-description">
            <p>{{ violation.description }}</p>
          </div>
        </div>

        <!-- Violation Details -->
        <div class="violation-details">
          <div class="detail-section">
            <h4>Violation Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Occurrence Date</label>
                <span>{{ formatDate(violation.occurrenceDate) }}</span>
              </div>
              <div class="detail-item">
                <label>Issued Date</label>
                <span>{{ formatDate(violation.issuingDate || violation.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>Fine Amount</label>
                <span>{{ formatCurrency(violation.amount) }}</span>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span class="status-badge" :class="getStatusClass(violation.status)">
                  {{ formatStatus(violation.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Evidence Image -->
          <div v-if="violation.evidenceImage" class="detail-section">
            <h4>Evidence</h4>
            <div class="evidence-container">
              <img 
                :src="violation.evidenceImage" 
                alt="Violation Evidence" 
                class="evidence-image"
                @click="showImageModal = true"
              />
              <p class="evidence-caption">Tap to view full size</p>
            </div>
          </div>

          <!-- Communication Summary -->
          <div class="detail-section">
            <h4>Communication</h4>
            <div class="communication-summary">
              <div class="message-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ totalMessages }} message{{ totalMessages !== 1 ? 's' : '' }}</span>
              </div>
              <div v-if="unreadCount > 0" class="unread-count">
                {{ unreadCount }} unread
              </div>
            </div>
            
            <!-- Recent Messages Preview -->
            <div v-if="recentMessages.length > 0" class="recent-messages">
              <div 
                v-for="message in recentMessages" 
                :key="message.id"
                class="message-preview"
                :class="{ 'from-admin': message.sender === 'admin' || message.sender === 'system' }"
              >
                <div class="message-sender">
                  {{ message.sender === 'admin' ? 'Admin' : message.sender === 'system' ? 'System' : 'You' }}
                </div>
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="startChat" class="chat-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Chat with Admin
            <div v-if="unreadCount > 0" class="chat-badge">{{ unreadCount }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <div v-if="showImageModal" class="image-modal-overlay" @click="showImageModal = false">
    <div class="image-modal" @click.stop>
      <button @click="showImageModal = false" class="image-close-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <img :src="violation.evidenceImage" alt="Violation Evidence" class="full-evidence-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useModalState } from '../composables/useModalState'

// Component name for ESLint
defineOptions({
  name: 'ViolationDetailModal'
})

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  violation: {
    type: Object,
    required: true
  },
  userId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'start-chat'])
const { openModal, closeModal: hideNavigationBars } = useModalState()

// Reactive state
const showImageModal = ref(false)

// Computed properties
const totalMessages = computed(() => {
  return props.violation?.messages?.length || 0
})

const unreadCount = computed(() => {
  if (!props.violation?.messages || !Array.isArray(props.violation.messages)) return 0
  
  return props.violation.messages.filter(message => 
    (message.sender === 'admin' || message.sender === 'system') &&
    !message.readBy?.includes(props.userId)
  ).length
})

const recentMessages = computed(() => {
  if (!props.violation?.messages || !Array.isArray(props.violation.messages)) return []
  
  return props.violation.messages
    .slice(-3) // Get last 3 messages
    .reverse() // Show most recent first
})

// Methods
const closeModal = () => {
  emit('close')
}

const startChat = () => {
  emit('start-chat', props.violation)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
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

// Watch modal states to manage navigation bar visibility and background scrolling
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    hideNavigationBars()
  }
})

watch(showImageModal, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    hideNavigationBars()
  }
})
</script>

<style scoped>
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999;
  padding: 20px;
  /* iOS Safari fixes */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.detail-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile app - hover effects disabled */
/* .back-btn:hover {
  background: #e5e7eb;
  color: #374151;
} */

.header-text {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-text h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  /* iOS smooth scrolling */
  -webkit-overflow-scrolling: touch;
}

.violation-summary {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.violation-icon {
  width: 48px;
  height: 48px;
  background: #fef3c7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #AF1E23;
}

.summary-description p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.violation-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.detail-item span {
  font-size: 1rem;
  color: #111827;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
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

.evidence-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .evidence-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
} */

.evidence-caption {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.communication-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.unread-count {
  background: #ef4444;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.recent-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-preview {
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.message-preview.from-admin {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.message-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.message-text {
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.chat-btn {
  flex: 1;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

/* Mobile app - hover effects disabled */
/* .chat-btn:hover {
  background: #991b1b;
  transform: translateY(-1px);
} */

.chat-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Image Modal */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .image-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
} */

.full-evidence-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .detail-modal-overlay {
    padding: 16px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .summary-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .communication-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
