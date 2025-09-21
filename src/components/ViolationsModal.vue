<template>
  <div v-if="isOpen" class="violations-modal-overlay" @click="closeModal">
    <div class="violations-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>Violations & Fines</h2>
            <p>Your violation history and fines</p>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-body">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading violations...</p>
        </div>

        <!-- No Violations -->
        <div v-else-if="violations.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Violations</h3>
          <p>You have no violations or fines on record.</p>
        </div>

        <!-- Violations List -->
        <div v-else class="violations-list">
          <div 
            v-for="violation in violations" 
            :key="violation.id"
            class="violation-card"
            @click="openViolationDetail(violation)"
          >
            <div class="violation-header">
              <div class="violation-status">
                <span class="status-badge" :class="getStatusClass(violation.status)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path v-if="violation.status === 'paid'" d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else-if="violation.status === 'disputed'" d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else-if="violation.status === 'cancelled'" d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ formatStatus(violation.status) }}
                </span>
                <div class="violation-amount">{{ formatCurrency(violation.amount) }}</div>
              </div>
              <div class="violation-date">{{ formatDate(violation.createdAt) }}</div>
            </div>
            
            <div class="violation-content">
              <h4 class="violation-reason">{{ violation.reason }}</h4>
              <p v-if="violation.description" class="violation-description">{{ violation.description }}</p>
              <div class="violation-dates">
                <span class="occurrence-date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Occurred: {{ formatDate(violation.occurrenceDate) }}
                </span>
              </div>
            </div>

            <!-- Unread Messages Indicator -->
            <div v-if="getUnreadCount(violation) > 0" class="unread-badge">
              {{ getUnreadCount(violation) }}
            </div>

            <!-- Action Arrow -->
            <div class="violation-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Violation Detail Modal -->
  <ViolationDetailModal 
    v-if="showDetailModal"
    :violation="selectedViolation"
    :is-open="showDetailModal"
    @close="closeDetailModal"
    @start-chat="startChat"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { getUserFines } from '../services/finesService'
import ViolationDetailModal from './ViolationDetailModal.vue'

// Component name for ESLint
defineOptions({
  name: 'ViolationsModal'
})

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'start-chat'])

// Stores
const projectStore = useProjectStore()

// Reactive state
const loading = ref(false)
const violations = ref([])
const showDetailModal = ref(false)
const selectedViolation = ref(null)

// Computed properties
const currentProject = computed(() => projectStore.selectedProject)

// Methods
const closeModal = () => {
  emit('close')
}

const loadViolations = async () => {
  if (!currentProject.value || !props.userId) return
  
  try {
    loading.value = true
    const userViolations = await getUserFines(currentProject.value.id, props.userId)
    violations.value = userViolations
  } catch (error) {
    console.error('Error loading violations:', error)
  } finally {
    loading.value = false
  }
}

const openViolationDetail = (violation) => {
  selectedViolation.value = violation
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedViolation.value = null
}

const startChat = (violation) => {
  emit('start-chat', violation)
  closeModal()
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
    month: 'short',
    day: 'numeric'
  })
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

const getUnreadCount = (violation) => {
  if (!violation.messages || !Array.isArray(violation.messages)) return 0
  
  // Count messages from admin/system that user hasn't read
  return violation.messages.filter(message => 
    (message.sender === 'admin' || message.sender === 'system') &&
    !message.readBy?.includes(props.userId)
  ).length
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadViolations()
  }
})

// Load violations when component mounts
onMounted(() => {
  if (props.isOpen) {
    loadViolations()
  }
})
</script>

<style scoped>
.violations-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.violations-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modal-slide-up 0.3s ease-out;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: #fef3c7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
}

.header-text h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.header-text p {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f0fdf4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.violations-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.violation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.violation-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
}

.violation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.violation-status {
  display: flex;
  align-items: center;
  gap: 12px;
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

.violation-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.violation-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.violation-content {
  margin-bottom: 12px;
}

.violation-reason {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.violation-description {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.violation-dates {
  display: flex;
  align-items: center;
  gap: 16px;
}

.occurrence-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.unread-badge {
  position: absolute;
  top: 12px;
  right: 40px;
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

.violation-arrow {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  color: #9ca3af;
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .violations-modal-overlay {
    padding: 16px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .header-content {
    gap: 12px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .violations-list {
    padding: 12px;
  }
  
  .violation-card {
    padding: 12px;
  }
  
  .violation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .violation-status {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
