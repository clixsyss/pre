<template>
  <div class="news-page">
    <!-- Page Header -->
    <PageHeader 
      title="All News" 
      subtitle="Stay updated with the latest community news"
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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

const currentProjectId = computed(() => projectStore.selectedProject?.id)

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
}

.news-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
