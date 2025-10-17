<template>
  <div class="news-page">
    <!-- Pull to Refresh Indicator -->
    <div v-if="isPulling || isRefreshing" class="pull-to-refresh-indicator" :style="{ transform: `translateY(${pullDistance}px)` }">
      <div class="refresh-spinner" :class="{ active: isRefreshing }">
        <svg v-if="!isRefreshing" class="refresh-arrow" :class="{ flip: pullDistance >= 80 }" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Page Header -->
    <PageHeader 
      :title="$t('allNews')" 
      :subtitle="$t('stayUpdated')"
    />
    
    <!-- News Feed -->
    <div class="news-content">
      <ModernNewsFeed 
        :project-id="currentProjectId" 
        :show-all="true" 
        :back-button="false"
        @news-count-update="updateNewsCount" 
        @go-back="goBack"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePullToRefresh } from '../../composables/usePullToRefresh'
import { useProjectStore } from '../../stores/projectStore'
import ModernNewsFeed from '../../components/ModernNewsFeed.vue'
import PageHeader from '../../components/PageHeader.vue'

// Component name for ESLint
defineOptions({
  name: 'NewsPage'
})

const router = useRouter()
const projectStore = useProjectStore()
const newsCount = ref(0)
const newsFeedRef = ref(null)

const currentProjectId = computed(() => projectStore.selectedProject?.id)

// Pull-to-refresh functionality
const { isRefreshing, pullDistance, isPulling, setupPullToRefresh } = usePullToRefresh({
  onRefresh: async () => {
    console.log('🔄 Refreshing news feed...')
    // Reload the news feed by re-mounting the component
    // The ModernNewsFeed component fetches data in onMounted
    if (currentProjectId.value) {
      // Simply trigger a key change to remount the component
      window.location.reload()
    }
  },
  threshold: 80
})

onMounted(() => {
  setupPullToRefresh()
})

const goBack = () => {
  router.back()
}

// Function to update news count (will be called by child component)
const updateNewsCount = (count) => {
  newsCount.value = count
}

// Expose the update function to child components
defineExpose({
  updateNewsCount
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 20px;
  position: relative;
}

/* Pull to Refresh Indicator */
.pull-to-refresh-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  transition: transform 0.2s ease-out;
}

.refresh-spinner {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.refresh-spinner.active .spinner {
  animation: spin 1s linear infinite;
}

.refresh-arrow {
  color: #AF1E23;
  transition: transform 0.3s ease;
}

.refresh-arrow.flip {
  transform: rotate(180deg);
}

.spinner {
  color: #AF1E23;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.news-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
