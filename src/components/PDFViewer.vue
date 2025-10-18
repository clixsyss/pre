<template>
  <div class="pdf-viewer-overlay" @click="closeViewer" v-if="isOpen">
    <div class="pdf-viewer-container" @click.stop>
      <!-- Header -->
      <div class="pdf-header">
        <div class="pdf-title-section">
          <div class="pdf-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="pdf-info">
            <h3 class="pdf-title">{{ title || 'Project Guidelines' }}</h3>
            <p class="pdf-subtitle">{{ subtitle || 'View and download project guidelines' }}</p>
          </div>
        </div>
        
        <div class="pdf-actions">
          <button @click="downloadPDF" class="action-btn download-btn" :disabled="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 20 19 20H5C4.46957 20 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download PDF
          </button>
          
          <button @click="closeViewer" class="action-btn close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Close
          </button>
        </div>
      </div>

      <!-- PDF Content -->
      <div class="pdf-content">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Failed to Load PDF</h3>
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-btn">Try Again</button>
        </div>
        
        <div v-else class="pdf-iframe-container">
          <iframe
            :src="formattedPdfUrl"
            class="pdf-iframe"
            frameborder="0"
            @load="onPdfLoad"
            @error="onPdfError"
            title="PDF Viewer"
          ></iframe>
          
          <!-- Fallback for browsers that don't support PDF in iframe -->
          <div v-if="!loading && !error" class="pdf-fallback">
            <div class="fallback-content">
              <div class="fallback-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>PDF Viewer Not Supported</h3>
              <p>Your browser doesn't support PDF viewing in this window. You can still download or open the PDF in a new tab.</p>
              <div class="fallback-actions">
                <button @click="downloadPDF" class="fallback-btn primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 20 19 20H5C4.46957 20 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Download PDF
                </button>
                <button @click="openInNewTab" class="fallback-btn secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pdf-footer">
        <div class="pdf-meta">
          <span class="file-size" v-if="fileSize">{{ formatFileSize(fileSize) }}</span>
          <span class="file-type">PDF Document</span>
        </div>
        <div class="pdf-controls">
          <button @click="openInNewTab" class="control-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Open in New Tab
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(true)
const error = ref(null)
const loadTimeout = ref(null)

// Format PDF URL for better compatibility
const formattedPdfUrl = computed(() => {
  if (!props.pdfUrl) return ''
  
  // For Firebase Storage URLs, we need to handle them differently
  if (props.pdfUrl.includes('firebasestorage.googleapis.com')) {
    // Firebase Storage URLs work better without additional parameters
    return props.pdfUrl
  }
  
  // For other URLs, add parameters to help with PDF viewing
  try {
    const url = new URL(props.pdfUrl)
    url.searchParams.set('embedded', 'true')
    url.searchParams.set('toolbar', '1')
    url.searchParams.set('navpanes', '1')
    url.searchParams.set('scrollbar', '1')
    return url.toString()
  } catch {
    // If URL parsing fails, return original URL
    return props.pdfUrl
  }
})

const closeViewer = () => {
  emit('close')
}

const downloadPDF = () => {
  if (props.pdfUrl) {
    const link = document.createElement('a')
    link.href = props.pdfUrl
    link.download = props.title || 'project-guidelines.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const openInNewTab = () => {
  if (props.pdfUrl) {
    window.open(props.pdfUrl, '_blank')
  }
}

const onPdfLoad = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }
  loading.value = false
  error.value = null
}

const onPdfError = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }
  loading.value = false
  error.value = 'Failed to load PDF. The file may be corrupted or your browser may not support PDF viewing. Try downloading the file instead.'
}

const retryLoad = () => {
  loading.value = true
  error.value = null
  
  // Set a timeout to show error if PDF doesn't load within 10 seconds
  loadTimeout.value = setTimeout(() => {
    loading.value = false
    error.value = 'PDF is taking too long to load. Please check your internet connection or try downloading the file.'
  }, 10000)
  
  // Force reload by updating the iframe src
  const iframe = document.querySelector('.pdf-iframe')
  if (iframe) {
    iframe.src = formattedPdfUrl.value
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Watch for PDF URL changes
watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl && props.isOpen) {
    loading.value = true
    error.value = null
    
    // Set timeout for loading
    if (loadTimeout.value) {
      clearTimeout(loadTimeout.value)
    }
    loadTimeout.value = setTimeout(() => {
      loading.value = false
      error.value = 'PDF is taking too long to load. Please check your internet connection or try downloading the file.'
    }, 10000)
  }
})

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loading.value = true
    error.value = null
    
    // Set timeout for loading
    if (loadTimeout.value) {
      clearTimeout(loadTimeout.value)
    }
    loadTimeout.value = setTimeout(() => {
      loading.value = false
      error.value = 'PDF is taking too long to load. Please check your internet connection or try downloading the file.'
    }, 10000)
  } else {
    // Clear timeout when modal closes
    if (loadTimeout.value) {
      clearTimeout(loadTimeout.value)
      loadTimeout.value = null
    }
  }
})
</script>

<style scoped>
.pdf-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pdf-viewer-container {
  background: #F6F6F6;
  border-radius: 20px;
  width: 95%;
  height: 90%;
  max-width: 1200px;
  max-height: 800px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pdf-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.pdf-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.pdf-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.pdf-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.pdf-info {
  flex: 1;
}

.pdf-title {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.pdf-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.pdf-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  min-width: 120px;
  justify-content: center;
}

.download-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Mobile app - hover effects disabled */
/* .download-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
} */

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
} */

.pdf-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e1e5e9;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-container h3 {
  color: #dc3545;
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-container p {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 1rem;
}

.retry-btn {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Mobile app - hover effects disabled */
/* .retry-btn:hover {
  background: #991b1f;
} */

.pdf-iframe-container {
  flex: 1;
  position: relative;
  background: white;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.pdf-footer {
  background: #F6F6F6;
  padding: 16px 32px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pdf-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.file-size,
.file-type {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.file-size::after {
  content: '•';
  margin-left: 16px;
  color: #d1d5db;
}

.pdf-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .control-btn:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
} */

/* Responsive Design */
@media (max-width: 768px) {
  .pdf-viewer-container {
    width: 98%;
    height: 95%;
    border-radius: 16px;
  }
  
  .pdf-header {
    padding: 20px 24px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .pdf-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    min-width: auto;
  }
  
  .pdf-title {
    font-size: 1.25rem;
  }
  
  .pdf-subtitle {
    font-size: 0.875rem;
  }
  
  .pdf-footer {
    padding: 12px 24px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .pdf-meta {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .file-size::after {
    display: none;
  }
  
  .pdf-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
