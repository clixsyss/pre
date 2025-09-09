<template>
  <div class="academy-booking-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Academy Programs</h1>
      </div>
      <p class="header-subtitle">Join sports academies and training programs</p>
    </div>

    <div class="academy-content">
      <!-- Academy Selection -->
      <div class="academy-section">
        <h2 class="section-title">Select Academy</h2>
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
              <p class="program-sport">{{ program.sport }} Program</p>
              <div class="program-details">
                <span class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ program.duration || 'Ongoing' }}
                </span>
                <span class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ program.price }} EGP
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

      <!-- Program Details -->
      <div v-if="selectedProgram" class="program-details-section">
        <h2 class="section-title">Program Details</h2>
        <div class="program-details-card">
          <div class="detail-row">
            <span class="detail-label">Program Name:</span>
            <span class="detail-value">{{ selectedProgram.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Sport:</span>
            <span class="detail-value">{{ selectedProgram.sport }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">{{ formatDuration(selectedProgram) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">{{ selectedProgram.price }} EGP</span>
          </div>
          <div v-if="selectedProgram.ageGroup" class="detail-row">
            <span class="detail-label">Age Group:</span>
            <span class="detail-value">{{ selectedProgram.ageGroup }}</span>
          </div>
          <div v-if="selectedProgram.coaches && selectedProgram.coaches.length > 0" class="detail-row">
            <span class="detail-label">Coaches:</span>
            <span class="detail-value">{{ selectedProgram.coaches.join(', ') }}</span>
          </div>
          <div v-if="selectedProgram.schedule && selectedProgram.schedule.length > 0" class="detail-row">
            <span class="detail-label">Schedule:</span>
            <div class="schedule-list">
              <div v-for="(session, idx) in selectedProgram.schedule" :key="idx" class="schedule-item">
                {{ session.day }} at {{ session.time }}
                <span v-if="session.location" class="location">({{ session.location }})</span>
              </div>
            </div>
          </div>
          <div v-if="selectedProgram.description" class="detail-row">
            <span class="detail-label">Description:</span>
            <p class="description-text">{{ selectedProgram.description }}</p>
          </div>
        </div>
      </div>

      <!-- Participant Information -->
      <div v-if="selectedProgram" class="participant-section">
        <h2 class="section-title">Participant Information</h2>
        <div class="participant-form">
          <div class="form-group">
            <label for="participantName">Full Name</label>
            <input 
              id="participantName"
              v-model="participantData.fullName"
              type="text" 
              placeholder="Enter participant's full name"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantEmail">Email</label>
            <input 
              id="participantEmail"
              v-model="participantData.email"
              type="email" 
              placeholder="Enter participant's email"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantPhone">Phone</label>
            <input 
              id="participantPhone"
              v-model="participantData.phone"
              type="tel" 
              placeholder="Enter participant's phone number"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="participantAge">Age</label>
            <input 
              id="participantAge"
              v-model="participantData.age"
              type="number" 
              placeholder="Enter participant's age"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Booking Confirmation -->
      <div v-if="canConfirmBooking" class="booking-confirmation">
        <div class="confirmation-header">
          <h2>Confirm Enrollment</h2>
        </div>
        <div class="confirmation-content">
          <div class="confirmation-item">
            <span class="label">Program:</span>
            <span class="value">{{ selectedProgram.name }}</span>
          </div>
          <div class="confirmation-item">
            <span class="label">Academy:</span>
            <span class="value">{{ selectedAcademy.name }}</span>
          </div>
          <div class="confirmation-item">
            <span class="label">Participant:</span>
            <span class="value">{{ participantData.fullName }}</span>
          </div>
          <div class="confirmation-item total">
            <span class="label">Total Price:</span>
            <span class="value">{{ selectedProgram.price }} EGP</span>
          </div>
        </div>
        <button class="confirm-enrollment-btn" @click="confirmEnrollment">
          Confirm Enrollment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useNotificationStore } from 'src/stores/notifications';
import bookingService from 'src/services/bookingService';

// Component name for ESLint
defineOptions({
  name: 'AcademyBookingPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const notificationStore = useNotificationStore();

// Reactive data
const selectedAcademy = ref(null);
const selectedProgram = ref(null);
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
  return 'Ongoing program';
};

const confirmEnrollment = async () => {
  try {
    if (!canConfirmBooking.value) {
      notificationStore.showWarning('Please complete all required fields before confirming enrollment');
      return;
    }

    const enrollmentData = {
      userId: 'current-user-id', // This should come from auth store
      academyId: selectedAcademy.value.id,
      academyName: selectedAcademy.value.name,
      programId: selectedProgram.value.id,
      programName: selectedProgram.value.name,
      participant: participantData.value,
      price: selectedProgram.value.price,
      enrollmentDate: new Date().toISOString(),
      status: 'enrolled'
    };

    const result = await bookingService.createAcademyBooking(enrollmentData);
    
    if (result.success) {
      notificationStore.showSuccess('Enrollment confirmed successfully!');
      router.push('/my-bookings');
    }
  } catch (error) {
    console.error('Error confirming enrollment:', error);
    notificationStore.showError('Failed to confirm enrollment. Please try again.');
  }
};

// Lifecycle
onMounted(async () => {
  await academiesStore.fetchAcademies();
});
</script>

<style scoped>
.academy-booking-page {
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

.academy-option:hover,
.program-option:hover {
  border-color: #ff6b35;
  background: #fff5f2;
}

.academy-option.active,
.program-option.active {
  background: #ff6b35;
  border-color: #ff6b35;
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
  color: #ff6b35;
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

.academy-option:hover .academy-arrow,
.program-option:hover .program-arrow {
  opacity: 1;
}

.program-details-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e1e5e9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #333;
  min-width: 120px;
}

.detail-value {
  color: #666;
  text-align: right;
  flex: 1;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-item {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.location {
  color: #666;
  font-style: italic;
}

.description-text {
  margin: 8px 0 0 0;
  line-height: 1.5;
  color: #666;
}

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
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.booking-confirmation {
  background: white;
  border: 2px solid #ff6b35;
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
  color: #ff6b35;
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
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-enrollment-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

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
