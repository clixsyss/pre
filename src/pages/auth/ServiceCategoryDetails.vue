<template>
  <div class="service-category-details">
    <!-- Page Header -->
    <PageHeader 
      :title="category?.englishTitle || 'Loading...'" 
      />
      <!-- :subtitle="category?.arabicTitle || ''"  -->

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading services...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadServices" class="retry-btn">Retry</button>
    </div>

    <!-- Services List -->
    <div v-else-if="services.length > 0" class="services-list">
      <h3 class="section-title">Available Services</h3>
      <div 
        v-for="service in services" 
        :key="service.id" 
        class="service-item"
        @click="openBookingDialog(service)"
      >
        <div class="service-info">
          <h4 class="service-name">{{ service.englishTitle }}</h4>
          <p class="service-description">{{ service.englishDescription }}</p>
          <div class="service-price">EGP {{ service.price }}</div>
        </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- No Services State -->
    <div v-else class="no-services">
      <div class="no-services-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7 6.3C14.7 4.4 13.3 3 11.4 3C9.5 3 8.1 4.4 8.1 6.3C8.1 8.2 9.5 9.6 11.4 9.6C13.3 9.6 14.7 8.2 14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>No Services Available</h3>
      <p>There are no services available in this category yet.</p>
    </div>

    <!-- Booking Dialog -->
    <div v-if="showBookingDialog" class="booking-dialog-overlay" @click="closeBookingDialog">
      <div class="booking-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">Book Service</h3>
          <button @click="closeBookingDialog" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="dialog-content">
          <div class="service-info">
            <h4 class="service-name">{{ selectedService?.englishTitle }}</h4>
            <p class="service-description">{{ selectedService?.englishDescription }}</p>
            <div class="service-price">EGP {{ selectedService?.price }}</div>
          </div>
          
          <div class="availability-section">
            <h4 class="section-title">Select Available Date</h4>
            <div class="calendar-grid">
              <div 
                v-for="(day, index) in availableDays" 
                :key="index"
                class="day-option"
                :class="{ 'selected': selectedDate === day.fullDate, 'unavailable': !day.available }"
                @click="day.available && selectDate(day.fullDate)"
              >
                <div class="day-name">{{ day.name }}</div>
                <div class="day-date">{{ day.date }}</div>
                <div v-if="day.available" class="day-time">{{ day.timeRange }}</div>
                <div v-else class="day-status">Unavailable</div>
              </div>
            </div>
          </div>

          <!-- Time Slot Selection -->
          <div v-if="selectedDate" class="time-slots-section">
            <h4 class="section-title">Select Time Slot</h4>
            <div v-if="loadingTimeSlots" class="loading-time-slots">
              <div class="spinner"></div>
              <p>Loading available time slots...</p>
            </div>
            <div v-else-if="availableTimeSlots.length > 0" class="time-slots-grid">
              <div 
                v-for="slot in availableTimeSlots" 
                :key="slot.time"
                class="time-slot"
                :class="{ 
                  'selected': selectedTime === slot.time, 
                  'unavailable': slot.isReserved 
                }"
                @click="!slot.isReserved && selectTime(slot.time)"
              >
                <div class="time-slot-time">{{ slot.time }}</div>
                <div v-if="slot.isReserved" class="time-slot-status">Booked</div>
              </div>
            </div>
            <div v-else class="no-time-slots">
              <p>No time slots available for this date.</p>
            </div>
          </div>
          
          <div class="booking-actions">
            <button 
              @click="confirmBooking" 
              :disabled="!selectedDate || !selectedTime"
              class="book-btn"
            >
              Book Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceCategoriesStore } from '../../stores/serviceCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';
import { useNotificationStore } from '../../stores/notifications';
import { useServiceBookingStore } from '../../stores/serviceBookingStore';
import serviceTimeSlotService from '../../services/serviceTimeSlotService';
import optimizedAuthService from '../../services/optimizedAuthService';
import PageHeader from '../../components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'ServiceCategoryDetails'
});

const route = useRoute();
const serviceCategoriesStore = useServiceCategoriesStore();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();
const serviceBookingStore = useServiceBookingStore();

// State
const category = ref(null);
const services = ref([]);
const loading = ref(false);
const error = ref(null);
const showBookingDialog = ref(false);
const selectedService = ref(null);
const selectedDate = ref(null);
const selectedTime = ref(null);
const availableDays = ref([]);
const availableTimeSlots = ref([]);
const loadingTimeSlots = ref(false);

// Computed
const categoryId = computed(() => route.params.id);

// Load category and services
onMounted(async () => {
  await loadCategory();
  await loadServices();
});

const loadCategory = async () => {
  if (projectStore.selectedProject?.id) {
    await serviceCategoriesStore.fetchCategories(projectStore.selectedProject.id);
    category.value = serviceCategoriesStore.getCategories.find(cat => cat.id === categoryId.value);
  }
};

const loadServices = async () => {
  if (!projectStore.selectedProject?.id || !categoryId.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    const servicesData = await serviceCategoriesStore.getServicesByCategory(
      projectStore.selectedProject.id, 
      categoryId.value
    );
    services.value = servicesData;
  } catch (err) {
    console.error('Error loading services:', err);
    error.value = err.message || 'Failed to load services';
  } finally {
    loading.value = false;
  }
};

const openBookingDialog = (service) => {
  selectedService.value = service;
  selectedDate.value = null;
  selectedTime.value = null;
  availableTimeSlots.value = [];
  generateAvailableDays();
  showBookingDialog.value = true;
};

