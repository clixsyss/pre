<template>
  <div class="request-category-details">

    <PageHeader
      :title="category?.englishTitle || $t('requestCategory')"
      :subtitle="category?.description || $t('submitYourRequest')"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingRequestForm') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadCategory" class="retry-btn">{{ $t('retry') }}</button>
    </div>

    <!-- Request Form -->
    <div v-else-if="category" class="request-form-container">
      <form @submit.prevent="submitRequest" class="request-form">
        
        <!-- Dynamic Form Fields -->
        <div class="form-fields">
          <h3>{{ $t('requestDetails') }}</h3>
          
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
            
            <!-- Phone Number Input -->
            <input
              v-else-if="field.fieldType === 'phone'"
              :id="field.id"
              v-model="formData[field.id]"
              type="tel"
              :placeholder="field.placeholder || `Enter ${field.fieldName.toLowerCase()}`"
              :required="field.required"
              class="field-input"
            />
            
            <!-- Email Input -->
            <input
              v-else-if="field.fieldType === 'email'"
              :id="field.id"
              v-model="formData[field.id]"
              type="email"
              :placeholder="field.placeholder || `Enter ${field.fieldName.toLowerCase()}`"
              :required="field.required"
              class="field-input"
            />
            
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
          
          <!-- Simple Upload Button -->
          <div class="upload-section">
            <button 
              type="button" 
              @click="showUploadOptions = !showUploadOptions"
              class="upload-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Add Files
            </button>

            <!-- Upload Options Dropdown -->
            <div v-if="showUploadOptions" class="upload-options">
              <button type="button" @click="triggerImageLibrary" class="upload-option">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                </svg>
                Choose from Library
              </button>
              <button type="button" @click="triggerFileUpload" class="upload-option">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Choose Files
              </button>
              <button type="button" @click="triggerCameraUpload" class="upload-option">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                Take Photo
              </button>
            </div>

            <!-- Hidden file inputs -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt,.heic,.heif"
              @change="handleFileSelect"
              class="file-input"
              style="display: none;"
            />
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
              style="display: none;"
            />
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              @change="handleFileSelect"
              class="file-input"
              style="display: none;"
            />
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
            <span>{{ submitting ? 'Uploading files...' : 'Submit Request' }}</span>
          </button>
          <div v-if="submitting" class="upload-progress">
            <p>Please wait while we process and upload your files...</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p class="upload-note">Large images are automatically compressed for faster upload</p>
            <!-- <button type="button" @click="submitWithoutFiles" class="skip-files-btn">
              Skip file upload and submit without files
            </button> -->
          </div>
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
const showUploadOptions = ref(false);

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
  if (!category.value?.fields) {
    console.warn('No fields found in category');
    return;
  }
  
  console.log('🔧 Initializing form data for fields:', category.value.fields.map(f => f.id));
  
  const initialData = {};
  category.value.fields.forEach(field => {
    initialData[field.id] = '';
  });
  formData.value = initialData;
  
  console.log('✅ Form data initialized:', formData.value);
};

// File handling
const fileInput = ref(null);
const imageInput = ref(null);
const cameraInput = ref(null);

const triggerFileUpload = () => {
  try {
    console.log('📁 Triggering file picker');
    showUploadOptions.value = false;
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      console.error('File input not found');
    }
  } catch (error) {
    console.error('Error triggering file upload:', error);
  }
};

const triggerImageLibrary = () => {
  try {
    console.log('🖼️ Triggering image library');
    showUploadOptions.value = false;
    if (imageInput.value) {
      imageInput.value.click();
    } else {
      console.error('Image input not found');
    }
  } catch (error) {
    console.error('Error triggering image library:', error);
  }
};

const triggerCameraUpload = () => {
  try {
    console.log('📷 Triggering camera');
    showUploadOptions.value = false;
    if (cameraInput.value) {
      cameraInput.value.click();
    } else {
      console.error('Camera input not found');
    }
  } catch (error) {
    console.error('Error triggering camera:', error);
  }
};

