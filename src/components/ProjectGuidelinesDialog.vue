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
        <div v-if="guidelines.length === 0" class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No guidelines available</h3>
          <p>No guidelines have been added for this project yet.</p>
        </div>

        <div v-else class="guidelines-articles">
          <article 
            v-for="guideline in guidelines" 
            :key="guideline.id" 
            class="guideline-article"
          >
            <h3 class="article-title">{{ guideline.title }}</h3>
            
            <div class="article-content">
              <div class="content-text" v-html="formatContent(guideline.content)"></div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
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

const loading = computed(() => guidelinesStore.isLoading);
const error = computed(() => guidelinesStore.getError);
const guidelines = computed(() => guidelinesStore.getGuidelines);

const closeDialog = () => {
  emit('close');
};

const fetchGuidelines = async () => {
  const currentProjectId = projectStore.selectedProject?.id;
  if (currentProjectId) {
    await guidelinesStore.fetchGuidelines(currentProjectId);
  }
};

const formatContent = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

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

.guidelines-articles {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.guideline-article {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.guideline-article:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.article-content {
  margin-top: 16px;
}

.content-text {
  color: #475569;
  line-height: 1.7;
  font-size: 16px;
  margin: 0;
}

.content-text :deep(strong) {
  font-weight: 600;
  color: #1e293b;
}

.content-text :deep(em) {
  font-style: italic;
  color: #64748b;
}

@media (max-width: 768px) {
  .guidelines-dialog {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .guideline-article {
    padding: 20px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .content-text {
    font-size: 15px;
  }
}
</style>
