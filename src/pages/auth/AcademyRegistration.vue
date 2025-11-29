<template>
  <div class="academy-registration-page">

    <PageHeader :title="$t('programRegistration')" :subtitle="$t('completeRegistrationFor') + program?.name" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingProgramDetails') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ $t('somethingWentWrong') }}</h3>
      <p>{{ error }}</p>
      <button @click="loadProgramDetails" class="retry-btn">{{ $t('tryAgain') }}</button>
    </div>

    <!-- Registration Form -->
    <div v-else-if="program && academy" class="registration-content">
      <!-- Program Summary - COMPACT -->
      <div class="program-summary-modern">
        <div class="summary-hero">
          <div class="hero-left">
            <div class="program-badge">{{ program.category || 'Sports' }}</div>
            <h3>{{ program.name }}</h3>
            <div class="academy-tag">📍 {{ academy.name }}</div>
          </div>
          <div class="price-hero">
            <div class="total-price">{{ totalCost }} {{ $t('currency') }}</div>
            <div class="price-note">{{ $t('totalCost') }}</div>
          </div>
        </div>
        
        <!-- Quick Details -->
        <div class="summary-pills">
          <span v-if="program.ageGroup" class="sum-pill">{{ program.ageGroup }}</span>
          <span v-if="program.duration && (program.pricingType === 'per-month' || program.pricingType === 'per-week' || program.pricingType === 'per-term')" class="sum-pill">
            ⏱️ {{ program.duration }} {{ getDurationUnit(program.pricingType) }}
          </span>
          <span v-if="program.maxCapacity" class="sum-pill">{{ program.maxCapacity }} {{ program.maxCapacity === 1 ? $t('spot') : $t('spots') }}</span>
        </div>
      </div>

      <!-- Registration Form -->
      <div class="registration-form">
        <h2 class="section-title">{{ $t('registrationDetails') }}</h2>
        <form @submit.prevent="submitRegistration">
          <div class="form-group">
            <label for="studentName">{{ $t('studentName') }} *</label>
            <input
              id="studentName"
              v-model="formData.studentName"
              type="text"
              required
              :placeholder="$t('enterStudentName')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="studentAge">{{ $t('studentAge') }} *</label>
            <input
              id="studentAge"
              v-model="formData.studentAge"
              type="number"
              min="3"
              max="100"
              required
              :placeholder="$t('enterStudentAge')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="parentName">{{ $t('parentGuardianName') }} *</label>
            <input
              id="parentName"
              v-model="formData.parentName"
              type="text"
              required
              :placeholder="$t('enterParentName')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="phone">{{ $t('phoneNumber') }} *</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              :placeholder="$t('enterPhoneNumber')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">{{ $t('emailAddress') }}</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :placeholder="$t('enterEmailOptional')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="notes">{{ $t('additionalNotes') }}</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              :placeholder="$t('specialRequirements')"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="$router.go(-1)" class="cancel-btn" :disabled="isSubmitting">
              {{ $t('cancel') }}
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <div class="button-loading">
                  <div class="spinner"></div>
                  {{ $t('processing') }}
                </div>
              </span>
              <span v-else>{{ $t('completeRegistration') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        <div class="success-icon">✅</div>
        <h3>{{ $t('registrationSuccessful') }}</h3>
        <p>{{ $t('academyRegistrationSubmitted') }}</p>
        <div class="registration-details">
          <p><strong>{{ $t('registrationID') }}:</strong> {{ registrationId }}</p>
          <p><strong>{{ $t('program') }}:</strong> {{ program.name }}</p>
          <p><strong>{{ $t('academyTitle') }}:</strong> {{ academy.name }}</p>
          <p><strong>{{ $t('student') }}:</strong> {{ formData.studentName }}</p>
        </div>
        <p class="redirect-notice">{{ $t('redirectNotice') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFormKeyboard } from 'src/composables/useFormKeyboard';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';
import { serverTimestamp } from 'firebase/firestore';
import optimizedAuthService from 'src/services/optimizedAuthService';
import firestoreService from 'src/services/firestoreService';
import PageHeader from 'src/components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'AcademyRegistrationPage'
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
});

// Reactive state
const loading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const success = ref(false);
const registrationId = ref(null);
const academy = ref(null);
const program = ref(null);

// User ID is now obtained from authenticated user via optimizedAuthService

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
  if (!academy.value || !program.value || !currentProject.value?.id) {
    error.value = 'Missing required information';
    return;
  }
  
  // Validate required form fields
  if (!formData.value.studentName.trim()) {
    error.value = 'Student name is required';
    return;
  }
  
  if (!formData.value.studentAge || formData.value.studentAge < 3 || formData.value.studentAge > 100) {
    error.value = 'Please enter a valid student age (3-100)';
    return;
  }
  
  if (!formData.value.parentName.trim()) {
    error.value = 'Parent/Guardian name is required';
    return;
  }
  
  if (!formData.value.phone.trim()) {
    error.value = 'Phone number is required';
    return;
  }
  
  isSubmitting.value = true;
  error.value = null;
  
  try {
    // Get authenticated user
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      error.value = 'Please log in to register for academy programs.';
      return;
    }
    
    // Create the registration data
    const registrationData = {
      userId: user.uid,
      projectId: currentProject.value.id,
      academyId: academy.value.id,
      academyName: academy.value.name,
      programId: program.value.id,
      programName: program.value.name,
      type: 'academy',
      status: 'pending', // pending, confirmed, cancelled, completed
      
      // Student information
      studentName: formData.value.studentName,
      studentAge: parseInt(formData.value.studentAge),
      parentName: formData.value.parentName,
      phone: formData.value.phone,
      email: formData.value.email,
      notes: formData.value.notes,
      
      // Program details
      category: program.value.category || 'Sports',
      ageGroup: program.value.ageGroup,
      duration: program.value.duration,
      pricingType: program.value.pricingType,
      price: program.value.price,
      totalCost: totalCost.value,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Save to the project's bookings collection using firestoreService
    const collectionPath = `projects/${currentProject.value.id}/bookings`;
    const result = await firestoreService.addDoc(collectionPath, registrationData);
    
    console.log('🔍 Academy registration addDoc result:', result);
    const bookingId = result.id || result.documentId || result;
    
    if (!bookingId) {
      console.error('❌ No booking ID returned from addDoc:', result);
      throw new Error('Failed to create academy registration - no ID returned');
    }
    
    // Wait a bit to ensure Firestore has committed the write
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh the academy store to show the new booking
    await academiesStore.fetchUserBookings(user.uid, currentProject.value.id);
    
    // Set success state
    registrationId.value = bookingId;
    success.value = true;
    
    // Don't redirect immediately, show success message first
    setTimeout(() => {
      router.push('/academy-programs');
    }, 2500);
    
  } catch (err) {
    console.error('Error submitting registration:', err);
    error.value = t('failedToSubmitRegistration') + ' Error: ' + err.message;
  } finally {
    isSubmitting.value = false;
  }
};

