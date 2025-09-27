<template>
  <div class="court-booking-page">
    <PageHeader 
      title="Court Booking" 
      :subtitle="projectName ? `Book courts in ${projectName}` : 'Choose your sport, court, date, and time'"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading available sports and courts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-btn">Try Again</button>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!projectId" class="no-project-state">
      <div class="no-project-icon">🏗️</div>
      <h3>No Project Selected</h3>
      <p>Please select a project to book courts.</p>
      <button @click="$router.push('/project-selection')" class="select-project-btn">
        Select Project
      </button>
    </div>

    <!-- No Sports Available -->
    <div v-else-if="sportsOptions.length === 0" class="no-sports-state">
      <div class="no-sports-icon">🏟️</div>
      <h3>No Sports Available</h3>
      <p>There are no sports with courts available in this project yet.</p>
      <p>Please contact the project administrator to set up sports and courts.</p>
      
      <!-- Debug button for development -->
      <button @click="debugSportsData" class="debug-btn" v-if="projectId">
        Debug Sports Data
      </button>
    </div>

    <!-- Booking Content -->
    <div v-else class="booking-content">
      <!-- Sport Selection -->
      <div class="booking-section">
        <h2 class="section-title">Select Sport</h2>
        <p class="section-subtitle">Choose from sports that have available courts</p>
        <div class="sport-options">
          <div 
            v-for="sport in sportsOptions" 
            :key="sport"
            class="sport-option"
            :class="{ active: selectedSport === sport }"
            @click="selectSport(sport)"
          >
            <div class="sport-info">
              <span class="sport-name">{{ sport }}</span>
              <span class="court-count">{{ getCourtsForSport(sport).length }} court(s)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Court Selection -->
      <div v-if="selectedSport" class="booking-section">
        <h2 class="section-title">Select Court</h2>
        <p class="section-subtitle">Available courts for {{ selectedSport }}</p>
        <div class="court-options">
          <div 
            v-for="court in getCourtsForSport(selectedSport)" 
            :key="court.id"
            class="court-option"
            :class="{ active: selectedCourt?.id === court.id }"
            @click="selectCourt(court)"
          >
            <!-- Court Image -->
            <div class="court-image" v-if="court.imageUrl">
              <img :src="court.imageUrl" :alt="court.name" />
            </div>
            <div class="court-image-placeholder" v-else>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div class="court-info">
              <h3>{{ court.name }}</h3>
              <p class="court-location">{{ court.location }}</p>
              <p class="court-details">
                <span class="court-type">{{ court.type }}</span>
                <span class="court-surface">{{ formatSurface(court.surface) }}</span>
                <span class="court-capacity">{{ court.capacity }} people</span>
              </p>
            </div>
            <div class="court-pricing">
              <span class="price">{{ court.hourlyRate }} EGP/hour</span>
              <span class="status-badge available">Available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Selection -->
      <div v-if="selectedCourt" class="booking-section">
        <h2 class="section-title">Select Date</h2>
        <p class="section-subtitle">Choose from the next 7 days</p>
        <div class="date-options">
          <div 
            v-for="day in availableDays" 
            :key="day.toISOString()"
            class="date-option"
            :class="{ active: selectedDay?.toDateString() === day.toDateString() }"
            @click="selectDay(day)"
          >
            <div class="date-day">{{ formatDate(day).split(' ')[0] }}</div>
            <div class="date-number">{{ formatDate(day).split(' ')[1] }}</div>
            <div class="date-month">{{ formatDate(day).split(' ')[2] }}</div>
          </div>
        </div>
      </div>

      <!-- Time Selection -->
      <div v-if="selectedDay && selectedCourt" class="booking-section">
        <h2 class="section-title">Select Time Slots</h2>
        <p class="section-subtitle">Available time slots for {{ formatDate(selectedDay) }}</p>
        
        <!-- Loading State -->
        <div v-if="loading" class="time-slots-loading">
          <div class="loading-spinner"></div>
          <span>Loading available slots...</span>
        </div>
        
        <!-- Time Slots Grid -->
        <div v-else class="time-options">
          <div 
            v-for="slot in availableTimeSlots" 
            :key="slot.time"
            class="time-slot"
            :class="{ 
              active: selectedSlots.includes(slot.time),
              reserved: slot.isReserved 
            }"
            @click="toggleSlotSelection(slot.time)"
            :style="{ pointerEvents: slot.isReserved ? 'none' : 'auto' }"
          >
            {{ slot.time }}
            <span v-if="slot.isReserved" class="reserved-label">Booked</span>
          </div>
        </div>
      </div>

      <!-- Booking Summary -->
      <div v-if="selectedSlots.length > 0" class="booking-summary">
        <div class="summary-header">
          <h2>Booking Summary</h2>
        </div>
        <div class="summary-content">
          <div class="summary-item">
            <span class="label">Sport:</span>
            <span class="value">{{ selectedSport }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Court:</span>
            <span class="value">{{ selectedCourt?.name }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Date:</span>
            <span class="value">{{ selectedDay ? formatDate(selectedDay) : '' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Time:</span>
            <span class="value">{{ selectedSlots.join(', ') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Duration:</span>
            <span class="value">{{ selectedSlots.length }} hour(s)</span>
          </div>
          <div class="summary-item total">
            <span class="label">Total Price:</span>
            <span class="value">{{ totalPrice }} EGP</span>
          </div>
        </div>
        <button class="confirm-booking-btn" @click="confirmBooking" :disabled="isSubmitting">
          <span v-if="isSubmitting">Processing...</span>
          <span v-else>Confirm Booking</span>
        </button>
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
import bookingService from 'src/services/bookingService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import PageHeader from '../../components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'CourtBookingPage'
});

const router = useRouter();
const sportsStore = useSportsStore();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();

// Reactive data
const selectedSport = ref(null);
const selectedCourt = ref(null);
const selectedDay = ref(null);
const selectedSlots = ref([]);
const loading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const timeSlotsData = ref([]);

// Computed properties
const projectId = computed(() => projectStore.selectedProject?.id);
const projectName = computed(() => projectStore.selectedProject?.name);
const sportsOptions = computed(() => sportsStore.sportsOptions);
const availableDays = computed(() => bookingService.generateAvailableDays());

const availableTimeSlots = computed(() => {
  if (!selectedDay.value || !selectedCourt.value || !projectId.value) return [];
  return timeSlotsData.value.length > 0 ? timeSlotsData.value : bookingService.generateTimeSlots();
});

const totalPrice = computed(() => {
  if (!selectedCourt.value || selectedSlots.value.length === 0) return 0;
  return bookingService.calculatePrice(selectedCourt.value.hourlyRate, selectedSlots.value);
});

// Methods
const selectSport = (sport) => {
  selectedSport.value = sport;
  selectedCourt.value = null;
  selectedDay.value = null;
  selectedSlots.value = [];
};

const selectCourt = (court) => {
  selectedCourt.value = court;
  selectedDay.value = null;
  selectedSlots.value = [];
  timeSlotsData.value = [];
};

const selectDay = async (day) => {
  selectedDay.value = day;
  selectedSlots.value = [];
  
  // Fetch available time slots for the selected court and date
  if (selectedCourt.value && projectId.value) {
    try {
      loading.value = true;
      const slots = await bookingService.getAvailableTimeSlots(
        projectId.value,
        selectedCourt.value.id,
        day.toISOString().split('T')[0]
      );
      timeSlotsData.value = slots;
      console.log('Fetched time slots with availability:', slots);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      // Fallback to basic time slots if there's an error
      timeSlotsData.value = bookingService.generateTimeSlots();
    } finally {
      loading.value = false;
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

const formatDate = (date) => {
  return bookingService.formatDate(date);
};

const formatSurface = (surface) => {
  if (!surface) return 'Unknown';
  return surface.charAt(0).toUpperCase() + surface.slice(1).replace(/([A-Z])/g, ' $1');
};

const getCourtsForSport = (sportName) => {
  return sportsStore.getCourtsForSport(sportName);
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
    console.log('User ID:', user.uid);
    console.log('Project ID:', projectId.value);

    const result = await bookingService.createCourtBooking(projectId.value, bookingData);
    
    if (result.success) {
      notificationStore.showSuccess('Booking confirmed successfully!');
      router.push('/my-bookings');
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    notificationStore.showError('Failed to confirm booking. Please try again.');
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

const debugSportsData = () => {
  console.log('=== COURT BOOKING DEBUG ===');
  console.log('Current Sports Options:', sportsStore.sportsOptions);
  console.log('Current Project ID:', projectId.value);
  console.log('Current Selected Sport:', selectedSport.value);
  console.log('Current Selected Court:', selectedCourt.value);
  console.log('Current Selected Day:', selectedDay.value);
  console.log('Current Selected Slots:', selectedSlots.value);
  
  // Also call the store's debug method
  sportsStore.debugSportsData();
  
  // Try to fetch sports again
  console.log('Attempting to fetch sports again...');
  fetchSports();
};

// Watch for project changes
watch(projectId, (newProjectId) => {
  if (newProjectId) {
    // Clear previous selections when project changes
    selectedSport.value = null;
    selectedCourt.value = null;
    selectedDay.value = null;
    selectedSlots.value = [];
    
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
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto;
}

/* Page header styles moved to PageHeader component */

.booking-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.booking-section {
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

.section-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 16px 0;
}

.sport-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.sport-option {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sport-option:hover {
  border-color: #AF1E23;
  background: #fff5f2;
}

.sport-option.active {
  background: #fff5f2;
  border-color: #AF1E23;
  color: white;
}

.sport-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sport-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.court-count {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}

.court-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.court-option {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.court-option:hover {
  border-color: #AF1E23;
  background: #fff5f2;
}

.court-option.active {
  background: #fff5f2;
  border-color: #AF1E23;
  color: #AF1E23;
}

.court-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.court-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.court-image-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.court-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.court-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.court-location {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.court-details {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}

.court-type {
  font-weight: 500;
}

.court-surface {
  margin-left: 8px;
}

.court-capacity {
  margin-left: 8px;
}

.court-pricing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #AF1E23;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.available {
  background: #d4edda;
  color: #155724;
}

.date-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 16px;
}

.date-option {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-option:hover {
  border-color: #AF1E23;
  background: #fff5f2;
}

.date-option.active {
  background: #AF1E23;
  border-color: #AF1E23;
  color: white;
}

.date-day {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.date-number {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.date-month {
  font-size: 0.75rem;
  font-weight: 500;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.time-slot {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-slot:hover:not(.reserved) {
  border-color: #AF1E23;
  background: #fff5f2;
}

.time-slot.active {
  background: #AF1E23;
  border-color: #AF1E23;
  color: white;
}

.time-slot.reserved {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.5;
  position: relative;
  text-decoration: line-through;
}

.reserved-label {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-slots-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.booking-summary {
  background: white;
  border: 2px solid #AF1E23;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.1);
}

.summary-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
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

.confirm-booking-btn {
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

.confirm-booking-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
}

.confirm-booking-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.loading-state, .error-state, .no-sports-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.error-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 16px;
}

.retry-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #AF1E23;
}

.no-sports-icon {
  font-size: 4rem;
  color: #AF1E23;
  margin-bottom: 16px;
}

.no-project-state, .no-sports-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.no-project-icon, .no-sports-icon {
  font-size: 4rem;
  color: #AF1E23;
  margin-bottom: 16px;
}

.no-project-state h3, .no-sports-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.no-project-state p, .no-sports-state p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
}

.select-project-btn {
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.select-project-btn:hover {
  background: #AF1E23;
  transform: translateY(-2px);
}

.debug-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.debug-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .court-booking-page {
    padding: 16px 0;
  }
  
  .booking-section {
    padding: 20px;
  }
  
  .sport-options {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .date-options {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  }
  
  .time-options {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  }
}

@media (max-width: 480px) {
  /* Page header responsive styles moved to PageHeader component */
  
  .booking-section {
    padding: 16px;
  }
  
  .sport-options {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .court-option {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
