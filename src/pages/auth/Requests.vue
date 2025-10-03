<template>
  <div class="services-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Requests</h1>
          <p class="hero-subtitle">Submit requests for various services and assistance</p>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id">
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Requests Tab -->
      <div v-if="activeTab === 'requests'" class="requests-content">
        <!-- Loading State -->
        <div v-if="requestCategoriesStore.isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="requestCategoriesStore.getError" class="error-container">
          <p>{{ requestCategoriesStore.getError }}</p>
          <button @click="loadRequestCategories" class="retry-btn">Retry</button>
        </div>

        <!-- Requests Grid -->
        <div v-else class="services-grid">
          <!-- Dynamic Request Categories -->
          <div v-for="category in requestCategoriesStore.getCategories" :key="category.id" class="service-card"
            @click="navigateToRequestCategory(category)">
            <div class="service-icon">
              <img v-if="category.imageUrl" :src="category.imageUrl" :alt="category.englishTitle"
                class="service-image" />
              <img v-else src="../../assets/logo.png" :alt="category.englishTitle" class="service-image" />
            </div>
            <div class="service-content">
              <h3 class="service-name">{{ category.englishTitle }}</h3>
            </div>
            <div class="service-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Open Requests Tab -->
      <div v-else-if="activeTab === 'open'" class="requests-content">
        <div v-if="loadingRequests" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading open requests...</p>
        </div>
        
        <div v-else-if="openRequests.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2" />
              <path d="M12 8V12L15 15" stroke="#ccc" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <h3>No Open Requests</h3>
          <p>You don't have any open requests at the moment.</p>
        </div>
        
        <div v-else class="requests-list">
          <div v-for="request in openRequests" :key="request.id" class="request-item" @click="openRequestChat(request)">
            <div class="request-item-header">
              <div class="request-item-info">
                <h4 class="request-item-title">{{ request.categoryName }}</h4>
                <p class="request-item-date">{{ formatDate(request.createdAt) }}</p>
              </div>
              <div class="request-status" :class="request.status">
                <span class="status-dot"></span>
                <span class="status-text">{{ formatStatus(request.status) }}</span>
              </div>
            </div>
            <div class="request-item-preview">
              <p>{{ getRequestPreview(request) }}</p>
            </div>
            <div class="request-item-actions">
              <button class="chat-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Requests Tab -->
      <div v-else-if="activeTab === 'closed'" class="requests-content">
        <div v-if="loadingRequests" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading closed requests...</p>
        </div>
        
        <div v-else-if="closedRequests.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2" />
              <path d="M9 12L11 14L15 10" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <h3>No Closed Requests</h3>
          <p>You don't have any closed requests yet.</p>
        </div>
        
        <div v-else class="requests-list">
          <div v-for="request in closedRequests" :key="request.id" class="request-item" @click="openRequestChat(request)">
            <div class="request-item-header">
              <div class="request-item-info">
                <h4 class="request-item-title">{{ request.categoryName }}</h4>
                <p class="request-item-date">{{ formatDate(request.createdAt) }}</p>
              </div>
              <div class="request-status" :class="request.status">
                <span class="status-dot"></span>
                <span class="status-text">{{ formatStatus(request.status) }}</span>
              </div>
            </div>
            <div class="request-item-preview">
              <p>{{ getRequestPreview(request) }}</p>
            </div>
            <div class="request-item-actions">
              <button class="chat-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Chat Modal -->
    <div v-if="showRequestChat" class="modal-overlay" @click="closeRequestChat">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedRequest?.categoryName }}</h3>
          <button @click="closeRequestChat" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <RequestChat 
            v-if="selectedRequest"
            :request-id="selectedRequest.id"
            :project-id="projectStore.selectedProject?.id"
            @close="closeRequestChat"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRequestCategoriesStore } from '../../stores/requestCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';
import requestSubmissionService from '../../services/requestSubmissionService';
import optimizedAuthService from '../../services/optimizedAuthService';
import RequestChat from '../../components/RequestChat.vue';

// Component name for ESLint
defineOptions({
  name: 'RequestsPage'
});

const router = useRouter();
const requestCategoriesStore = useRequestCategoriesStore();
const projectStore = useProjectStore();

// Reactive state
const activeTab = ref('requests');
const loadingRequests = ref(false);
const myRequests = ref([]);
const openRequests = ref([]);
const closedRequests = ref([]);
const showRequestChat = ref(false);
const selectedRequest = ref(null);

