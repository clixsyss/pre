<template>
  <div v-if="isOpen" class="guidelines-overlay" @click="closeDialog">
    <div class="guidelines-dialog" @click.stop>
      <!-- Header -->
      <div class="guidelines-header">
        <div class="header-content">
          <h2 class="guidelines-title">Project Guidelines</h2>
          <p class="guidelines-subtitle">Important rules and procedures for our community</p>
        </div>
        <!-- <button @click="closeDialog" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button> -->
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

      <!-- Guidelines Content -->
      <div v-else class="guidelines-content">
        <!-- PDF Guidelines Section -->
        <div v-if="pdfGuidelines.length > 0" class="pdf-guidelines-section">
          <h4 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            PDF Guidelines
          </h4>
          
          <div class="pdf-guidelines-list">
            <div 
              v-for="pdfGuideline in pdfGuidelines" 
              :key="pdfGuideline.id" 
              class="pdf-guideline-card"
              @click="openPDFViewer(pdfGuideline)"
            >
              <div class="pdf-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="pdf-info">
                <h5 class="pdf-title">{{ pdfGuideline.title }}</h5>
                <p class="pdf-description">{{ pdfGuideline.description || 'Project guidelines document' }}</p>
                <div class="pdf-meta">
                  <span class="pdf-size" v-if="pdfGuideline.fileSize">{{ formatFileSize(pdfGuideline.fileSize) }}</span>
                  <span class="pdf-date">{{ formatDate(pdfGuideline.createdAt) }}</span>
                </div>
              </div>
              <div class="pdf-actions">
                <button @click.stop="downloadPDF(pdfGuideline)" class="download-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 20 19 20H5C4.46957 20 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Text Guidelines Section -->
        <div v-if="textGuidelines.length > 0" class="text-guidelines-section">
          <h4 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Text Guidelines
          </h4>
          
          <div class="guidelines-articles">
            <article 
              v-for="guideline in textGuidelines" 
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

        <!-- Empty State -->
        <div v-if="pdfGuidelines.length === 0 && textGuidelines.length === 0" class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No guidelines available</h3>
          <p>No guidelines have been added for this project yet.</p>
        </div>
      </div>
    </div>

    <!-- PDF Viewer Modal -->
    <PDFViewer
      :isOpen="showPDFViewer"
      :pdfUrl="selectedPDF?.fileUrl"
      :title="selectedPDF?.title"
      :subtitle="selectedPDF?.description"
      :fileSize="selectedPDF?.fileSize"
      @close="closePDFViewer"
    />
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { useProjectGuidelinesStore } from '../stores/projectGuidelinesStore';
import { useProjectStore } from '../stores/projectStore';
import PDFViewer from './PDFViewer.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const projectStore = useProjectStore();
const guidelinesStore = useProjectGuidelinesStore();

// PDF Viewer state
const showPDFViewer = ref(false);
const selectedPDF = ref(null);

const loading = computed(() => guidelinesStore.isLoading);
const error = computed(() => guidelinesStore.getError);
const guidelines = computed(() => guidelinesStore.getGuidelines);
const pdfGuidelines = computed(() => guidelinesStore.pdfGuidelinesList);

// Separate text guidelines from PDF guidelines
const textGuidelines = computed(() => {
  return guidelines.value.filter(guideline => guideline.type !== 'pdf');
});

const closeDialog = () => {
  emit('close');
};

const fetchGuidelines = async () => {
  const currentProjectId = projectStore.selectedProject?.id;
  if (currentProjectId) {
    await Promise.all([
      guidelinesStore.fetchGuidelines(currentProjectId),
      guidelinesStore.fetchPDFGuidelines(currentProjectId)
    ]);
  }
};

const openPDFViewer = (pdfGuideline) => {
  selectedPDF.value = pdfGuideline;
  showPDFViewer.value = true;
};

const closePDFViewer = () => {
  showPDFViewer.value = false;
  selectedPDF.value = null;
};

const downloadPDF = (pdfGuideline) => {
  if (pdfGuideline.fileUrl) {
    const link = document.createElement('a');
    link.href = pdfGuideline.fileUrl;
    link.download = pdfGuideline.title || 'project-guidelines.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const formatContent = (content) => {
  if (!content) return '';
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (err) {
    console.warn('Error formatting date:', err);
    return '';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Watch for dialog open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchGuidelines();
  }
});

// Watch for project changes
watch(() => projectStore.selectedProject?.id, (newProjectId) => {
  if (newProjectId && props.isOpen) {
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.guidelines-dialog {
  background: #F6F6F6;
  border-radius: 20px;
  width: 90%;
  height: auto;
  max-width: 1000px;
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

.guidelines-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.guidelines-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.header-content {
  flex: 1;
}

.guidelines-title {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.guidelines-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.guidelines-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #fafafa;
}

/* PDF Guidelines Section */
.pdf-guidelines-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
}

.section-title svg {
  color: #AF1E23;
}

.pdf-guidelines-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pdf-guideline-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pdf-guideline-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.1);
  transform: translateY(-2px);
}

.pdf-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.pdf-info {
  flex: 1;
  min-width: 0;
}

.pdf-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.pdf-description {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.pdf-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pdf-size,
.pdf-date {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
}

.pdf-size::after {
  content: '•';
  margin-left: 16px;
  color: #d1d5db;
}

.pdf-actions {
  display: flex;
  gap: 8px;
}

.download-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
}

/* Text Guidelines Section */
.text-guidelines-section {
  margin-bottom: 32px;
}

.guidelines-articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.guideline-article {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.article-title {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.article-content {
  color: #374151;
  line-height: 1.6;
}

.content-text {
  font-size: 0.95rem;
}

/* Loading and Error States */
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

.retry-btn:hover {
  background: #991b1f;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #111827;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .guidelines-dialog {
    width: 90%;
    height: auto;
    border-radius: 16px;
  }
  
  .guidelines-header {
    padding: 20px 12px;
  }
  
  .guidelines-content {
    padding: 20px 12px;
  }
  
  .pdf-guideline-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pdf-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .pdf-meta {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .pdf-size::after {
    display: none;
  }
}
</style>