<template>
  <div class="warnings-page">
    <PageHeader title="Warnings" subtitle="View warnings issued to your account" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading warnings...</p>
    </div>

    <!-- Content -->
    <div v-else class="page-content">
      <!-- Summary Stats -->
      <div class="summary-section">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-number warning-active">{{ stats.active }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-item">
            <span class="stat-number warning-resolved">{{ stats.resolved }}</span>
            <span class="stat-label">Resolved</span>
          </div>
          <div class="stat-item">
            <span class="stat-number warning-converted">{{ stats.converted }}</span>
            <span class="stat-label">Converted</span>
          </div>
        </div>
      </div>

      <!-- Warnings List -->
      <div class="warnings-section">
        <div class="section-header">
          <h2>Your Warnings</h2>
          <div class="filter-tabs">
            <button
              v-for="f in statusFilters"
              :key="f.value"
              @click="activeFilter = f.value"
              class="filter-tab"
              :class="{ active: activeFilter === f.value }"
            >
              {{ f.label }}
              <span v-if="getFilterCount(f.value) > 0" class="count-badge">
                {{ getFilterCount(f.value) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredWarnings.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>No Warnings Found</h3>
          <p v-if="activeFilter === 'all'">You have no warnings on record.</p>
          <p v-else>No {{ activeFilter }} warnings found.</p>
        </div>

        <!-- Warning Cards -->
        <div v-else class="warnings-list">
          <div
            v-for="warning in filteredWarnings"
            :key="warning.id"
            class="warning-card"
            :class="{ 'warning-active-card': warning.status === 'active' }"
            @click="openDetail(warning)"
          >
            <!-- Active indicator stripe -->
            <div v-if="warning.status === 'active'" class="active-stripe"></div>

            <div class="warning-header">
              <span class="status-badge" :class="statusClass(warning.status)">
                {{ formatStatus(warning.status) }}
              </span>
              <span class="warning-date">{{ formatDate(warning.startDate) }}</span>
            </div>

            <!-- Image -->
            <img
              v-if="warning.image"
              :src="warning.image"
              :alt="warning.title"
              class="warning-image"
            />

            <div class="warning-body">
              <h4 class="warning-title">{{ warning.title }}</h4>
              <p v-if="warning.description" class="warning-description">
                {{ warning.description }}
              </p>

              <!-- Date Range -->
              <div class="warning-dates">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"
                    stroke-width="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                </svg>
                <span v-if="warning.endDate">
                  {{ formatDate(warning.startDate) }} → {{ formatDate(warning.endDate) }}
                </span>
                <span v-else>{{ formatDate(warning.startDate) }}</span>
              </div>
            </div>

            <div class="warning-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <WarningDetailModal
      v-if="showDetailModal && selectedWarning"
      :warning="selectedWarning"
      :is-open="showDetailModal"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProjectStore } from '../../stores/projectStore'
import { getUserWarnings, markWarningsAsSeen } from '../../services/warningsService'
import optimizedAuthService from '../../services/optimizedAuthService'
import PageHeader from '../../components/PageHeader.vue'
import WarningDetailModal from '../../components/WarningDetailModal.vue'

defineOptions({ name: 'WarningsPage' })

const projectStore = useProjectStore()

const loading = ref(false)
const warnings = ref([])
const activeFilter = ref('all')
const showDetailModal = ref(false)
const selectedWarning = ref(null)
const currentUserId = ref(null)

const stats = computed(() =>
  warnings.value.reduce(
    (acc, w) => {
      acc.total++
      acc[w.status] = (acc[w.status] || 0) + 1
      return acc
    },
    { total: 0, active: 0, resolved: 0, converted: 0 },
  ),
)

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'converted', label: 'Converted' },
]

const filteredWarnings = computed(() => {
  if (activeFilter.value === 'all') return warnings.value
  return warnings.value.filter((w) => w.status === activeFilter.value)
})

const getFilterCount = (filter) => {
  if (filter === 'all') return stats.value.total
  return stats.value[filter] || 0
}

const initUserId = async () => {
  const user = await optimizedAuthService.getCurrentUser()
  currentUserId.value =
    user?.attributes?.sub || user?.cognitoAttributes?.sub || user?.id || user?.userSub || user?.uid
}

const loadWarnings = async () => {
  if (!projectStore.selectedProject || !currentUserId.value) return
  try {
    loading.value = true
    const data = await getUserWarnings(projectStore.selectedProject.id, currentUserId.value)
    warnings.value = data
    // Mark all loaded warnings as seen
    if (data.length) markWarningsAsSeen(data.map((w) => w.id))
  } catch (err) {
    console.error('WarningsPage: error loading warnings', err)
    warnings.value = []
  } finally {
    loading.value = false
  }
}

const openDetail = (warning) => {
  selectedWarning.value = warning
  showDetailModal.value = true
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatStatus = (status) => {
  const map = { active: 'Active', resolved: 'Resolved', converted: 'Converted to Fine' }
  return map[status] || status
}

const statusClass = (status) => {
  const map = {
    active: 'status-active',
    resolved: 'status-resolved',
    converted: 'status-converted',
  }
  return map[status] || 'status-active'
}

const onProjectReady = () => setTimeout(loadWarnings, 500)
const onProjectChanged = () => setTimeout(loadWarnings, 500)

watch(() => projectStore.selectedProject, (n, o) => {
  if (n && n.id !== o?.id) setTimeout(loadWarnings, 500)
}, { deep: true })

watch(currentUserId, (n, o) => {
  if (n && n !== o) setTimeout(loadWarnings, 500)
})

onMounted(async () => {
  await initUserId()
  window.addEventListener('projectStoreReady', onProjectReady)
  window.addEventListener('projectChanged', onProjectChanged)
  if (projectStore.selectedProject && currentUserId.value) {
    setTimeout(loadWarnings, 500)
  }
})

onUnmounted(() => {
  window.removeEventListener('projectStoreReady', onProjectReady)
  window.removeEventListener('projectChanged', onProjectChanged)
})
</script>

<style scoped>
.warnings-page {
  background: #fafafa;
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
  border-top: 3px solid #d97706;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
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
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
}

.warning-active { color: #d97706; }
.warning-resolved { color: #059669; }
.warning-converted { color: #2563eb; }

.stat-label {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.warnings-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
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
  padding: 7px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tab.active {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
}

.count-badge {
  background: rgba(255,255,255,0.25);
  color: white;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.filter-tab:not(.active) .count-badge {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 50px 20px;
  gap: 12px;
  color: #6b7280;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-card {
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.warning-active-card {
  border-color: #AF1E23;
}

.active-stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 14px 0 0 14px;
}

.warning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

.status-active {
  background: #fef3c7;
  color: #dc2626;
}

.status-resolved {
  background: #d1fae5;
  color: #059669;
}

.status-converted {
  background: #dbeafe;
  color: #2563eb;
}

.warning-date {
  font-size: 0.72rem;
  color: #9ca3af;
}

.warning-image {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 12px;
}

.warning-body {
  margin-bottom: 4px;
}

.warning-title {
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.warning-description {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.45;
}

.warning-dates {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #9ca3af;
}

.warning-arrow {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  color: #d1d5db;
}

@media (max-width: 480px) {
  .page-content {
    padding: 0;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
