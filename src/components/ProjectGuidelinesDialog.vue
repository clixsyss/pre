<template>
  <div v-if="isOpen" class="guidelines-overlay" @click="closeDialog">
    <div class="guidelines-dialog" @click.stop>
      <!-- Header -->
      <div class="guidelines-header">
        <div class="header-content">
          <h2 class="guidelines-title">Project Guidelines</h2>
          <p class="guidelines-subtitle">Important rules and procedures for our community</p>
        </div>
        <button @click="closeDialog" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="guidelines-controls">
        <div class="search-container">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Search guidelines..." 
            class="search-input"
          />
        </div>
        <select v-model="selectedCategory" class="category-filter">
          <option value="all">All Categories</option>
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading guidelines...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <svg class="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>Failed to load guidelines</h3>
        <p>{{ error }}</p>
        <button @click="fetchGuidelines" class="retry-btn">Try Again</button>
      </div>

      <!-- Guidelines List -->
      <div v-else class="guidelines-content">
        <div v-if="filteredGuidelines.length === 0" class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No guidelines found</h3>
          <p>No guidelines match your search criteria.</p>
        </div>

        <div v-else class="guidelines-list">
          <article 
            v-for="guideline in filteredGuidelines" 
            :key="guideline.id" 
            class="guideline-article"
            :class="`priority-${guideline.priority}`"
          >
            <!-- Article Header -->
            <header class="article-header">
              <div class="article-meta">
                <span 
                  class="category-badge" 
                  :style="{ backgroundColor: getCategoryColor(guideline.category) + '20', color: getCategoryColor(guideline.category) }"
                >
                  {{ formatCategoryLabel(guideline.category) }}
                </span>
                <span 
                  class="priority-badge" 
                  :style="{ backgroundColor: getPriorityInfo(guideline.priority).bgColor, color: getPriorityInfo(guideline.priority).color }"
                >
                  {{ getPriorityInfo(guideline.priority).label }}
                </span>
              </div>
              <h3 class="article-title">{{ guideline.title }}</h3>
              <div class="article-date">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ formatDate(guideline.createdAt) }}</span>
              </div>
            </header>

            <!-- Article Content -->
            <div class="article-content">
              <div class="content-text" v-html="formatContent(guideline.content)"></div>
            </div>

            <!-- Article Footer -->
            <footer class="article-footer">
              <div class="article-actions">
                <button @click="toggleExpanded(guideline.id)" class="action-btn">
                  <svg v-if="!expandedGuidelines.includes(guideline.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ expandedGuidelines.includes(guideline.id) ? 'Show Less' : 'Read More' }}
                </button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectGuidelinesStore } from '../stores/projectGuidelinesStore';
import { useProjectStore } from '../stores/projectStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const projectStore = useProjectStore();
const guidelinesStore = useProjectGuidelinesStore();

const searchTerm = ref('');
const selectedCategory = ref('all');
const expandedGuidelines = ref([]);

const loading = computed(() => guidelinesStore.isLoading);
const error = computed(() => guidelinesStore.getError);
const categories = computed(() => guidelinesStore.getCategories);
const filteredGuidelines = computed(() => guidelinesStore.getFilteredGuidelines);

const closeDialog = () => {
  emit('close');
};

const fetchGuidelines = async () => {
  const currentProjectId = projectStore.selectedProject?.id;
  if (currentProjectId) {
    await guidelinesStore.fetchGuidelines(currentProjectId);
  }
};

const toggleExpanded = (guidelineId) => {
  const index = expandedGuidelines.value.indexOf(guidelineId);
  if (index > -1) {
    expandedGuidelines.value.splice(index, 1);
  } else {
    expandedGuidelines.value.push(guidelineId);
  }
};

const formatContent = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

const formatCategoryLabel = (category) => {
  return guidelinesStore.formatCategoryLabel(category);
};

const getCategoryColor = (category) => {
  return guidelinesStore.getCategoryColor(category);
};

const getPriorityInfo = (priority) => {
  return guidelinesStore.getPriorityInfo(priority);
};

const formatDate = (timestamp) => {
  return guidelinesStore.formatDate(timestamp);
};

// Watch for search and category changes
watch(searchTerm, (newValue) => {
  guidelinesStore.setSearchTerm(newValue);
});

watch(selectedCategory, (newValue) => {
  guidelinesStore.setSelectedCategory(newValue);
});

// Fetch guidelines when dialog opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchGuidelines();
  }
});

onMounted(() => {
  if (props.isOpen) {
    fetchGuidelines();
  }
});
</script>

<style scoped>
.guidelines-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.guidelines-dialog {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.guidelines-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  padding: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.guidelines-controls {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.category-filter {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  min-width: 160px;
  transition: all 0.2s ease;
}

.category-filter:focus {
  outline: none;
  border-color: #AF1E23;
}

.guidelines-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  color: #64748b;
  margin-bottom: 16px;
}

.retry-btn {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
}

.guidelines-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.guideline-article {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.guideline-article:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.guideline-article.priority-high {
  border-left: 4px solid #dc2626;
}

.guideline-article.priority-medium {
  border-left: 4px solid #d97706;
}

.guideline-article.priority-low {
  border-left: 4px solid #16a34a;
}

.article-header {
  padding: 24px 24px 16px;
}

.article-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.category-badge, .priority-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.article-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.article-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.article-content {
  padding: 0 24px 16px;
}

.content-text {
  color: #475569;
  line-height: 1.6;
  font-size: 16px;
}

.content-text :deep(strong) {
  font-weight: 600;
  color: #1e293b;
}

.content-text :deep(em) {
  font-style: italic;
  color: #64748b;
}

.article-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
}

.article-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

@media (max-width: 768px) {
  .guidelines-dialog {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .guidelines-controls {
    flex-direction: column;
  }
  
  .search-container {
    min-width: unset;
  }
  
  .article-header, .article-content, .article-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
