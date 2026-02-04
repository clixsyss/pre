<template>
  <div class="complaints-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">{{ $t('complaintsSupport') }}</h1>
          <p class="hero-subtitle">{{ $t('getHelpIssues') }}</p>
          <button @click="showNewComplaintModal = true" class="new-complaint-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            {{ $t('newComplaint') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Complaint Options - Modern Grid -->
    <div class="quick-complaints-section">
      <h2 class="section-title">{{ $t('quickComplaints') }}</h2>
      
      <!-- Loading State -->
      <div v-if="complaintStore.categoriesLoading" class="categories-loading">
        <div class="spinner-small"></div>
        <p>{{ $t('loadingCategories') }}</p>
      </div>
      
      <!-- Empty State - No Categories -->
      <div v-else-if="complaintStore.complaintCategories.length === 0" class="categories-empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h4>{{ $t('noCategoriesAvailable') }}</h4>
        <p>{{ $t('adminHasntCreatedCategories') }}</p>
        <button @click="showNewComplaintModal = true" class="btn-primary">
          {{ $t('startManualComplaint') }}
        </button>
      </div>
      
      <!-- Categories Dropdown -->
      <div v-else class="category-dropdown-container">
        <label class="dropdown-label">{{ $t('selectComplaintCategory') }}</label>
        <select 
          @change="handleCategorySelect" 
          class="category-dropdown"
          v-model="selectedCategoryId"
        >
          <option value="">{{ $t('chooseCategory') }}</option>
          <option 
            v-for="category in complaintStore.complaintCategories" 
            :key="category.id"
            :value="category.id"
          >
            {{ getCategoryEmoji(category.icon) }} {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- My Complaints List -->
    <div class="my-complaints-section">
      <h2 class="section-title">{{ $t('myComplaints') }}</h2>
      
      <div class="section-header">
        <div class="filter-tabs">
          <button v-for="status in statusOptions" :key="status.id" @click="selectedStatus = status.id"
            :class="['filter-tab', { active: selectedStatus === status.id }]">
            {{ status.name }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="complaintStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('loadingComplaints') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredComplaints.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h4>{{ $t('noComplaintsFound') }}</h4>
        <p>{{ $t('startNewComplaintMessage') }}</p>
        <button @click="showNewComplaintModal = true" class="btn-primary">
          {{ $t('startNewComplaint') }}
        </button>
      </div>

      <!-- Complaints List -->
      <div v-else class="complaints-list">
        
        <div v-for="complaint in filteredComplaints" :key="complaint.id" @click="openComplaint(complaint)"
          class="complaint-card">
          <div class="complaint-header">
            <div class="complaint-title-section">
              <h4 class="complaint-title">{{ complaint.title }}</h4>
              <span class="complaint-category">{{ getCategoryName(complaint.category) }}</span>
            </div>
            <span :class="['status-badge', complaint.status.toLowerCase().replace(' ', '-')]">
              {{ getStatusLabel(complaint.status) }}
            </span>
          </div>
          <div class="complaint-preview">
            <p>{{ getLastMessage(complaint) }}</p>
          </div>
          <div class="complaint-footer">
            <div class="complaint-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ formatTime(complaint.lastMessageAt) }}
            </div>
            <div class="complaint-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Complaint Modal -->
    <div v-if="showNewComplaintModal" class="modal-overlay" :class="{ 'modal-overlay-keyboard-open': isKeyboardVisible }" @click="closeModal">
      <div class="modal-content" :class="{ 'modal-keyboard-open': isKeyboardVisible }" @click.stop>
        <ModalHeader :title="$t('newComplaint')" :subtitle="$t('tellUsWhatWentWrong')" @close="closeModal">
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
          </template>
        </ModalHeader>

        <form @submit.prevent="submitComplaint" class="complaint-form">
          <div class="form-group">
            <label>{{ $t('complaintTitle') }}</label>
            <input v-model="newComplaint.title" type="text" :placeholder="$t('briefDescription')" required />
          </div>

          <div class="form-group">
            <label>{{ $t('category') }}</label>
            <select v-model="newComplaint.category" required>
              <option value="">{{ $t('selectCategory') }}</option>
              <option v-for="category in complaintStore.complaintCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Priority</label>
            <select v-model="newComplaint.priority">
              <option v-for="priority in complaintStore.priorityLevels" :key="priority.id" :value="priority.id">
                {{ priority.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newComplaint.initialMessage" placeholder="Please describe the issue in detail..."
              rows="4" required></textarea>
          </div>

          <!-- Image/Video Upload -->
          <div class="form-group">
            <label>Attach Image or Video (Optional)</label>
            <div class="file-upload-section">
              <input ref="fileInput" type="file" @change="handleFileSelect" accept="image/*,video/*" class="file-input"
                id="complaint-file" />
              <label for="complaint-file" class="file-upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                Choose File
              </label>
              <div v-if="selectedFile" class="file-preview">
                <div class="file-info">
                  <div class="file-icon">
                    <svg v-if="isImage" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" />
                      <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="file-details">
                    <span class="file-name">{{ selectedFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                  </div>
                  <button type="button" @click="removeFile" class="remove-file-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
                <div v-if="isImage" class="image-preview">
                  <img :src="filePreviewUrl" :alt="selectedFile.name" />
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="complaintStore.loading" class="btn-primary">
              {{ complaintStore.loading ? 'Creating...' : 'Create Complaint' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useComplaintStore } from '../../stores/complaintStore';
import { useNotificationStore } from '../../stores/notifications';
import { useModalState } from '../../composables/useModalState';
import { useFormKeyboard } from '../../composables/useFormKeyboard';
import ModalHeader from '../../components/ModalHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'ComplaintsPage'
});

// Setup keyboard handling for better mobile UX (expose keyboard state for modal height)
const { isKeyboardVisible } = useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
});

const router = useRouter();
const complaintStore = useComplaintStore();
const notificationStore = useNotificationStore();
const { openModal, closeModal: hideNavigationBars } = useModalState();
const { t } = useI18n();

// Reactive data
const showNewComplaintModal = ref(false);
const selectedStatus = ref('all');
const unsubscribe = ref(null);
const selectedCategoryId = ref('');

const newComplaint = ref({
  title: '',
  category: '',
  priority: 'Medium',
  initialMessage: ''
});

// File upload variables
const selectedFile = ref(null);
const filePreviewUrl = ref(null);
const fileInput = ref(null);

const statusOptions = computed(() => [
  { id: 'all', name: t('all') },
  { id: 'Open', name: t('open') },
  { id: 'In Progress', name: t('inProgress') },
  { id: 'Resolved', name: t('resolved') }
]);

// Computed properties
const filteredComplaints = computed(() => {
  let complaints = complaintStore.userComplaints;
  
  console.log('🔍 Filtering complaints, total:', complaints.length);
  console.log('🔍 Selected status filter:', selectedStatus.value);
  console.log('🔍 Raw complaints data:', complaints);

  if (selectedStatus.value !== 'all') {
    complaints = complaints.filter(complaint => complaint.status === selectedStatus.value);
    console.log('🔍 After status filter:', complaints.length);
  }

  const sorted = complaints.sort((a, b) =>
    new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
  );
  
  console.log('🔍 Final filtered complaints:', sorted.length);
  return sorted;
});

const isImage = computed(() => {
  return selectedFile.value && selectedFile.value.type.startsWith('image/');
});

// Methods

const startQuickComplaint = (category) => {
  newComplaint.value.category = category.id;
  showNewComplaintModal.value = true;
};

const handleCategorySelect = (event) => {
  const categoryId = event.target.value;
  if (!categoryId) return;
  
  const category = complaintStore.complaintCategories.find(c => c.id === categoryId);
  if (category) {
    startQuickComplaint(category);
    // Reset selection after opening modal
    selectedCategoryId.value = '';
  }
};

const openComplaint = (complaint) => {
  router.push(`/complaints/${complaint.id}`);
};

const closeModal = () => {
  showNewComplaintModal.value = false;
  newComplaint.value = {
    title: '',
    category: '',
    priority: 'Medium',
    initialMessage: ''
  };
};

const submitComplaint = async () => {
  if (complaintStore.loading) return; // Prevent multiple submissions

  try {
    let imageUrl = null;
    let imageFileName = null;

    // Upload file if selected
    if (selectedFile.value) {
      const uploadResult = await complaintStore.uploadImage(selectedFile.value, 'complaints');
      imageUrl = uploadResult.url;
      imageFileName = uploadResult.fileName;
    }

    // Create complaint with file data
    const complaintData = {
      ...newComplaint.value,
      imageUrl,
      imageFileName
    };

    const createdComplaint = await complaintStore.createComplaint(complaintData);

    console.log('✅ ComplaintsPage: Complaint created successfully:', createdComplaint);
    console.log('✅ ComplaintsPage: Current complaints count after creation:', complaintStore.userComplaints.length);

    // Reset form
    newComplaint.value = {
      title: '',
      category: '',
      priority: 'Medium',
      initialMessage: ''
    };
    removeFile();
    closeModal();
    
    // Navigate to the created complaint
    if (createdComplaint && createdComplaint.id) {
      router.push(`/complaints/${createdComplaint.id}`);
    }
  } catch (error) {
    console.error('Error creating complaint:', error);
  }
};

const getStatusLabel = (status) => {
  const statusMap = {
    'all': t('all'),
    'Open': t('open'),
    'In Progress': t('inProgress'),
    'Resolved': t('resolved'),
    'Pending': t('pending'),
    'Closed': t('closed')
  };
  return statusMap[status] || status;
};

const getLastMessage = (complaint) => {
  if (!complaint.messages || complaint.messages.length === 0) return t('noMessages');
  const lastMessage = complaint.messages[complaint.messages.length - 1];
  return lastMessage.text || t('imageMessage');
};

const getCategoryName = (categoryId) => {
  const category = complaintStore.complaintCategories.find(c => c.id === categoryId);
  return category ? category.name : 'Other';
};

// Map icon names to emojis
const getCategoryEmoji = (iconName) => {
  const emojiMap = {
    'gate': '🚪',
    'volume_off': '🔇',
    'build': '🔧',
    'security': '🛡️',
    'home': '🏠',
    'receipt': '🧾',
    'water': '💧',
    'electric': '⚡',
    'cleaning': '🧹',
    'elevator': '🛗',
    'parking': '🅿️',
    'help': '❓'
  };
  return emojiMap[iconName] || '❓';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return date.toLocaleDateString();
};

// File handling methods
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notificationStore.showError('File size must be less than 10MB');
      return;
    }

    selectedFile.value = file;

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      filePreviewUrl.value = URL.createObjectURL(file);
    }
  }
};

