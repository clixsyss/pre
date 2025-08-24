<template>
  <div class="court-booking-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Court Booking</h1>
      </div>
      <p class="header-subtitle">Choose your sport, court, date, and time</p>
    </div>

    <div class="booking-content">
      <!-- Sport Selection -->
      <div class="booking-section">
        <h2 class="section-title">Select Sport</h2>
        <div class="sport-options">
          <div 
            v-for="sport in sportsOptions" 
            :key="sport"
            class="sport-option"
            :class="{ active: selectedSport === sport }"
            @click="selectSport(sport)"
          >
            {{ sport }}
          </div>
        </div>
      </div>

      <!-- Court Selection -->
      <div v-if="selectedSport" class="booking-section">
        <h2 class="section-title">Select Court</h2>
        <div class="court-options">
          <div 
            v-for="court in availableCourts" 
            :key="court.id"
            class="court-option"
            :class="{ active: selectedCourt?.id === court.id }"
            @click="selectCourt(court)"
          >
            <div class="court-info">
              <h3>{{ court.name }}</h3>
              <p>{{ court.price }} EGP/hour</p>
            </div>
            <div class="court-status">
              <span class="status-badge available">Available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Selection -->
      <div v-if="selectedCourt" class="booking-section">
        <h2 class="section-title">Select Date</h2>
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
        <div class="time-options">
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
        <button class="confirm-booking-btn" @click="confirmBooking">
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSportsStore } from 'src/stores/sportsStore';
import bookingService from 'src/services/bookingService';

// Component name for ESLint
defineOptions({
  name: 'CourtBookingPage'
});

const router = useRouter();
const sportsStore = useSportsStore();

// Reactive data
const selectedSport = ref(null);
const selectedCourt = ref(null);
const selectedDay = ref(null);
const selectedSlots = ref([]);

// Computed properties
const sportsOptions = computed(() => sportsStore.sportsOptions);
const availableCourts = computed(() => {
  if (!selectedSport.value) return [];
  return sportsStore.courtsBySport[selectedSport.value] || [];
});

const availableDays = computed(() => bookingService.generateAvailableDays());
const availableTimeSlots = computed(() => {
  if (!selectedDay.value) return [];
  return bookingService.generateTimeSlots();
});

const totalPrice = computed(() => {
  if (!selectedCourt.value || selectedSlots.value.length === 0) return 0;
  return bookingService.calculatePrice(selectedCourt.value.price, selectedSlots.value);
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
};

const selectDay = (day) => {
  selectedDay.value = day;
  selectedSlots.value = [];
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

const confirmBooking = async () => {
  try {
    if (!selectedSport.value || !selectedCourt.value || !selectedDay.value || selectedSlots.value.length === 0) {
      alert('Please complete all selections before confirming');
      return;
    }

    const bookingData = {
      userId: 'current-user-id', // This should come from auth store
      sport: selectedSport.value,
      courtId: selectedCourt.value.id,
      courtName: selectedCourt.value.name,
      date: selectedDay.value.toISOString().split('T')[0],
      timeSlots: selectedSlots.value,
      totalPrice: totalPrice.value,
      sportType: selectedSport.value
    };

    const result = await bookingService.createCourtBooking(bookingData);
    
    if (result.success) {
      alert('Booking confirmed successfully!');
      router.push('/my-bookings');
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    alert('Failed to confirm booking. Please try again.');
  }
};

// Lifecycle
onMounted(async () => {
  await sportsStore.fetchSports();
});
</script>

<style scoped>
.court-booking-page {
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
}

.sport-option:hover {
  border-color: #ff6b35;
  background: #fff5f2;
}

.sport-option.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
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
}

.court-option:hover {
  border-color: #ff6b35;
  background: #fff5f2;
}

.court-option.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
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
  border-color: #ff6b35;
  background: #fff5f2;
}

.date-option.active {
  background: #ff6b35;
  border-color: #ff6b35;
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
}

.time-slot:hover:not(.reserved) {
  border-color: #ff6b35;
  background: #fff5f2;
}

.time-slot.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.time-slot.reserved {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
  cursor: not-allowed;
  opacity: 0.6;
}

.booking-summary {
  background: white;
  border: 2px solid #ff6b35;
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

.confirm-booking-btn {
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

.confirm-booking-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
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
  .page-header h1 {
    font-size: 1.5rem;
  }
  
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
</style>
