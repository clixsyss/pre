<template>
  <div class="violations-page">
    <PageHeader :title="$t('violationsAndFines')" :subtitle="$t('viewManageViolations')" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingViolations') }}</p>
    </div>

    <!-- Content -->
    <div v-else class="page-content">
      <!-- Summary Stats -->
      <div class="summary-section">
        <div class="summary-card">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-number">{{ violationStats.total }}</span>
              <span class="stat-label">{{ $t('total') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ violationStats.issued }}</span>
              <span class="stat-label">{{ $t('issued') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ violationStats.paid }}</span>
              <span class="stat-label">{{ $t('paid') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ violationStats.disputed }}</span>
              <span class="stat-label">{{ $t('disputed') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Violations List -->
      <div class="violations-section">
        <div class="section-header">
          <h2>{{ $t('yourViolations') }}</h2>
          <div class="filter-tabs">
            <button 
              v-for="status in statusFilters" 
              :key="status.value"
              @click="setActiveFilter(status.value)"
              class="filter-tab"
              :class="{ active: activeFilter === status.value }"
            >
              {{ status.label }}
              <span v-if="getStatusCount(status.value) > 0" class="count-badge">
                {{ getStatusCount(status.value) }}
              </span>
            </button>
          </div>
        </div>

        <!-- No Violations -->
        <div v-if="filteredViolations.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Violations Found</h3>
          <p v-if="activeFilter === 'all'">You have a clean record with no violations or fines.</p>
          <p v-else>No {{ activeFilter }} violations found.</p>
        </div>

        <!-- Violations List -->
        <div v-else class="violations-list">
          <div 
            v-for="violation in filteredViolations" 
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

    <!-- Violation Detail Modal -->
    <ViolationDetailModal 
      v-if="showDetailModal"
      :violation="selectedViolation"
      :is-open="showDetailModal"
      :user-id="currentUserId"
      @close="closeDetailModal"
      @start-chat="startChat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/projectStore'
import { getUserFines } from '../../services/finesService'
import optimizedAuthService from 'src/services/optimizedAuthService'
import ViolationDetailModal from '../../components/ViolationDetailModal.vue'
import PageHeader from '../../components/PageHeader.vue'

// Component name for ESLint
defineOptions({
  name: 'ViolationsPage'
})

// Router and stores
const router = useRouter()
const projectStore = useProjectStore()

// Reactive state
const loading = ref(false)
const violations = ref([])
const violationStats = ref({
  total: 0,
  issued: 0,
  paid: 0,
  disputed: 0,
  cancelled: 0
})
const activeFilter = ref('all')
const showDetailModal = ref(false)
const selectedViolation = ref(null)

// Computed properties
const currentUserId = ref(null)

// Initialize current user ID
const initializeUserId = async () => {
  const user = await optimizedAuthService.getCurrentUser();
  currentUserId.value = user?.uid;
}

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'issued', label: 'Issued' },
  { value: 'paid', label: 'Paid' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const filteredViolations = computed(() => {
  if (activeFilter.value === 'all') {
    return violations.value
  }
  return violations.value.filter(violation => violation.status === activeFilter.value)
})

// Methods
// const goBack = () => {
//   router.push('/profile')
// }

const loadViolations = async () => {
  console.log('ViolationsPage: loadViolations called')
  console.log('ViolationsPage: Project:', projectStore.selectedProject?.id)
  console.log('ViolationsPage: User ID:', currentUserId.value)
  
  if (!projectStore.selectedProject || !currentUserId.value) {
    console.log('ViolationsPage: Missing project or user, skipping load')
    return
  }
  
  try {
    loading.value = true
    console.log('ViolationsPage: Loading violations from Firestore...')
    
    // getUserFines already filters by userId (server-side query + client-side filter)
    const userViolations = await getUserFines(projectStore.selectedProject.id, currentUserId.value)
    console.log('ViolationsPage: Loaded violations:', userViolations.length)
    console.log('ViolationsPage: Violations data:', userViolations)
    
    violations.value = userViolations
    
    // Calculate stats
    const stats = userViolations.reduce((acc, violation) => {
      acc.total++
      acc[violation.status] = (acc[violation.status] || 0) + 1
      return acc
    }, { total: 0, issued: 0, paid: 0, disputed: 0, cancelled: 0 })
    
    violationStats.value = stats
    console.log('ViolationsPage: Calculated stats:', stats)
  } catch (error) {
    console.error('ViolationsPage: Error loading violations:', error)
    console.error('ViolationsPage: Error details:', {
      message: error.message,
      stack: error.stack,
      projectId: projectStore.selectedProject?.id,
      userId: currentUserId.value
    })
    
    // Reset data on error
    violations.value = []
    violationStats.value = { total: 0, issued: 0, paid: 0, disputed: 0, cancelled: 0 }
  } finally {
    loading.value = false
  }
}

const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

const getStatusCount = (status) => {
  if (status === 'all') return violationStats.value.total
  return violationStats.value[status] || 0
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
  router.push(`/violation-chat/${violation.id}`)
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
    !message.readBy?.includes(currentUserId.value)
  ).length
}

// Event handlers
const handleProjectStoreReady = () => {
  console.log('ViolationsPage: Project store ready, loading violations...')
  setTimeout(() => {
    loadViolations()
  }, 500) // Small delay to ensure everything is loaded
}

const handleProjectChanged = () => {
  console.log('ViolationsPage: Project changed, reloading violations...')
  setTimeout(() => {
    loadViolations()
  }, 500)
}

// Watch for project store changes
watch(
  () => projectStore.selectedProject,
  (newProject, oldProject) => {
    if (newProject && newProject.id !== oldProject?.id) {
      console.log('ViolationsPage: Project changed, reloading violations...')
      setTimeout(() => {
        loadViolations()
      }, 500)
    }
  },
  { deep: true }
)

// Watch for current user changes
watch(
  () => currentUserId.value,
  (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      console.log('ViolationsPage: User changed, reloading violations...')
      setTimeout(() => {
        loadViolations()
      }, 500)
    }
  }
)

