<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-left">
          <h2 class="modal-title">{{ booking?.serviceName || 'Service Booking' }}</h2>
          <span :class="['status-badge', booking?.status?.toLowerCase()]">
            {{ booking?.status || 'Loading...' }}
          </span>
        </div>
        <button @click="closeModal" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Booking Overview -->
        <div class="booking-overview">
          <div class="overview-card">
            <div class="card-header">
              <div class="card-icon service">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-title">
                <h3>Service Details</h3>
                <p>{{ booking?.categoryName }}</p>
              </div>
            </div>
            <div class="card-content">
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">{{ booking?.serviceName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ booking?.categoryName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price</span>
                <span class="detail-value price">EGP {{ booking?.servicePrice }}</span>
              </div>
              <div v-if="booking?.notes" class="detail-row">
                <span class="detail-label">Notes</span>
                <span class="detail-value">{{ booking?.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Booking Schedule -->
          <div class="overview-card">
            <div class="card-header">
              <div class="card-icon schedule">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-title">
                <h3>Schedule</h3>
                <p>Booking timing details</p>
              </div>
            </div>
            <div class="card-content">
              <div class="detail-row">
                <span class="detail-label">Booking Date</span>
                <span class="detail-value">{{ formatDate(booking?.selectedDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Time</span>
                <span class="detail-value">{{ booking?.selectedTime || 'Not specified' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Created On</span>
                <span class="detail-value">{{ formatDateTime(booking?.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Last Updated</span>
                <span class="detail-value">{{ formatDateTime(booking?.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Communication Status -->
          <div class="overview-card">
            <div class="card-header">
              <div class="card-icon communication">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-title">
                <h3>Communication</h3>
                <p>Chat with admin</p>
              </div>
              <div v-if="unreadCount > 0" class="unread-indicator">
                <span class="unread-count">{{ unreadCount }}</span>
              </div>
            </div>
            <div class="card-content">
              <div class="detail-row">
                <span class="detail-label">Total Messages</span>
                <span class="detail-value">{{ totalMessages }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Last Activity</span>
                <span class="detail-value">{{ formatDateTime(booking?.lastMessageAt) }}</span>
              </div>
              <div v-if="unreadCount > 0" class="detail-row">
                <span class="detail-label">Unread Messages</span>
                <span class="detail-value unread">{{ unreadCount }} new message{{ unreadCount > 1 ? 's' : '' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Last Message</span>
                <span class="detail-value">{{ lastMessagePreview }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="openChat" class="chat-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Chat with Admin</span>
            <span v-if="unreadCount > 0" class="chat-badge">{{ unreadCount }}</span>
          </button>
          
          <!-- <button v-if="booking?.status !== 'closed'" @click="closeModal" class="secondary-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H16C17.1046 20 18 19.1046 18 18V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>View Details</span>
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import serviceBookingService from '../services/serviceBookingService';

// Component name for ESLint
defineOptions({
  name: 'ServiceBookingModal'
});

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'openChat']);

const router = useRouter();
const projectStore = useProjectStore();

// Reactive state
const realtimeBooking = ref(null);
const unsubscribe = ref(null);

// Computed properties
const currentBooking = computed(() => realtimeBooking.value || props.booking);

const totalMessages = computed(() => {
  return currentBooking.value?.messages?.length || 0;
});

const unreadCount = computed(() => {
  if (!currentBooking.value?.messages || currentBooking.value.messages.length === 0) {
    return 0;
  }
  
  // Get the last message ID that the user has read
  const lastReadId = localStorage.getItem(`lastReadMessage_${currentBooking.value.id}`);
  
  if (!lastReadId) {
    // If no last read message, count all admin/system messages
    return currentBooking.value.messages.filter(msg => 
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }
  
  // Count messages after the last read message
  const lastReadIndex = currentBooking.value.messages.findIndex(msg => msg.id === lastReadId);
  if (lastReadIndex === -1) {
    return currentBooking.value.messages.filter(msg => 
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }
  
  const unreadMessages = currentBooking.value.messages.slice(lastReadIndex + 1);
  return unreadMessages.filter(msg => 
    msg.senderType === 'admin' || msg.senderType === 'system'
  ).length;
});

const lastMessagePreview = computed(() => {
  if (!currentBooking.value?.messages || currentBooking.value.messages.length === 0) {
    return 'No messages yet';
  }
  
  const lastMessage = currentBooking.value.messages[currentBooking.value.messages.length - 1];
  
  if (lastMessage.messageType === 'status_update') {
    return 'Status updated';
  } else if (lastMessage.messageType === 'details_update') {
    return 'Details updated';
  } else {
    const preview = lastMessage.text || 'New message';
    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
  }
});

// Watch for booking changes to setup real-time listener
watch(() => props.booking?.id, async (newBookingId) => {
  if (newBookingId && props.isOpen) {
    await setupRealtimeListener(newBookingId);
  }
}, { immediate: true });

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.booking?.id) {
    await setupRealtimeListener(props.booking.id);
  } else {
    cleanupListener();
  }
});

// Setup real-time listener
const setupRealtimeListener = async (bookingId) => {
  if (!projectStore.selectedProject?.id || !bookingId) return;
  
  cleanupListener(); // Clean up any existing listener
  
  try {
    const unsubscribeFn = await serviceBookingService.onServiceBookingChange(
      projectStore.selectedProject.id,
      bookingId,
      (updatedBooking) => {
        realtimeBooking.value = updatedBooking;
      }
    );
    unsubscribe.value = unsubscribeFn;
  } catch (error) {
    console.error('❌ ServiceBookingModal: Error setting up real-time listener:', error);
    unsubscribe.value = null;
  }
};

// Cleanup listener
const cleanupListener = () => {
  if (unsubscribe.value) {
    unsubscribe.value();
    unsubscribe.value = null;
  }
};

// Close modal
const closeModal = () => {
  emit('close');
  cleanupListener();
  realtimeBooking.value = null;
};

// Open chat
const openChat = () => {
  console.log('🔍 ServiceBookingModal: openChat called', { 
    bookingId: currentBooking.value?.id,
    booking: currentBooking.value,
    realtimeBooking: realtimeBooking.value,
    propsBooking: props.booking
  });
  
  if (!currentBooking.value?.id) {
    console.error('❌ ServiceBookingModal: No booking ID available', {
      currentBooking: currentBooking.value,
      realtimeBooking: realtimeBooking.value,
      propsBooking: props.booking
    });
    return;
  }
  
  // Mark messages as read when opening chat
  if (currentBooking.value.messages && currentBooking.value.messages.length > 0) {
    const lastMessage = currentBooking.value.messages[currentBooking.value.messages.length - 1];
    localStorage.setItem(`lastReadMessage_${currentBooking.value.id}`, lastMessage.id);
  }
  
  // Close modal and navigate to chat
  closeModal();
  
  const chatRoute = `/service-booking-chat/${currentBooking.value.id}`;
  console.log('🚀 ServiceBookingModal: Navigating to chat route:', chatRoute);
  
  router.push(chatRoute).then(() => {
    console.log('✅ ServiceBookingModal: Navigation successful to:', chatRoute);
  }).catch((error) => {
    console.error('❌ ServiceBookingModal: Navigation failed:', error);
    console.error('❌ ServiceBookingModal: Navigation error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  });
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  // Handle both ISO date strings and formatted date strings
  let date;
  if (dateString.includes('-')) {
    // ISO format (2025-01-15)
    date = new Date(dateString + 'T00:00:00');
  } else {
    // Already formatted or other format
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
};

// Format date and time
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Not available';
  
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
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Cleanup on unmount
onUnmounted(() => {
  cleanupListener();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.status-badge.processing {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.close-btn {
  background: #f9fafb;
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  margin-left: 16px;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  padding: 0 24px 24px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.booking-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.overview-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-icon.service {
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
}

.card-icon.schedule {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.card-icon.communication {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
}

.card-title {
  flex: 1;
  min-width: 0;
}

.card-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.card-title p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.unread-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.unread-count {
  font-size: 0.75rem;
  font-weight: 700;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  text-align: right;
  flex: 1;
  margin-left: 16px;
  word-wrap: break-word;
}

.detail-value.price {
  color: #059669;
  font-weight: 700;
  font-size: 1rem;
}

.detail-value.unread {
  color: #ef4444;
  font-weight: 600;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  position: relative;
}

.chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(175, 30, 35, 0.4);
}

.chat-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fbbf24;
  color: #92400e;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid white;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-1px);
  }
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  border-color: #AF1E23;
  color: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-content {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 20px 20px 12px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 0 20px 20px;
  }
  
  .overview-card {
    padding: 16px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-title h3 {
    font-size: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .chat-btn,
  .secondary-btn {
    padding: 14px 16px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-header {
    padding: 16px 16px 8px;
  }
  
  .modal-title {
    font-size: 1.125rem;
  }
  
  .modal-body {
    padding: 0 16px 16px;
  }
  
  .overview-card {
    padding: 12px;
  }
  
  .detail-row {
    padding: 6px 0;
  }
  
  .detail-label,
  .detail-value {
    font-size: 0.8rem;
  }
  
  .detail-value.price {
    font-size: 0.9rem;
  }
}
</style>