const handleFileSelect = (event) => {
  try {
    console.log('📁 File selection event triggered');
    
    if (!event.target || !event.target.files) {
      console.warn('No files in event target');
      return;
    }
    
    const files = Array.from(event.target.files);
    console.log('📁 Files selected:', files.length, files.map(f => f.name));
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    addFiles(files);
    
    // Reset the input to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  } catch (error) {
    console.error('❌ Error handling file selection:', error);
    alert('Error selecting files. Please try again.');
  }
};


const addFiles = async (files) => {
  try {
    console.log('📁 Processing files:', files.length);
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn('No files to process');
      return;
    }
    
    const { Capacitor } = await import('@capacitor/core')
    const isNative = Capacitor.isNativePlatform();
    const maxSize = isNative ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for native, 10MB for web
    const platform = Capacitor.getPlatform();
    
    const validFiles = []
    for (const file of files) {
      try {
        // Basic file validation
        if (!file || !file.name) {
          console.warn('Invalid file object');
          continue;
        }
        
        // Native platforms: Larger file size limit and more lenient validation
        const allowedTypes = [
          'image/jpeg', 
          'image/jpg', 
          'image/png', 
          'image/gif', 
          'image/webp',
          'image/heic', // Native iOS/Android HEIC format
          'image/heif', // Native iOS/Android HEIF format
          'application/pdf', 
          'text/plain', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        // Check file size
        if (file.size > maxSize) {
          console.warn(`File ${file.name} is too large: ${file.size} bytes`);
          const maxSizeMB = Math.round(maxSize / 1024 / 1024);
          alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
          continue;
        }
        
        // Check file type (be more lenient for native platforms)
        const fileType = file.type || '';
        const fileName = file.name.toLowerCase();
        const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(fileName);
        const isDocument = allowedTypes.includes(fileType) || /\.(pdf|doc|docx|txt)$/i.test(fileName);
        
        // Native platforms: More lenient file type checking
        if (isNative && !fileType && fileName) {
          console.log(`📱 ${platform}: File type not detected for ${file.name}, using filename extension`);
        }
        
        if (!isImage && !isDocument) {
          console.warn(`File type not supported: ${fileType} for file ${file.name}`);
          alert(`File type not supported for ${file.name}. Please use images, PDF, or document files.`);
          continue;
        }
        
        console.log(`✅ File ${file.name} is valid`);
        validFiles.push(file);
      } catch (fileError) {
        console.error(`Error validating file ${file.name}:`, fileError);
      }
    }
    
    if (validFiles.length > 0) {
      selectedFiles.value = [...selectedFiles.value, ...validFiles];
      console.log(`✅ Added ${validFiles.length} valid files`);
    }
    
    if (validFiles.length !== files.length) {
      console.warn(`⚠️ ${files.length - validFiles.length} files were rejected`);
    }
    
  } catch (error) {
    console.error('❌ Error processing files:', error);
    alert('Error processing files. Please try again.');
  }
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
  if (!category.value) {
    console.error('No category found');
    return;
  }
  
  try {
    submitting.value = true;
    console.log('🚀 Starting request submission...');
    console.log('📋 Current form data:', formData.value);
    console.log('📋 Category fields:', category.value.fields);
    
    // Validate required fields
    const missingFields = [];
    category.value.fields.forEach(field => {
      const fieldValue = formData.value[field.id];
      console.log(`🔍 Checking field ${field.id} (${field.fieldName}):`, fieldValue, 'Type:', typeof fieldValue, 'Required:', field.required);
      
      if (field.required && (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '') || fieldValue === null || fieldValue === undefined)) {
        missingFields.push(field.fieldName);
      }
    });
    
    if (missingFields.length > 0) {
      console.warn('Missing required fields:', missingFields);
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Get current user
    console.log('🔐 Getting current user...');
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('No user found');
      alert('You must be logged in to submit a request');
      return;
    }
    console.log('✅ User found:', user.uid);
    
    // Check project
    if (!projectStore.selectedProject?.id) {
      console.error('No project selected');
      alert('No project selected. Please try again.');
      return;
    }
    console.log('✅ Project found:', projectStore.selectedProject.id);
    
    // Clean and prepare form data
    const cleanedFormData = {};
    category.value.fields.forEach(field => {
      const value = formData.value[field.id];
      // Ensure all values are properly handled
      if (value === null || value === undefined) {
        cleanedFormData[field.id] = '';
      } else if (typeof value === 'string') {
        cleanedFormData[field.id] = value.trim();
      } else {
        cleanedFormData[field.id] = String(value);
      }
    });
    
    console.log('🧹 Cleaned form data:', cleanedFormData);
    
    // Prepare submission data
    const submissionData = {
      categoryId: category.value.id,
      categoryName: category.value.englishTitle,
      userId: user.uid,
      userName: user.displayName || 'Unknown User',
      userEmail: user.email,
      userPhone: user.phoneNumber || '',
      formData: cleanedFormData,
      // Add field metadata for admin dashboard display
      fieldMetadata: category.value.fields.map(field => ({
        id: field.id,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        required: field.required,
        placeholder: field.placeholder
      })),
      mediaFiles: selectedFiles.value.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      status: 'pending',
      createdAt: new Date(),
      projectId: projectStore.selectedProject.id
    };
    
    console.log('📝 Submission data prepared:', submissionData);
    console.log('📝 Field metadata:', submissionData.fieldMetadata);
    console.log('📝 Category fields:', category.value.fields);
    console.log('📁 Files to upload:', selectedFiles.value.length);
    
    // Submit the request
    const submissionId = await requestSubmissionService.submitRequest(submissionData, selectedFiles.value);
    console.log('✅ Request submitted successfully with ID:', submissionId);
    
    // iOS-specific: Additional success verification
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('📱 iOS: Request submission completed successfully');
      console.log('📱 iOS: Submission ID:', submissionId);
      console.log('📱 iOS: Category:', submissionData.categoryName);
      console.log('📱 iOS: User:', submissionData.userName);
    }
    
    // Show success message
    alert('Your request has been submitted successfully!');
    
    // Navigate back
    router.push('/facilities');
    
  } catch (err) {
    console.error('❌ Error submitting request:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    alert(`Failed to submit request: ${err.message || 'Please try again.'}`);
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
  position: relative;
}

.file-upload-area:hover {
  border-color: #AF1E23;
  background-color: #fef7f7;
}

.file-input {
  display: none;
}

/* New Upload Button Styles */
.upload-section {
  position: relative;
  margin-bottom: 16px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background: #8b1619;
}

.upload-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 4px;
}

.upload-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-option:hover {
  background: #f9fafb;
}

.upload-option:first-child {
  border-radius: 8px 8px 0 0;
}

.upload-option:last-child {
  border-radius: 0 0 8px 8px;
}

.upload-content {
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.camera-btn {
  background-color: #059669;
}

.camera-btn:hover {
  background-color: #047857;
}

.upload-hint {
  font-size: 0.875rem;
  margin: 0 0 16px 0;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.unified-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #AF1E23;
  border: 1px solid #AF1E23;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.unified-upload-btn:hover {
  background-color: #8b161a;
  border-color: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

.upload-progress {
  margin-top: 16px;
  text-align: center;
}

.upload-progress p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 12px 0;
}

.upload-note {
  color: #9ca3af !important;
  font-size: 0.75rem !important;
  margin: 8px 0 0 0 !important;
  font-style: italic;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #AF1E23;
  border-radius: 2px;
  animation: progress-animation 2s ease-in-out infinite;
}

@keyframes progress-animation {
  0% {
    width: 0%;
    transform: translateX(-100%);
  }
  50% {
    width: 100%;
    transform: translateX(0%);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

/* .skip-files-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-files-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
} */

.selected-files {
  margin-top: 20px;
}

.selected-files h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
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
