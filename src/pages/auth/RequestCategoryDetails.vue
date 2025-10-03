<template>
  <div class="request-category-details">

    <PageHeader
      :title="category?.englishTitle || 'Request Category'"
      :subtitle="category?.description || 'Submit your request'"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading request form...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadCategory" class="retry-btn">Retry</button>
    </div>

    <!-- Request Form -->
    <div v-else-if="category" class="request-form-container">
      <form @submit.prevent="submitRequest" class="request-form">
        <!-- Category Description -->
        <div v-if="category.description" class="description-section">
          <p>{{ category.description }}</p>
        </div>

        <!-- Dynamic Form Fields -->
        <div class="form-fields">
          <h3>Request Details</h3>
          
          <div v-for="field in category.fields" :key="field.id" class="field-group">
            <label :for="field.id" class="field-label">
              {{ field.fieldName }}
              <span v-if="field.required" class="required">*</span>
            </label>
            
            <!-- Text Input -->
            <input
              v-if="field.fieldType === 'text'"
              :id="field.id"
              v-model="formData[field.id]"
              type="text"
              :placeholder="field.placeholder || `Enter ${field.fieldName.toLowerCase()}`"
              :required="field.required"
              class="field-input"
            />
            
            <!-- Number Input -->
            <input
              v-else-if="field.fieldType === 'number'"
              :id="field.id"
              v-model="formData[field.id]"
              type="number"
              :placeholder="field.placeholder || `Enter ${field.fieldName.toLowerCase()}`"
              :required="field.required"
              class="field-input"
            />
            
            <!-- Currency Input -->
            <div v-else-if="field.fieldType === 'currency'" class="currency-input">
              <span class="currency-symbol">EGP</span>
              <input
                :id="field.id"
                v-model="formData[field.id]"
                type="number"
                step="0.01"
                :placeholder="field.placeholder || '0.00'"
                :required="field.required"
                class="field-input currency-field"
              />
            </div>
            
            <!-- Description (Long Text) -->
            <textarea
              v-else-if="field.fieldType === 'description'"
              :id="field.id"
              v-model="formData[field.id]"
              :placeholder="field.placeholder || `Enter ${field.fieldName.toLowerCase()}`"
              :required="field.required"
              rows="4"
              class="field-textarea"
            ></textarea>
          </div>
        </div>

        <!-- Media Upload Section -->
        <div v-if="category.allowMediaUpload" class="media-upload-section">
          <h3>Attachments</h3>
          <p class="media-description">Upload files or images to support your request</p>
          
          <div class="file-upload-area" @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt"
              @change="handleFileSelect"
              class="file-input"
            />
            <div class="upload-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="upload-text">Tap to upload files or drag and drop</p>
              <p class="upload-hint">Images, PDFs, and documents supported</p>
            </div>
          </div>

          <!-- Selected Files -->
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <h4>Selected Files ({{ selectedFiles.length }})</h4>
            <div class="file-list">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <div class="file-info">
                  <svg v-if="file.type.startsWith('image/')" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                    <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                </div>
                <button @click="removeFile(index)" type="button" class="remove-file-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="submit" :disabled="submitting" class="submit-btn">
            <div v-if="submitting" class="loading-spinner small"></div>
            <span>{{ submitting ? 'Submitting...' : 'Submit Request' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRequestCategoriesStore } from '../../stores/requestCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';
import optimizedAuthService from '../../services/optimizedAuthService';
import requestSubmissionService from '../../services/requestSubmissionService';
import PageHeader from '../../components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'RequestCategoryDetails'
});

const route = useRoute();
const router = useRouter();
const requestCategoriesStore = useRequestCategoriesStore();
const projectStore = useProjectStore();

// State
const category = ref(null);
const loading = ref(false);
const error = ref(null);
const submitting = ref(false);
const formData = ref({});
const selectedFiles = ref([]);

// Computed
const categoryId = computed(() => route.params.id);

// Load category
onMounted(async () => {
  await loadCategory();
});