const removeFile = () => {
  selectedFile.value = null;
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = null;
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Lifecycle
onMounted(async () => {
  try {
    console.log('🚀 ComplaintsPage: Component mounted, fetching complaints...');
    console.log('🚀 ComplaintsPage: Current user complaints before fetch:', complaintStore.userComplaints.length);
    
    // Fetch complaint categories first
    await complaintStore.fetchComplaintCategories();
    console.log('✅ ComplaintsPage: Categories fetched:', complaintStore.complaintCategories.length);
    
    await complaintStore.fetchComplaints();
    
    console.log('✅ ComplaintsPage: Complaints fetched, count:', complaintStore.userComplaints.length);
    console.log('✅ ComplaintsPage: Complaints data:', complaintStore.userComplaints);

    // Subscribe to real-time updates
    unsubscribe.value = await complaintStore.subscribeToComplaints();
  } catch (error) {
    console.error('❌ ComplaintsPage: Error loading complaints:', error);
  }
});

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

// Watch modal state to manage navigation bar visibility and background scrolling
watch(showNewComplaintModal, (isOpen) => {
  if (isOpen) openModal()
  else hideNavigationBars()
});
</script>

<style scoped>
.complaints-page {
  background: #f8fafc;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
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

.new-complaint-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F6F6F6;
  color: #AF1E23;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

/* Mobile app - hover effects disabled */
/* .new-complaint-btn:hover {
  background: #fff5f2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
} */

/* Quick Complaints Section */
.quick-complaints-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}

/* Categories Loading State */
.categories-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.75rem;
}