const closeBookingDialog = () => {
  showBookingDialog.value = false;
  selectedService.value = null;
  selectedDate.value = null;
  selectedTime.value = null;
  availableDays.value = [];
  availableTimeSlots.value = [];
};

const generateAvailableDays = () => {
  if (!category.value?.availability) return;
  
  const days = [];
  const today = new Date();
  
  // Generate next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayKey = dayName.toLowerCase();
    const availability = category.value.availability[dayKey];
    
    const dayInfo = {
      name: dayName,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      available: availability?.available || false,
      timeRange: availability?.available ? `${availability.startTime} - ${availability.endTime}` : null
    };
    
    days.push(dayInfo);
  }
  
  availableDays.value = days;
};

const selectDate = async (date) => {
  selectedDate.value = date;
  selectedTime.value = null; // Reset time when date changes
  await loadTimeSlots(date);
};

const selectTime = (time) => {
  selectedTime.value = time;
};

// Helper function to get day of week from date
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return dayOfWeek;
};

const loadTimeSlots = async (date) => {
  if (!selectedService.value || !projectStore.selectedProject?.id || !category.value?.id) return;
  
  try {
    loadingTimeSlots.value = true;
    const slots = await serviceTimeSlotService.getAvailableTimeSlots(
      projectStore.selectedProject.id,
      selectedService.value.id,
      category.value.id,
      date
    );
    availableTimeSlots.value = slots;
  } catch (error) {
    console.error('Error loading time slots:', error);
    availableTimeSlots.value = [];
  } finally {
    loadingTimeSlots.value = false;
  }
};

const confirmBooking = async () => {
  if (!selectedDate.value || !selectedTime.value || !selectedService.value || !projectStore.selectedProject?.id) return;
  
  try {
    // Prepare booking data
    const bookingData = {
      serviceId: selectedService.value.id,
      categoryId: categoryId.value,
      serviceName: selectedService.value.englishTitle,
      categoryName: category.value?.englishTitle || 'Service Category',
      servicePrice: selectedService.value.price,
      selectedDate: selectedDate.value,
      selectedTime: selectedTime.value,
      notes: '',
      // Include category-level time slot configuration
      categoryTimeSlotInterval: category.value?.timeSlotInterval || 30,
      categoryStartTime: category.value?.availability?.[getDayOfWeek(selectedDate.value)]?.startTime || '09:00',
      categoryEndTime: category.value?.availability?.[getDayOfWeek(selectedDate.value)]?.endTime || '17:00'
    };

    // Create the booking
    await serviceBookingStore.createBooking(projectStore.selectedProject.id, bookingData);
    
    // Show success notification
    notificationStore.showSuccess('Service booked successfully!');
    
    // Wait a bit to ensure Firestore has committed the write
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh service bookings to show the new one
    const user = await optimizedAuthService.getCurrentUser();
    if (user) {
      await serviceBookingStore.fetchUserBookings(projectStore.selectedProject.id, user.uid);
    }
    
    // Close dialog after booking
    closeBookingDialog();
    
    console.log('Service booking created:', bookingData);
  } catch (error) {
    console.error('Error creating service booking:', error);
    notificationStore.showError('Failed to book service. Please try again.');
  }
};

</script>

<style scoped>
.service-category-details {
  padding: 0;
  background: #fafafa;
  min-height: 100%;
}


/* Category Info */
.category-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 16px 24px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-image {
  flex-shrink: 0;
}

.category-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

.default-image {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.category-details {
  flex: 1;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.category-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
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
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* Services List */
.services-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-item:last-child {
  border-bottom: none;
}

.service-item:hover {
  background: #f9fafb;
  margin: 0 -16px;
  padding: 16px;
  border-radius: 8px;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.service-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.service-price {
  font-size: 1rem;
  font-weight: 600;
  color: #AF1E23;
}

.service-arrow {
  color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.service-item:hover .service-arrow {
  color: #AF1E23;
  transform: translateX(4px);
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
.booking-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.booking-dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.dialog-content {
  padding: 20px;
}

.dialog-content .service-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.dialog-content .service-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.dialog-content .service-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.dialog-content .service-price {
  font-size: 1rem;
  font-weight: 600;
  color: #AF1E23;
}

.availability-section {
  margin-bottom: 24px;
}

.availability-section .section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.day-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.day-option:hover:not(.unavailable) {
  border-color: #AF1E23;
  background: #fef2f2;
}

.day-option.selected {
  border-color: #AF1E23;
  background: #fef2f2;
}

.day-option.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.day-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.day-date {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.day-time {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 500;
}

.day-status {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

/* Time Slots Section */
.time-slots-section {
  margin-bottom: 24px;
}

.loading-time-slots {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.loading-time-slots .spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.time-slot {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.time-slot:hover:not(.unavailable) {
  border-color: #AF1E23;
  background: #fef2f2;
}

.time-slot.selected {
  border-color: #AF1E23;
  background: #fef2f2;
}

.time-slot.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.time-slot-time {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.time-slot-status {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.no-time-slots {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.booking-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.book-btn {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.book-btn:hover:not(:disabled) {
  background: #8B1A1E;
  transform: translateY(-1px);
}

.book-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (min-width: 768px) {
  .service-category-details {
    padding: 32px 24px;
  }
  
  .category-info {
    padding: 32px;
  }
  
  .category-img,
  .default-image {
    width: 100px;
    height: 100px;
  }
  
  .category-title {
    font-size: 1.75rem;
  }
  
  .services-list {
    padding: 32px;
  }
  
  .booking-dialog {
    max-width: 600px;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

@media (max-width: 480px) {
  .booking-dialog-overlay {
    padding: 10px;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .day-option {
    padding: 12px 8px;
  }
}
</style>