const loadCategory = async () => {
  if (!projectStore.selectedProject?.id || !categoryId.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    // Load categories first
    await requestCategoriesStore.fetchCategories(projectStore.selectedProject.id);
    
    // Find the specific category
    category.value = requestCategoriesStore.getCategories.find(cat => cat.id === categoryId.value);
    
    if (!category.value) {
      error.value = 'Request category not found';
      return;
    }
    
    // Initialize form data
    initializeFormData();
  } catch (err) {
    console.error('Error loading category:', err);
    error.value = err.message || 'Failed to load request category';
  } finally {
    loading.value = false;
  }
};

const initializeFormData = () => {
  if (!category.value?.fields) return;
  
  const initialData = {};
  category.value.fields.forEach(field => {
    initialData[field.id] = '';
  });
  formData.value = initialData;
};

// File handling
const fileInput = ref(null);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addFiles(files);
};

const handleFileDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
};

const addFiles = (files) => {
  const validFiles = files.filter(file => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert(`File type ${file.type} is not supported.`);
      return false;
    }
    
    return true;
  });
  
  selectedFiles.value = [...selectedFiles.value, ...validFiles];
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Form submission
const submitRequest = async () => {
  if (!category.value) return;
  
  try {
    submitting.value = true;
    
    // Validate required fields
    const missingFields = [];
    category.value.fields.forEach(field => {
      if (field.required && (!formData.value[field.id] || formData.value[field.id].trim() === '')) {
        missingFields.push(field.fieldName);
      }
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Get current user
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      alert('You must be logged in to submit a request');
      return;
    }
    
    // Prepare submission data
    const submissionData = {
      categoryId: category.value.id,
      categoryName: category.value.englishTitle,
      userId: user.uid,
      userName: user.displayName || 'Unknown User',
      userEmail: user.email,
      userPhone: user.phoneNumber || '',
      formData: formData.value,
      mediaFiles: selectedFiles.value.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      status: 'pending',
      createdAt: new Date(),
      projectId: projectStore.selectedProject.id
    };
    
    // Submit the request
    await requestSubmissionService.submitRequest(submissionData, selectedFiles.value);
    
    // Show success message
    alert('Your request has been submitted successfully!');
    
    // Navigate back
    router.push('/facilities');
    
  } catch (err) {
    console.error('Error submitting request:', err);
    alert('Failed to submit request. Please try again.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.request-category-details {
  background: #fafafa;
  min-height: 100vh;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 20px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.header-text p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.header-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Loading and Error States */
.loading-container,
.error-container {
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
  border: 4px solid #f3f4f6;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin: 20px;
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

.retry-btn:hover {
  background: #8B1A1E;
}

/* Request Form */
.request-form-container {
  max-width: 600px;
  margin: 0 auto;
}

.request-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.description-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.description-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.description-section p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.form-fields h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.currency-input {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.currency-symbol {
  background: #f9fafb;
  padding: 12px 16px;
  border-right: 1px solid #d1d5db;
  font-weight: 500;
  color: #6b7280;
}

.currency-field {
  border: none;
  border-radius: 0;
}

.currency-field:focus {
  box-shadow: none;
  border-color: transparent;
}

/* Media Upload */
.media-upload-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.media-upload-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.media-description {
  color: #666;
  font-size: 0.875rem;
  margin: 0 0 16px 0;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.file-upload-area:hover {
  border-color: #AF1E23;
  background-color: #fef7f7;
}

.file-input {
  display: none;
}

.upload-content {
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  margin: 12px 0 4px 0;
}

.upload-hint {
  font-size: 0.875rem;
  margin: 0;
}

.selected-files {
  margin-top: 20px;
}

.selected-files h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.file-list {
  /* space-y: 8px; - handled by margin-bottom on .file-item */
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-file-btn:hover {
  background: #fef2f2;
}

/* Form Actions */
.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.submit-btn {
  width: 100%;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #8B1A1E;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (min-width: 768px) {
  .request-form-container {
    padding: 0 40px 40px;
  }
  
  .request-form {
    padding: 32px;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-image {
    width: 80px;
    height: 80px;
  }
}
</style>