.categories-loading p {
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f4f6;
  border-top-color: #AF1E23;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Categories Empty State */
.categories-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background: #f9fafb;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
}

.categories-empty-state .empty-icon {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.categories-empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.categories-empty-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  max-width: 400px;
  line-height: 1.5;
}

.categories-empty-state .btn-primary {
  background: linear-gradient(135deg, #AF1E23 0%, #8B1820 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.3);
}

.categories-empty-state .btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(175, 30, 35, 0.3);
}

/* Category Dropdown Container */
.category-dropdown-container {
  padding: 8px 0;
}

.dropdown-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.category-dropdown {
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23AF1E23' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px;
}

.category-dropdown:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-dropdown option {
  padding: 12px;
  font-size: 1rem;
  background: white;
  color: #1f2937;
}

.category-dropdown option:hover {
  background: #f9fafb;
}

/* My Complaints Section */
.my-complaints-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: #666;
}

.filter-tab.active {
  background: #AF1E23;
  color: white;
  border-color: #AF1E23;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .filter-tab:hover:not(.active) {
  background: #e5e7eb;
  border-color: #d1d5db;
} */

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.85rem;
}

/* Complaints List */
.complaints-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.complaint-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .complaint-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.15);
  transform: translateY(-2px);
} */

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.complaint-title-section {
  flex: 1;
  min-width: 0;
}

