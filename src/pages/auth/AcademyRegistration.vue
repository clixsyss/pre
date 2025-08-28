<template>
  <div class="academy-registration-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Program Registration</h1>
      </div>
      <p class="header-subtitle">Complete your registration for {{ program?.name }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading program details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="loadProgramDetails" class="retry-btn">Try Again</button>
    </div>

    <!-- Registration Form -->
    <div v-else-if="program && academy" class="registration-content">
      <!-- Program Summary -->
      <div class="program-summary">
        <h2 class="section-title">Program Summary</h2>
        <div class="summary-card">
          <div class="summary-header">
            <h3>{{ program.name }}</h3>
            <span class="academy-name">{{ academy.name }}</span>
          </div>
          <div class="summary-details">
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">{{ program.category || 'Sports' }}</span>
            </div>
            <div class="detail-row" v-if="program.ageGroup">
              <span class="label">Age Group:</span>
              <span class="value">{{ program.ageGroup }}</span>
            </div>
            <div class="detail-row" v-if="program.duration && (program.pricingType === 'per-month' || program.pricingType === 'per-week' || program.pricingType === 'per-term')">
              <span class="label">Duration:</span>
              <span class="value">{{ program.duration }} {{ getDurationUnit(program.pricingType) }}</span>
            </div>
            <div class="detail-row" v-if="program.maxCapacity">
              <span class="label">Max Capacity:</span>
              <span class="value">{{ program.maxCapacity }} students</span>
            </div>
            <div class="detail-row" v-if="program.price">
              <span class="label">Price:</span>
              <span class="value">${{ program.price }}{{ getPricingTypeLabel(program.pricingType) }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">Total Cost:</span>
              <span class="value">${{ totalCost }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <div class="registration-form">
        <h2 class="section-title">Registration Details</h2>
        <form @submit.prevent="submitRegistration">
          <div class="form-group">
            <label for="studentName">Student Name *</label>
            <input
              id="studentName"
              v-model="formData.studentName"
              type="text"
              required
              placeholder="Enter student's full name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="studentAge">Student Age *</label>
            <input
              id="studentAge"
              v-model="formData.studentAge"
              type="number"
              min="3"
              max="100"
              required
              placeholder="Enter student's age"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="parentName">Parent/Guardian Name *</label>
            <input
              id="parentName"
              v-model="formData.parentName"
              type="text"
              required
              placeholder="Enter parent/guardian name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              placeholder="Enter phone number"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter email address (optional)"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Any special requirements or notes..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="$router.go(-1)" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">Processing...</span>
              <span v-else>Complete Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';

// Component name for ESLint
defineOptions({
  name: 'AcademyRegistrationPage'
});

const router = useRouter();
const route = useRoute();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Reactive state
const loading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const academy = ref(null);
const program = ref(null);

// Form data
const formData = ref({
  studentName: '',
  studentAge: '',
  parentName: '',
  phone: '',
  email: '',
  notes: ''
});

// Computed properties
const currentProject = computed(() => projectStore.selectedProject);
const academyId = computed(() => route.params.academyId);
const programId = computed(() => route.params.programId);

const totalCost = computed(() => {
  if (!program.value?.price) return 0;
  
  // For one-time pricing, total is just the price
  if (program.value.pricingType === 'one-time') {
    return program.value.price;
  }
  
  // For per-session pricing, total is just the price (single session)
  if (program.value.pricingType === 'per-session') {
    return program.value.price;
  }
  
  // For recurring pricing (weekly, monthly, term), calculate total if duration exists
  if (program.value.duration && (program.value.pricingType === 'per-week' || program.value.pricingType === 'per-month' || program.value.pricingType === 'per-term')) {
    return program.value.price * program.value.duration;
  }
  
  // Default case: just show the price
  return program.value.price;
});

// Methods
const loadProgramDetails = async () => {
  if (!currentProject.value?.id || !academyId.value || !programId.value) {
    error.value = 'Missing required information';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch academies if not already loaded
    if (!academiesStore.academyOptions || academiesStore.academyOptions.length === 0) {
      await academiesStore.fetchAcademies(currentProject.value.id);
    }

    // Find the specific academy and program
    const foundAcademy = academiesStore.academyOptions.find(a => a.id === academyId.value);
    if (foundAcademy) {
      academy.value = foundAcademy;
      
      const foundProgram = foundAcademy.programs?.find(p => 
        p.id === programId.value || p.name === programId.value
      );
      
      if (foundProgram) {
        program.value = foundProgram;
      } else {
        error.value = 'Program not found';
      }
    } else {
      error.value = 'Academy not found';
    }
  } catch (err) {
    console.error('Error loading program details:', err);
    error.value = 'Failed to load program details. Please try again.';
  } finally {
    loading.value = false;
  }
};

const submitRegistration = async () => {
  if (!academy.value || !program.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Here you would typically submit the registration to your backend
    // For now, we'll just show a success message and redirect
    
    console.log('Registration submitted:', {
      academy: academy.value.name,
      program: program.value.name,
      formData: formData.value,
      projectId: currentProject.value.id
    });
    
    // Redirect to success page or show success message
    alert('Registration submitted successfully!');
    router.push('/academy-programs');
    
  } catch (err) {
    console.error('Error submitting registration:', err);
    error.value = 'Failed to submit registration. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const getPricingTypeLabel = (pricingType) => {
  const labels = {
    'per-session': '/session',
    'per-week': '/week',
    'per-month': '/month',
    'per-term': '/term',
    'one-time': ' one-time'
  };
  return labels[pricingType] || '/month';
};

const getDurationUnit = (pricingType) => {
  const units = {
    'per-week': 'weeks',
    'per-month': 'months',
    'per-term': 'terms'
  };
  return units[pricingType] || 'months';
};

// Lifecycle
onMounted(() => {
  if (currentProject.value?.id && academyId.value && programId.value) {
    loadProgramDetails();
  } else {
    error.value = 'Missing required information. Please select a project first.';
  }
});
</script>

<style scoped>
.academy-registration-page {
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.registration-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.program-summary,
.registration-form {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.summary-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.summary-header {
  margin-bottom: 16px;
}

.summary-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.academy-name {
  color: #666;
  font-size: 0.9rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: #333;
  border-top: 2px solid #e1e5e9;
  border-bottom: none;
  padding-top: 12px;
  margin-top: 8px;
}

.detail-row .label {
  color: #666;
  font-weight: 500;
}

.detail-row .value {
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #333;
}

.submit-btn {
  background: #ff6b35;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #e55a2b;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Loading and Error States */
.loading-state,
.error-state {
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
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.error-state h3 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.error-state p {
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.retry-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #e55a2b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .academy-registration-page {
    padding: 16px 0;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .program-summary,
  .registration-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .program-summary,
  .registration-form {
    padding: 16px;
  }
  
  .summary-card {
    padding: 16px;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
