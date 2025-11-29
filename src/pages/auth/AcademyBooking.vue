<template>
  <div class="academy-booking-page">
    <PageHeader :title="$t('academyProgramsTitle')" :subtitle="$t('academyProgramsDesc')" />

    <div class="academy-content">
      <!-- Academy Selection -->
      <div class="academy-section">
        <h2 class="section-title">{{ $t('selectAcademy') }}</h2>
        <div class="academy-options">
          <div 
            v-for="academy in academyOptions" 
            :key="academy.id"
            class="academy-option"
            :class="{ active: selectedAcademy?.id === academy.id }"
            @click="selectAcademy(academy)"
          >
            <div class="academy-info">
              <h3>{{ academy.name }}</h3>
              <p v-if="academy.email">{{ academy.email }}</p>
              <p v-if="academy.phone">{{ academy.phone }}</p>
            </div>
            <div class="academy-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Program Selection -->
      <div v-if="selectedAcademy" class="program-section">
        <h2 class="section-title">Select Program</h2>
        <div class="program-options">
          <div 
            v-for="program in availablePrograms" 
            :key="program.id"
            class="program-option"
            :class="{ active: selectedProgram?.id === program.id }"
            @click="selectProgram(program)"
          >
            <div class="program-info">
              <h3>{{ program.name }}</h3>
              <p v-if="program.sport" class="program-sport">{{ program.sport }} {{ $t('program') }}</p>
              <p v-else-if="program.category" class="program-sport">{{ program.category }} {{ $t('program') }}</p>
              <div class="program-details">
                <span class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ program.duration || $t('ongoing') }}
                </span>
                <span class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ program.price }} {{ $t('currency') }}
                </span>
                <span v-if="program.ageGroup" class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ program.ageGroup }}
                </span>
              </div>
            </div>
            <div class="program-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Program Details - Simplified & Modern -->}
      <div v-if="selectedProgram" class="program-details-section">
        <div class="program-hero-card">
          <!-- Header -->
          <div class="program-hero-header">
            <div v-if="selectedProgram.sport || selectedProgram.category" class="hero-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              {{ selectedProgram.sport || selectedProgram.category || 'Program' }}
            </div>
            <h3 class="program-hero-title">{{ selectedProgram.name }}</h3>
          </div>

          <!-- Key Info Grid -->
          <div class="info-grid">
            <div class="info-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ formatDuration(selectedProgram) }}</span>
            </div>
            <div class="info-pill price-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ selectedProgram.price }} EGP</span>
            </div>
            <div v-if="selectedProgram.ageGroup" class="info-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ $t('ages') }} {{ selectedProgram.ageGroup }}</span>
            </div>
          </div>

          <!-- Schedule (if exists) -->
          <div v-if="selectedProgram.schedule && selectedProgram.schedule.length > 0" class="schedule-compact">
            <div class="schedule-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ $t('schedule') }}
            </div>
            <div class="schedule-chips">
              <span v-for="(session, idx) in selectedProgram.schedule.slice(0, 3)" :key="idx" class="schedule-chip">
                {{ session.day }} {{ session.time }}
              </span>
              <span v-if="selectedProgram.schedule.length > 3" class="schedule-chip more">
                +{{ selectedProgram.schedule.length - 3 }} {{ $t('more') }}
              </span>
            </div>
          </div>

          <!-- Coaches (if exist) -->
          <div v-if="selectedProgram.coaches && selectedProgram.coaches.length > 0" class="coaches-compact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ selectedProgram.coaches.join(', ') }}</span>
          </div>

          <!-- Description (collapsible) -->
          <div v-if="selectedProgram.description" class="description-compact">
            <p>{{ selectedProgram.description }}</p>
          </div>
        </div>
      </div>

      <!-- Participant Information -->
      <div v-if="selectedProgram" class="participant-section">
        <h2 class="section-title">{{ $t('participantInformation') }}</h2>
        <div class="participant-form">
          <div class="form-group">
            <label for="participantName">{{ $t('participantFullName') }}</label>
            <input 
              id="participantName"
              v-model="participantData.fullName"
              type="text" 
              :placeholder="$t('enterFullName')"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantEmail">{{ $t('participantEmail') }}</label>
            <input 
              id="participantEmail"
              v-model="participantData.email"
              type="email" 
              :placeholder="$t('enterEmail')"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantPhone">{{ $t('participantPhone') }}</label>
            <input 
              id="participantPhone"
              v-model="participantData.phone"
              type="tel" 
              :placeholder="$t('enterPhone')"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantAge">{{ $t('participantAge') }}</label>
            <input 
              id="participantAge"
              v-model="participantData.age"
              type="number" 
              :placeholder="$t('enterAge')"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Booking Confirmation -->
      <div v-if="canConfirmBooking" class="booking-confirmation">
        <div class="confirmation-header">
          <h2>{{ $t('confirmEnrollment') }}</h2>
        </div>
        <div class="confirmation-content">
          <div class="confirmation-item">
            <span class="label">{{ $t('program') }}:</span>
            <span class="value">{{ selectedProgram.name }}</span>
          </div>
          <div class="confirmation-item">
            <span class="label">{{ $t('academyTitle') }}:</span>
            <span class="value">{{ selectedAcademy.name }}</span>
          </div>
          <div class="confirmation-item">
            <span class="label">{{ $t('participant') }}:</span>
            <span class="value">{{ participantData.fullName }}</span>
          </div>
          <div class="confirmation-item total">
            <span class="label">{{ $t('totalPrice') }}:</span>
            <span class="value">{{ selectedProgram.price }} {{ $t('currency') }}</span>
          </div>
        </div>
        <button 
          class="confirm-enrollment-btn" 
          :class="{ loading: isSubmitting }"
          :disabled="isSubmitting"
          @click="confirmEnrollment"
        >
          <span v-if="!isSubmitting">{{ $t('confirmEnrollment') }}</span>
          <span v-else class="btn-loading">
            <div class="btn-spinner"></div>
            {{ $t('enrolling') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFormKeyboard } from 'src/composables/useFormKeyboard';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';
import { useNotificationStore } from 'src/stores/notifications';
import bookingService from 'src/services/bookingService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import PageHeader from 'src/components/PageHeader.vue';

const { t } = useI18n()

// Component name for ESLint
defineOptions({
  name: 'AcademyBookingPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
});

// Reactive data
const selectedAcademy = ref(null);
const selectedProgram = ref(null);
const isSubmitting = ref(false);
const participantData = ref({
  fullName: '',
  email: '',
  phone: '',
  age: ''
});

// Computed properties
const academyOptions = computed(() => academiesStore.academyOptions);
const availablePrograms = computed(() => {
  if (!selectedAcademy.value) return [];
  return academiesStore.programsByAcademy[selectedAcademy.value.id] || [];
});

const canConfirmBooking = computed(() => {
  return selectedProgram.value && 
         participantData.value.fullName && 
         participantData.value.email && 
         participantData.value.phone && 
         participantData.value.age;
});

// Methods
const selectAcademy = (academy) => {
  selectedAcademy.value = academy;
  selectedProgram.value = null;
  participantData.value = {
    fullName: '',
    email: '',
    phone: '',
    age: ''
  };
};

const selectProgram = (program) => {
  selectedProgram.value = program;
};

const formatDuration = (program) => {
  if (program.duration) {
    return program.duration;
  }
  return t('ongoingProgram');
};

const confirmEnrollment = async () => {
  if (isSubmitting.value) {
    console.log('⏳ Enrollment already in progress, ignoring click');
    return;
  }

  try {
    if (!canConfirmBooking.value) {
      notificationStore.showWarning(t('completeAllRequiredFields'));
      return;
    }

    if (!projectStore.selectedProject?.id) {
      notificationStore.showError('No project selected. Please select a project first.');
      return;
    }

    // Get current user
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      notificationStore.showError('Please log in to enroll.');
      return;
    }

    isSubmitting.value = true;

    const enrollmentData = {
      userId: user.uid,
      academyId: selectedAcademy.value.id,
      academyName: selectedAcademy.value.name,
      programId: selectedProgram.value.id,
      programName: selectedProgram.value.name,
      participant: participantData.value,
      price: selectedProgram.value.price,
      enrollmentDate: new Date().toISOString(),
      status: 'enrolled'
    };

    const result = await bookingService.createAcademyBooking(projectStore.selectedProject.id, enrollmentData);
    
    if (result.success) {
      notificationStore.showSuccess(`${selectedProgram.value.name} enrollment confirmed successfully!`);
      
      // Navigate to bookings page immediately
      router.push('/my-bookings');
    } else {
      notificationStore.showError('Failed to confirm enrollment. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error confirming enrollment:', error);
    notificationStore.showError('Failed to confirm enrollment. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  const projectId = projectStore.selectedProject?.id;
  if (projectId) {
    await academiesStore.fetchAcademies(projectId);
  } else {
    console.warn('AcademyBooking: No project selected');
  }
});
</script>

<style scoped>
.academy-booking-page {
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

.academy-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.academy-section,
.program-section,
.program-details-section,
.participant-section {
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

.academy-options,
.program-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.academy-option,
.program-option {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Mobile app - hover effects disabled */
/* .academy-option:hover,
.program-option:hover {
  border-color: #AF1E23;
  background: #fff5f2;
} */

.academy-option.active,
.program-option.active {
  background: #AF1E23;
  border-color: #AF1E23;
  color: white;
}

.academy-info,
.program-info {
  flex: 1;
}

.academy-info h3,
.program-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.academy-info p,
.program-info p {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.program-sport {
  color: #AF1E23;
  font-weight: 500;
}

.program-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 8px;
}

.academy-arrow,
.program-arrow {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

/* Mobile app - hover effects disabled */
/* .academy-option:hover .academy-arrow,
.program-option:hover .program-arrow {
  opacity: 1;
} */

/* Modern Program Hero Card */
.program-hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.program-hero-header {
  margin-bottom: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.3);
}

.hero-badge svg {
  flex-shrink: 0;
}

.program-hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.3;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .info-pill:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
} */

.info-pill svg {
  flex-shrink: 0;
  stroke: #64748b;
}

.price-pill {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #78350f;
  font-weight: 700;
}

.price-pill svg {
  stroke: #78350f;
}

.schedule-compact {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 10px;
}

.schedule-header svg {
  stroke: #16a34a;
}

.schedule-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.schedule-chip {
  background: white;
  border: 1px solid #86efac;
  color: #166534;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.schedule-chip.more {
  background: #dcfce7;
  font-weight: 600;
}

.coaches-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #1e40af;
  font-weight: 500;
}

.coaches-compact svg {
  flex-shrink: 0;
  stroke: #3b82f6;
}

.description-compact {
  background: #fafafa;
  border-left: 4px solid #AF1E23;
  border-radius: 8px;
  padding: 14px;
  margin-top: 12px;
}

.description-compact p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}

/* Old styles removed - using new compact design */

.participant-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  /* iOS keyboard improvements */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.booking-confirmation {
  background: white;
  border: 2px solid #AF1E23;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.1);
}

.confirmation-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.confirmation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.confirmation-item:last-child {
  border-bottom: none;
}

.confirmation-item.total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #AF1E23;
  border-top: 2px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 8px;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 600;
}

.confirm-enrollment-btn {
  width: 100%;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-enrollment-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.confirm-enrollment-btn.loading {
  pointer-events: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin-enrollment 1s linear infinite;
}

@keyframes spin-enrollment {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile app - hover effects disabled */
/* .confirm-enrollment-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
} */

/* Responsive Design */
@media (max-width: 768px) {
  .academy-booking-page {
    padding: 16px 0;
  }
  
  .academy-section,
  .program-section,
  .program-details-section,
  .participant-section {
    padding: 20px;
  }
  
  .program-details {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .academy-section,
  .program-section,
  .program-details-section,
  .participant-section {
    padding: 16px;
  }
  
  .academy-option,
  .program-option {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .detail-value {
    text-align: left;
  }
}
</style>