.complaint-title {
  margin: 0 0 3px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.complaint-category {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
  margin-left: 12px;
}

.status-badge.open {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.in-progress {
  background: #fed7aa;
  color: #ea580c;
}

.status-badge.resolved {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.complaint-preview {
  margin-bottom: 10px;
}

.complaint-preview p {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.complaint-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.complaint-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #9ca3af;
}

.complaint-arrow {
  color: #d1d5db;
  transition: color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .complaint-card:hover .complaint-arrow {
  color: #AF1E23;
} */

/* Button Styles */
.btn-primary {
  background: #AF1E23 !important;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .btn-primary:hover {
  background: #8B1A1E;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

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
  z-index: 999999;
  padding: 1rem;
}

/* When keyboard is open, align modal to top of visible area so it stays in view */
.modal-overlay.modal-overlay-keyboard-open {
  align-items: flex-start;
  padding-top: 1.5rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  transition: max-height 0.2s ease-out;
}

/* When keyboard is open, constrain modal height so it stays visible above the keyboard */
.modal-content.modal-keyboard-open {
  max-height: 52vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #AF1E23;
  background: #fff5f2;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.15);
}

.modal-title-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.modal-title-text p {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: #e2e8f0;
  color: #334155;
} */

.complaint-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

/* Mobile app - hover effects disabled */
/* .btn-primary:hover:not(:disabled) {
  background: #2563eb;
} */

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* File Upload Styles */
.file-upload-section {
  margin-top: 8px;
}

.file-input {
  display: none;
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Mobile app - hover effects disabled */
/* .file-upload-btn:hover {
  background: #f1f5f9;
  border-color: #AF1E23;
  color: #AF1E23;
} */

.file-preview {
  margin-top: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 32px;
  height: 32px;
  background: #AF1E23;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-file-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

/* Mobile app - hover effects disabled */
/* .remove-file-btn:hover {
  background: #e5e7eb;
  color: #374151;
} */

.image-preview {
  margin-top: 12px;
  border-radius: 6px;
  overflow: hidden;
  max-height: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* Mobile app - hover effects disabled */
/* .btn-secondary:hover {
  background: #e5e7eb;
} */

/* Responsive Design */
@media (min-width: 768px) {
  .complaints-page {
    padding: 0px;
  }

  .hero-section {
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .quick-complaints-section {
    margin-bottom: 24px;
  }

  .category-dropdown {
    font-size: 1.05rem;
    padding: 16px 18px;
  }

  .my-complaints-section {
    margin-bottom: 24px;
  }

  .complaints-list {
    gap: 12px;
  }

  .complaint-card {
    padding: 18px;
  }

  .complaint-title {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .complaints-page {
    padding: 0px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .category-dropdown {
    font-size: 1.1rem;
    padding: 18px 20px;
  }

  .complaint-card {
    padding: 20px;
  }

  .complaint-title {
    font-size: 1.05rem;
  }
}

@media (max-width: 640px) {
  .filter-tabs {
    gap: 0.25rem;
  }

  .filter-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