const getDurationUnit = (pricingType) => {
  const units = {
    'per-week': t('weeks'),
    'per-month': t('months'),
    'per-term': t('terms')
  };
  return units[pricingType] || t('months');
};

// Lifecycle
onMounted(() => {
  if (currentProject.value?.id && academyId.value && programId.value) {
    loadProgramDetails();
  } else {
    error.value = t('missingInfoSelectProject');
  }
});
</script>

<style scoped>
.academy-registration-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 200px;
  /* Enable scrolling for keyboard visibility */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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

/* Mobile app - hover effects disabled */
/* .back-button:hover {
  background: #f5f5f5;
  color: #333;
} */

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

/* Modern Compact Summary */
.program-summary-modern {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.summary-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
}

.hero-left {
  flex: 1;
}

.program-badge {
  display: inline-block;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-left h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.academy-tag {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.price-hero {
  text-align: right;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 12px 20px;
  border-radius: 16px;
  border: 2px solid #fbbf24;
}

.total-price {
  font-size: 1.75rem;
  font-weight: 900;
  color: #78350f;
  line-height: 1;
  margin-bottom: 4px;
}

.price-note {
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sum-pill {
  background: #f1f5f9;
  color: #475569;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

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
  /* iOS keyboard improvements */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #AF1E23;
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

/* Mobile app - hover effects disabled */
/* .cancel-btn:hover {
  background: #e9ecef;
  color: #333;
} */

.submit-btn {
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

/* Mobile app - hover effects disabled */
/* .submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.4);
} */

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  border-top: 3px solid #AF1E23;
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
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .retry-btn:hover {
  background: #AF1E23;
} */

/* Success Message */
.success-message {
  background: white;
  border: 1px solid #28a745;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  margin-top: 32px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message h3 {
  color: #28a745;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.success-message p {
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.registration-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.registration-details p {
  margin: 8px 0;
  color: #333;
}

.redirect-notice {
  color: #28a745;
  font-style: italic;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .academy-registration-page {
    padding: 16px 0;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .summary-hero {
    flex-direction: column;
  }
  
  .price-hero {
    text-align: left;
    width: 100%;
  }
  
  .registration-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .program-summary-modern,
  .registration-form {
    padding: 16px;
  }
  
  .summary-pills {
    flex-direction: column;
  }
}
</style>