// Computed properties
const tabs = computed(() => [
  {
    id: 'requests',
    label: 'Requests',
    icon: ''
  },
  {
    id: 'open',
    label: 'Open',
    icon: '',
    count: openRequests.value.length
  },
  {
    id: 'closed',
    label: 'Closed',
    icon: '',
    count: closedRequests.value.length
  }
]);

// Load request categories on component mount
onMounted(async () => {
  if (projectStore.selectedProject?.id) {
    await loadRequestCategories();
    await loadMyRequests();
  }
});

// Watch for project changes
watch(() => projectStore.selectedProject?.id, async (newProjectId) => {
  if (newProjectId) {
    await loadRequestCategories();
    await loadMyRequests();
  }
});

const loadRequestCategories = async () => {
  if (projectStore.selectedProject?.id) {
    await requestCategoriesStore.fetchCategories(projectStore.selectedProject.id);
  }
};

const loadMyRequests = async () => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    loadingRequests.value = true;
    const user = await optimizedAuthService.getCurrentUser();
    if (user) {
      const requests = await requestSubmissionService.getUserSubmissions(
        projectStore.selectedProject.id, 
        user.uid
      );
      myRequests.value = requests;
      
      // Separate requests by status
      openRequests.value = requests.filter(req => 
        req.status === 'pending' || req.status === 'in_progress'
      );
      closedRequests.value = requests.filter(req => 
        req.status === 'completed' || req.status === 'rejected'
      );
    }
  } catch (error) {
    console.error('Error loading my requests:', error);
  } finally {
    loadingRequests.value = false;
  }
};

const navigateToRequestCategory = (category) => {
  router.push(`/request-category/${category.id}`);
};

const openRequestChat = (request) => {
  selectedRequest.value = request;
  showRequestChat.value = true;
};

const closeRequestChat = () => {
  showRequestChat.value = false;
  selectedRequest.value = null;
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
};

const getRequestPreview = (request) => {
  if (request.formData) {
    const firstField = Object.keys(request.formData)[0];
    if (firstField && request.formData[firstField]) {
      return `${firstField}: ${request.formData[firstField]}`;
    }
  }
  return 'Request submitted';
};
</script>

<style scoped>
.services-page {
  background: #fafafa;
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
}

.hero-content {
  width: 100%;
}

.hero-text {
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 4px;
}

/* Tabs Navigation */
.tabs-container {
  margin-bottom: 24px;
}

.tabs-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
}

.tab-btn.active {
  background: #AF1E23;
  color: white;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* .tab-btn:hover:not(.active) {
  background: #f5f5f5;
  color: #333;
} */

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.tab-btn:not(.active) .tab-count {
  background: #e5e7eb;
  color: #666;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

.services-content,
.requests-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.service-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
}

.service-icon {
  color: #AF1E23;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.service-arrow {
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.service-card:hover .service-arrow {
  color: #AF1E23;
  transform: translateX(4px);
}

/* Service Image Styles */
.service-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 8px;
}

.default-icon {
  color: #6b7280;
}

/* Requests Content */
.requests-content {
  max-width: 100%;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Request Item Styles (matching Services booking styles) */
.request-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.request-item:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
}

.request-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.request-item-info {
  flex: 1;
}

.request-item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.request-item-date {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.request-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.request-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.request-status.in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.request-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.request-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.request-item-preview {
  margin-bottom: 16px;
}

.request-item-preview p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.request-item-actions {
  display: flex;
  justify-content: flex-end;
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-btn:hover {
  background: #8B1A1E;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

.primary-btn {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.primary-btn:hover {
  background: #8B1A1E;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin: 20px 0;
}

.retry-btn {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .hero-section {
    margin-bottom: 24px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .services-grid {
    max-width: 800px;
    gap: 20px;
  }
  
  .service-card {
    padding: 32px;
  }
  
  .service-name {
    font-size: 1.375rem;
  }
  
  .service-description {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 2.25rem;
  }
  
  .services-grid {
    max-width: 1000px;
    gap: 24px;
  }
  
  .service-card {
    padding: 40px;
  }
  
  .service-name {
    font-size: 1.5rem;
  }
  
  .service-description {
    font-size: 1.125rem;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {

  .tab-btn {
    padding: 16px;
  }
  
  .service-card {
    padding: 20px;
  }
  
  .request-item {
    padding: 16px;
  }
  
  .modal-content {
    margin: 0;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
}
</style>