// Load violations on mount
onMounted(async () => {
  console.log('🚀 ViolationsPage: Component mounted, initializing...')
  console.log('🚀 ViolationsPage: Current project store state:', {
    selectedProject: projectStore.selectedProject,
    hasSelectedProject: projectStore.hasSelectedProject
  })
  
  // Initialize user ID
  console.log('🚀 ViolationsPage: Initializing user ID...')
  await initializeUserId()
  console.log('🚀 ViolationsPage: User ID initialized:', currentUserId.value)
  
  // Add event listeners
  console.log('🚀 ViolationsPage: Adding event listeners...')
  window.addEventListener('projectStoreReady', handleProjectStoreReady)
  window.addEventListener('projectChanged', handleProjectChanged)
  
  // Try to load violations immediately if project and user are ready
  if (projectStore.selectedProject && currentUserId.value) {
    console.log('✅ ViolationsPage: Project and user ready, loading violations...')
    setTimeout(() => {
      loadViolations()
    }, 500)
  } else {
    console.log('⏳ ViolationsPage: Waiting for project store or user to be ready...')
    console.log('⏳ ViolationsPage: Project ready:', !!projectStore.selectedProject)
    console.log('⏳ ViolationsPage: User ready:', !!currentUserId.value)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('projectStoreReady', handleProjectStoreReady)
  window.removeEventListener('projectChanged', handleProjectChanged)
})
</script>

<style scoped>
.violations-page {
  background: #fafafa;
  min-height: 100vh;
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

.header-text h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.header-text p {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.violations-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  background: #f3f4f6;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile app - hover effects disabled */
/* .filter-tab:hover {
  background: #e5e7eb;
  color: #374151;
} */

.filter-tab.active {
  background: #AF1E23;
  color: white;
}

.count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
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
  line-height: 1.5;
}

.violations-list {
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

/* Mobile app - hover effects disabled */
/* .violation-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
} */

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
  top: -5px;
  right: -5px;
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
  .page-content {
    padding: 0px;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-tabs {
    width: 100%;
    justify-content: flex-start;
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
