<template>
  <div class="project-selection-form">
    <div class="form-header">
      <h3>Your Projects</h3>
      <p>These are the projects you have access to based on your registration.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your projects...</p>
    </div>

    <!-- Projects List -->
    <div v-else-if="projects.length > 0" class="projects-list">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="project-item"
      >
        <div class="project-icon">
          <span class="project-logo">{{ project.name?.charAt(0) || 'P' }}</span>
        </div>
        <div class="project-info">
          <h4 class="project-name">{{ project.name || 'Unnamed Project' }}</h4>
          <p class="project-description">{{ project.description || 'No description available' }}</p>
          <div class="project-meta">
            <span class="project-location">{{ project.location || 'Location not set' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Projects State -->
    <div v-else class="no-projects-state">
      <div class="no-projects-icon">🏠</div>
      <h4>No Projects Available</h4>
      <p>You don't have access to any projects yet. This will be configured by your administrator.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProjectStore } from '../stores/projectStore'

// Component name for ESLint
defineOptions({
  name: 'ProjectSelectionForm'
})

// Props
const props = defineProps({
  projectIds: {
    type: Array,
    default: () => []
  }
})

// Store
const projectStore = useProjectStore()

// Local state
const loading = ref(false)
const projects = ref([])

// Methods
const fetchProjects = async () => {
  if (!props.projectIds || props.projectIds.length === 0) {
    projects.value = []
    return
  }

  try {
    loading.value = true
    // For now, we'll use the available projects from the store
    // In a real implementation, you might want to filter by the user's project IDs
    await projectStore.fetchAvailableProjects()
    projects.value = projectStore.availableProjects
  } catch (error) {
    console.error('Error fetching projects:', error)
    projects.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchProjects()
})

// Watch for prop changes
watch(() => props.projectIds, () => {
  fetchProjects()
}, { deep: true })
</script>

<style scoped>
.project-selection-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e1e5e9;
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Projects List */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.project-icon {
  width: 48px;
  height: 48px;
  background: #ff6b35;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-logo {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.project-description {
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  font-size: 0.875rem;
}

.project-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-location {
  color: #888;
  font-size: 0.75rem;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 12px;
}

/* No Projects State */
.no-projects-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
}

.no-projects-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.no-projects-state h4 {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.no-projects-state p {
  color: #888;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .project-meta {
    justify-content: center;
  }
}
</style>
