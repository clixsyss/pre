<template>
  <div class="court-booking-page">
    <PageHeader 
      :title="$t('courtBookingTitle')" 
      :subtitle="projectName ? `${$t('bookCourtsIn')} ${projectName}` : $t('chooseSportCourtDateTime')"
    />

    <!-- Loading State -->
    <div v-if="loading && sportsOptions.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingAvailableCourts') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-btn">{{ $t('tryAgain') }}</button>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!projectId" class="no-services">
      <div class="no-services-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>{{ $t('noProjectSelected') }}</h3>
      <p>{{ $t('selectProjectToBookCourts') }}</p>
    </div>

    <!-- No Sports Available -->
    <div v-else-if="sportsOptions.length === 0" class="no-services">
      <div class="no-services-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>{{ $t('noSportsAvailable') }}</h3>
      <p>{{ $t('contactAdminForCourts') }}</p>
    </div>

    <!-- Booking Dialog (Main Content) -->
    <div v-else class="booking-dialog">
      <div class="dialog-content">
        <!-- Court Info Card (appears when court is selected) -->
        <div v-if="selectedCourt" class="service-info-card">
          <div class="service-header">
            <div class="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="service-details">
              <h4 class="service-name">{{ selectedCourt.name }}</h4>
              <p class="service-description">{{ selectedCourt.location }} • {{ translateSport(selectedSport) }}</p>
            </div>
            <div class="service-price-badge">
              <span class="price-amount">{{ formatNumber(selectedCourt.hourlyRate) }} {{ $t('currency') }}/{{ $t('hr') }}</span>
            </div>
          </div>
        </div>

        <!-- Booking Steps -->
        <div class="booking-steps">
          <!-- Step 1: Sport Selection -->
          <div class="booking-step" :class="{ active: !selectedSport, completed: selectedSport }">
            <div class="step-indicator">
              <div class="step-number">1</div>
              <div class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">{{ $t('selectSport') }}</h4>
              <p class="step-subtitle">{{ $t('chooseSportYouWant') }}</p>
              <div class="dropdown-container">
                <select
                  v-model="selectedSport"
                  @change="onSportChange"
                  class="modern-dropdown"
                >
                  <option value="" disabled>{{ $t('chooseSport') }}</option>
                  <option
                    v-for="sport in sportsOptions"
                    :key="sport"
                    :value="sport"
                  >
                    {{ translateSport(sport) }} ({{ sportsStore.getCourtsForSport(sport).length }} {{ sportsStore.getCourtsForSport(sport).length > 1 ? $t('courts') : $t('court') }})
                  </option>
                </select>
                <div class="dropdown-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Court Selection -->
          <div v-if="selectedSport" class="booking-step" :class="{ active: selectedSport && !selectedCourt, completed: selectedCourt }">
            <div class="step-indicator">
              <div class="step-number">2</div>
              <div class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">{{ $t('selectCourt') }}</h4>
              <p class="step-subtitle">{{ $t('chooseFromAvailableCourts') }}</p>
              <div class="dropdown-container">
                <select
                  v-model="selectedCourtId"
                  @change="onCourtChange"
                  class="modern-dropdown"
                >
                  <option value="" disabled>{{ $t('chooseCourt') }}</option>
                  <option
                    v-for="court in availableCourts"
                    :key="court.id"
                    :value="court.id"
                  >
                    {{ court.name }} - {{ formatNumber(court.hourlyRate) }} {{ $t('currency') }}/{{ $t('hr') }} ({{ court.location }})
                  </option>
                </select>
                <div class="dropdown-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Date Selection -->
          <div v-if="selectedCourt" class="booking-step" :class="{ active: selectedCourt && !selectedDay, completed: selectedDay }">
            <div class="step-indicator">
              <div class="step-number">3</div>
              <div class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">{{ $t('selectDate') }}</h4>
              <p class="step-subtitle">{{ $t('choosePreferredDate') }}</p>
              <div class="dropdown-container">
                <select
                  v-model="selectedDayStr"
                  @change="onDateChange"
                  class="modern-dropdown"
                >
                  <option value="" disabled>{{ $t('chooseDate') }}</option>
                  <option
                    v-for="dayObj in availableDays"
                    :key="dayObj.date.toISOString()"
                    :value="dayObj.date.toISOString()"
                    :disabled="!dayObj.enabled"
                  >
                    {{ formatDateForDropdown(dayObj.date) }} {{ !dayObj.enabled ? `(${$t('closed')})` : '' }}
                  </option>
                </select>
                <div class="dropdown-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Time Slots Selection -->
          <div v-if="selectedDay" class="booking-step" :class="{ active: selectedDay && selectedSlots.length === 0, completed: selectedSlots.length > 0 }">
            <div class="step-indicator">
              <div class="step-number">4</div>
              <div class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">{{ $t('selectTimeSlots') }}</h4>
              <p class="step-subtitle">{{ $t('pickTimeSlots') }}</p>
              
              <!-- Loading State -->
              <div v-if="loadingTimeSlots" class="loading-state">
                <div class="loading-spinner"></div>
                <p>{{ $t('loadingTimeSlots') }}</p>
              </div>

              <!-- No Time Slots -->
              <div v-else-if="availableTimeSlots.length === 0" class="no-slots-state">
                <div class="no-slots-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <p>{{ $t('noTimeSlotsAvailable') }}</p>
              </div>

              <!-- Time Slots Grid -->
              <div v-else class="time-slots-grid">
                <div
                  v-for="slot in availableTimeSlots"
                  :key="slot.time"
                  class="time-slot-chip"
                  :class="{ 
                    selected: selectedSlots.includes(slot.time),
                    reserved: slot.isReserved 
                  }"
                  @click="!slot.isReserved && toggleSlotSelection(slot.time)"
                >
                  {{ slot.time }}
                  <span v-if="slot.isReserved" class="reserved-badge">{{ $t('booked') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Summary -->
        <div v-if="selectedSlots.length > 0" class="booking-summary">
          <div class="summary-header">
            <h4>{{ $t('bookingSummary') }}</h4>
          </div>
          <div class="summary-content">
            <div class="summary-item">
              <span class="summary-label">{{ $t('bookingSummarySport') }}:</span>
              <span class="summary-value">{{ translateSport(selectedSport) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('bookingSummaryCourt') }}:</span>
              <span class="summary-value">{{ selectedCourt?.name }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('bookingSummaryDate') }}:</span>
              <span class="summary-value">{{ formatSelectedDate(selectedDay) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('bookingSummaryTimeSlots') }}:</span>
              <span class="summary-value">{{ selectedSlots.join(', ') }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('bookingSummaryDuration') }}:</span>
              <span class="summary-value">{{ selectedSlots.length }} {{ $t('hours') }}</span>
            </div>
            <div class="summary-item total">
              <span class="summary-label">{{ $t('bookingSummaryTotal') }}:</span>
              <span class="summary-value">{{ $t('currency') }} {{ formatNumber(totalPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="booking-actions">
          <button @click="resetBooking" class="cancel-btn">{{ $t('reset') }}</button>
          <button
            @click="confirmBooking"
            :disabled="!selectedSport || !selectedCourt || !selectedDay || selectedSlots.length === 0 || isSubmitting"
            class="book-btn"
            :class="{ loading: isSubmitting }"
          >
            <span v-if="!isSubmitting" class="btn-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ $t('confirmBooking') }}
            </span>
            <span v-else class="btn-content">
              <div class="btn-spinner"></div>
              {{ $t('booking') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSportsStore } from 'src/stores/sportsStore';
import { useProjectStore } from 'src/stores/projectStore';
import { useNotificationStore } from 'src/stores/notifications';
import { useAcademiesStore } from 'src/stores/academyStore';
import bookingService from 'src/services/bookingService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import PageHeader from '../../components/PageHeader.vue';
import { useFormKeyboard } from '../../composables/useFormKeyboard';
import { useDateFormat } from '../../composables/useDateFormat';
import { useI18n } from 'vue-i18n';

// Component name for ESLint
defineOptions({
  name: 'CourtBookingPage'
});

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
});

const router = useRouter();
const sportsStore = useSportsStore();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();
const academiesStore = useAcademiesStore();
const { formatDateWithWeekday } = useDateFormat();
const { t, locale } = useI18n();

// Helper function to translate sport names
const translateSport = (sportName) => {
  if (!sportName) return '';
  // Normalize sport name (case-insensitive, trim spaces)
  const normalizedSport = sportName.trim().toLowerCase();
  
  // Map common sport names to translation keys
  const sportMap = {
    'tennis': 'sportTennis',
    'basketball': 'sportBasketball',
    'swimming': 'sportSwimming',
    'football': 'sportFootball',
    'soccer': 'sportSoccer',
    'volleyball': 'sportVolleyball',
    'badminton': 'sportBadminton',
    'squash': 'sportSquash',
    'padel': 'sportPadel',
    'table tennis': 'sportTableTennis',
    'table-tennis': 'sportTableTennis',
    'tabletennis': 'sportTableTennis',
    'handball': 'sportHandball',
  };
  
  const translationKey = sportMap[normalizedSport];
  if (translationKey && t(translationKey)) {
    return t(translationKey);
  }
  
  // If no translation found, return original name
  return sportName;
};

// Helper function to format numbers with proper locale
const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  const localeCode = locale.value === 'ar-SA' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(localeCode).format(number);
};

// Reactive data
const selectedSport = ref('');
const selectedCourt = ref(null);
const selectedCourtId = ref('');
const selectedDay = ref(null);
const selectedDayStr = ref('');
const selectedSlots = ref([]);
const loading = ref(false);
const loadingTimeSlots = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const timeSlotsData = ref([]);

// Computed properties
const projectId = computed(() => projectStore.selectedProject?.id);
const projectName = computed(() => projectStore.selectedProject?.name);
const sportsOptions = computed(() => sportsStore.sportsOptions);

const availableDays = computed(() => {
  const allDays = bookingService.generateAvailableDays();
  
  // Always show all 7 days, but mark disabled ones
  if (!selectedCourt.value || !selectedCourt.value.availability) {
    // No court selected or no availability data - all days enabled
    return allDays.map(day => ({ date: day, enabled: true }));
  }
  
  // Map days with enabled status
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return allDays.map(day => {
    const dayOfWeek = dayNames[day.getDay()];
    const daySchedule = selectedCourt.value.availability[dayOfWeek];
    return {
      date: day,
      enabled: daySchedule ? daySchedule.enabled : true,
      dayOfWeek: dayOfWeek
    };
  });
});

const availableTimeSlots = computed(() => {
  if (!selectedDay.value || !selectedCourt.value || !projectId.value) return [];
  return timeSlotsData.value.length > 0 ? timeSlotsData.value : [];
});

const totalPrice = computed(() => {
  if (!selectedCourt.value || selectedSlots.value.length === 0) return 0;
  return bookingService.calculatePrice(selectedCourt.value.hourlyRate, selectedSlots.value);
});

// Computed property for available courts based on selected sport
const availableCourts = computed(() => {
  if (!selectedSport.value) return [];
  const courts = sportsStore.getCourtsForSport(selectedSport.value);
  console.log(`📋 Available courts for ${selectedSport.value}:`, courts);
  return courts;
});

// Methods
const onSportChange = (event) => {
  const sport = event.target.value;
  console.log('🏀 Sport selected:', sport);
  selectedSport.value = sport;
  selectedCourt.value = null;
  selectedCourtId.value = '';
  selectedDay.value = null;
  selectedDayStr.value = '';
  selectedSlots.value = [];
  timeSlotsData.value = [];
};

const onCourtChange = (event) => {
  const courtId = event.target.value;
  console.log('🏟️ Court selected:', courtId);
  const court = availableCourts.value.find(c => c.id === courtId);
  selectedCourt.value = court;
  selectedCourtId.value = courtId;
  selectedDay.value = null;
  selectedDayStr.value = '';
  selectedSlots.value = [];
  timeSlotsData.value = [];
};

const onDateChange = async (event) => {
  const dateStr = event.target.value;
  if (!dateStr) return;
  
  const day = new Date(dateStr);
  console.log('📅 Date selected:', day);
  selectedDay.value = day;
  selectedDayStr.value = dateStr;
  selectedSlots.value = [];
  
  // Fetch available time slots for the selected court and date
  if (selectedCourt.value && projectId.value) {
    try {
      loadingTimeSlots.value = true;
      
      // OPTIMIZED: Pass court data directly to avoid re-fetching
      const slots = await bookingService.getAvailableTimeSlotsOptimized(
        projectId.value,
        selectedCourt.value.id,
        day.toISOString().split('T')[0],
        selectedCourt.value // Pass court data directly
      );
      timeSlotsData.value = slots;
      console.log('Fetched time slots with availability:', slots);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      // Fallback to basic time slots if there's an error
      timeSlotsData.value = [];
    } finally {
      loadingTimeSlots.value = false;
    }
  }
};

const toggleSlotSelection = (time) => {
  const index = selectedSlots.value.indexOf(time);
  if (index > -1) {
    selectedSlots.value.splice(index, 1);
  } else {
    selectedSlots.value.push(time);
  }
};

// formatDateForDropdown and formatSelectedDate now use useDateFormat composable
const formatDateForDropdown = (date) => {
  return formatDateWithWeekday(date) || '';
};

const formatSelectedDate = (date) => {
  return formatDateWithWeekday(date) || '';
};

const resetBooking = () => {
  selectedSport.value = '';
  selectedCourt.value = null;
  selectedCourtId.value = '';
  selectedDay.value = null;
  selectedDayStr.value = '';
  selectedSlots.value = [];
  timeSlotsData.value = [];
};

const retryFetch = async () => {
  await fetchSports();
};

const confirmBooking = async () => {
  if (!projectId.value) {
    notificationStore.showWarning('No project selected. Please select a project first.');
    return;
  }

  // Check if user is authenticated
  const user = await optimizedAuthService.getCurrentUser();
  if (!user) {
    notificationStore.showWarning('Please log in to book a court.');
    return;
  }

  try {
    if (!selectedSport.value || !selectedCourt.value || !selectedDay.value || selectedSlots.value.length === 0) {
      notificationStore.showWarning('Please complete all selections before confirming');
      return;
    }

    isSubmitting.value = true;
    notificationStore.showInfo('Creating your booking...');

    const bookingData = {
      userId: user.uid,
      sport: selectedSport.value,
      courtId: selectedCourt.value.id,
      courtName: selectedCourt.value.name,
      date: selectedDay.value.toISOString().split('T')[0],
      timeSlots: selectedSlots.value,
      totalPrice: totalPrice.value,
      sportType: selectedSport.value,
      courtLocation: selectedCourt.value.location,
      courtType: selectedCourt.value.type,
      courtSurface: selectedCourt.value.surface
    };

    console.log('Creating booking with data:', bookingData);

    const result = await bookingService.createCourtBooking(projectId.value, bookingData);
    
    console.log('🔍 Court booking result:', result);
    
    if (result.success && result.bookingId) {
      notificationStore.showSuccess(`Court booked successfully! Awaiting admin confirmation.`);
      
      // Refresh the academy store in the background (don't await to prevent blocking)
      academiesStore.fetchUserBookings(user.uid, projectId.value)
        .catch((err) => {
          console.error('Error refreshing bookings:', err);
        });
      
      // Navigate to bookings page immediately
      router.push('/my-bookings');
    } else {
      console.error('❌ Court booking failed:', result);
      notificationStore.showError('Failed to create booking. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error confirming booking:', error);
    notificationStore.showError(`Failed to confirm booking: ${error.message || 'Please try again.'}`);
  } finally {
    isSubmitting.value = false;
  }
};

const fetchSports = async () => {
  if (!projectId.value) {
    error.value = 'No project selected. Please select a project first.';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    await sportsStore.fetchSports(projectId.value);
  } catch (err) {
    error.value = 'Failed to load sports and courts. Please try again.';
    console.error('Error fetching sports:', err);
  } finally {
    loading.value = false;
  }
};

// Watch for project changes
watch(projectId, (newProjectId) => {
  if (newProjectId) {
    // Clear previous selections when project changes
    resetBooking();
    
    // Fetch sports for the new project
    fetchSports();
  } else {
    // Clear sports data when no project is selected
    sportsStore.resetForNewProject();
  }
});

// Lifecycle
onMounted(async () => {
  if (projectId.value) {
    await fetchSports();
  } else {
    error.value = 'No project selected. Please select a project first.';
  }
});
</script>

<style scoped>
.court-booking-page {
  padding: 0;
  background: #fafafa;
  min-height: 100%;
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
  border-top: 4px solid #af1e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  background: #af1e23;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* No Services State */
.no-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  margin: 0 16px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.no-services-icon {
  color: #d1d5db;
  margin-bottom: 20px;
}

.no-services h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-services p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Booking Dialog */
.booking-dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.dialog-content {
  padding: 20px;
}

/* Service Info Card */
.service-info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.service-price-badge {
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

/* Booking Steps */
.booking-steps {
  margin-bottom: 32px;
}

.booking-step {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.booking-step.active {
  opacity: 1;
}

.booking-step.completed {
  opacity: 1;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.booking-step.active .step-number {
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  transform: scale(1.1);
}

.booking-step.completed .step-number {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.booking-step.completed .step-number::after {
  content: '✓';
  font-size: 1.2rem;
}

.step-line {
  width: 2px;
  height: 60px;
  background: #e2e8f0;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.booking-step.completed .step-line {
  background: linear-gradient(180deg, #10b981 0%, #e2e8f0 100%);
}

.step-content {
  flex: 1;
  padding-top: 8px;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.step-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 16px 0;
}

/* Modern Dropdown */
.dropdown-container {
  position: relative;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  width: 100%;
}

.modern-dropdown {
  width: 100%;
  padding: 16px 48px 16px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.modern-dropdown:focus {
  outline: none;
  border-color: #af1e23;
  box-shadow:
    0 0 0 3px rgba(175, 30, 35, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.modern-dropdown:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.modern-dropdown option {
  padding: 12px 16px;
  font-size: 0.875rem;
}

.modern-dropdown option:disabled {
  color: #94a3b8;
  background: #f8fafc;
}

.dropdown-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  transition: color 0.3s ease, transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.dropdown-container:focus-within .dropdown-icon {
  color: #af1e23;
  transform: translateY(-50%) rotate(180deg);
}

/* Time Slots Grid */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.time-slot-chip {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #1e293b;
  position: relative;
}

.time-slot-chip:active {
  transform: scale(0.95);
}

.time-slot-chip.selected {
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  border-color: #af1e23;
  color: white;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

.time-slot-chip.reserved {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  text-decoration: line-through;
  opacity: 0.6;
}

.reserved-badge {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
}

/* Loading and No Slots States */
.loading-state,
.no-slots-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #af1e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.no-slots-icon {
  color: #94a3b8;
  margin-bottom: 12px;
}

.loading-state p,
.no-slots-state p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Booking Summary */
.booking-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.summary-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 16px 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #bae6fd;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0c4a6e;
  padding-top: 12px;
  border-top: 2px solid #bae6fd;
  border-bottom: none;
}

.summary-label {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 500;
}

.summary-value {
  font-size: 0.875rem;
  color: #0c4a6e;
  font-weight: 600;
}

/* Action Buttons */
.booking-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.cancel-btn {
  flex: 1 1 0;
  min-width: 0;
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.cancel-btn:active {
  transform: scale(0.98);
  background: #f1f5f9;
}

.book-btn {
  flex: 2 1 0;
  min-width: 0;
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  white-space: nowrap;
  box-sizing: border-box;
}

.book-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.4);
}

.book-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.book-btn.loading {
  pointer-events: none;
}

.btn-content {
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
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .booking-dialog {
    border-radius: 12px;
    margin: 0 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .service-info-card {
    padding: 20px;
    margin-bottom: 24px;
  }

  .service-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .service-price-badge {
    align-self: flex-end;
  }

  .booking-steps {
    margin-bottom: 24px;
  }

  .booking-step {
    gap: 16px;
    margin-bottom: 24px;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .step-line {
    height: 50px;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .booking-actions {
    flex-direction: column;
    gap: 12px;
    padding-top: 20px;
  }

  .cancel-btn,
  .book-btn {
    flex: none;
    width: 100%;
    min-width: auto;
    padding: 14px 16px;
  }
}

@media (max-width: 480px) {
  .booking-dialog {
    margin: 0 8px;
  }

  .dialog-content {
    padding: 12px;
  }

  .service-info-card {
    padding: 16px;
  }

  .booking-summary {
    padding: 16px;
  }

  .booking-actions {
    gap: 10px;
    padding-top: 16px;
  }

  .cancel-btn,
  .book-btn {
    padding: 12px 14px;
    font-size: 0.875rem;
  }

  .btn-content {
    gap: 6px;
  }

  .btn-content svg {
    width: 18px;
    height: 18px;
  }
}

/* RTL Support for Arabic */
[dir="rtl"] .service-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .booking-step {
  flex-direction: row-reverse;
}

[dir="rtl"] .dropdown-container {
  direction: rtl;
}

[dir="rtl"] .dropdown-icon {
  right: auto;
  left: 16px;
}

[dir="rtl"] .modern-dropdown {
  padding: 16px 16px 16px 48px;
  direction: rtl;
}

[dir="rtl"] .booking-actions {
  flex-direction: row-reverse;
}

/* Ensure buttons fit properly in RTL mode */
@media (max-width: 768px) {
  [dir="rtl"] .booking-actions {
    flex-direction: column;
  }
}

[dir="rtl"] .summary-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .summary-item.total {
  flex-direction: row-reverse;
}
</style>
