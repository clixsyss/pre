<template>
  <div class="my-bookings-page">
    <PageHeader 
      :title="$t('myBookings')" 
      :subtitle="projectName ? `${$t('bookingsIn')} ${projectName}` : $t('viewManageBookings')"
    />

    <div class="bookings-content">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          {{ $t('allBookings') }}
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'court' }"
          @click="setFilter('court')"
        >
          {{ $t('courtBookings') }}
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'academy' }"
          @click="setFilter('academy')"
        >
          {{ $t('academyPrograms') }}
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'service' }"
          @click="setFilter('service')"
        >
          {{ $t('serviceBookings') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ $t('loadingBookings') }}</p>
      </div>

      <!-- No Project Selected -->
      <div v-else-if="!projectId" class="no-project-state">
        <div class="no-project-icon">🏗️</div>
        <h3>{{ $t('noProjectSelected') }}</h3>
        <p>{{ $t('selectProjectToContinue') }}</p>
        <button @click="$router.push('/project-selection')" class="select-project-btn">
          {{ $t('switchProject') }}
        </button>
      </div>



      <!-- Empty State -->
      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ccc" stroke-width="2"/>
          </svg>
        </div>
        <h3>{{ $t('noBookingsFound') }}</h3>
        <p v-if="activeFilter === 'all'">{{ $t('noBookingsMessage') }}</p>
        <p v-else>{{ $t('noBookingsFound') }}</p>
        <button class="book-now-btn" @click="navigateToServices">
          {{ $t('bookNow') }}
        </button>
      </div>

      <!-- Bookings List -->
      <div v-else class="bookings-list">
        <div 
          v-for="booking in filteredBookings" 
          :key="booking.id"
          class="booking-card"
          :class="getStatusClass(booking.status)"
        >
          <!-- Compact Header -->
          <div class="card-header">
            <div class="booking-icon" :class="getTypeClass(booking.type)">
              <svg v-if="isCourtBooking(booking)" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H7V7H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 17H7V21H3V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 3H21V7H17V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 17H21V21H17V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 9H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="booking-info">
              <h3 class="booking-title">{{ getBookingTitle(booking) }}</h3>
              <p class="booking-subtitle">{{ getBookingSubtitle(booking) }}</p>
            </div>
            <div class="header-right">
              <span class="status-badge" :class="getStatusClass(booking.status)">
                {{ getStatusLabel(booking.status) }}
              </span>
            </div>
          </div>

          <!-- Compact Content -->
          <div class="card-content">
            <div class="details-row">
              <div class="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="detail-text">{{ formatBookingDate(booking) }}</span>
              </div>
              <div class="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="detail-text">{{ getBookingTime(booking) }}</span>
              </div>
              <div class="detail-item price-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="detail-text price-text">{{ booking.totalPrice || booking.price }} EGP</span>
              </div>
            </div>

            <!-- Additional Info (if any) -->
            <div v-if="(isAcademyBooking(booking) && booking.studentName) || (isCourtBooking(booking) && booking.courtLocation)" class="additional-info">
              <span v-if="isAcademyBooking(booking) && booking.studentName" class="info-tag">
                Student: {{ booking.studentName }}
              </span>
              <span v-if="isCourtBooking(booking) && booking.courtLocation" class="info-tag">
                {{ booking.courtLocation }}
              </span>
            </div>
          </div>

          <!-- Compact Footer -->
          <div class="card-footer">
            <div class="booking-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ formatCreationDate(booking) }}</span>
            </div>
            <div class="card-actions">
              <button 
                class="action-btn view-btn"
                @click="viewBookingDetails(booking)"
              >
                View
              </button>
              <button 
                v-if="canCancel(booking)"
                class="action-btn cancel-btn"
                @click="cancelBooking(booking)"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div v-if="selectedBooking" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button class="close-btn" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>Booking Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Type:</span>
                <span class="value">{{ getTypeLabel(selectedBooking.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value">{{ getStatusLabel(selectedBooking.status) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Created:</span>
                <span class="value">{{ formatBookingDate(selectedBooking) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>{{ isCourtBooking(selectedBooking) ? 'Court Details' : 'Program Details' }}</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">{{ isCourtBooking(selectedBooking) ? 'Sport:' : 'Program:' }}</span>
                <span class="value">{{ isCourtBooking(selectedBooking) ? (selectedBooking.sport || 'Court Sport') : selectedBooking.programName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">{{ isCourtBooking(selectedBooking) ? 'Court:' : 'Academy:' }}</span>
                <span class="value">{{ isCourtBooking(selectedBooking) ? (selectedBooking.courtName || `${selectedBooking.courtType} Court`) : selectedBooking.academyName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{ formatBookingDate(selectedBooking) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Time:</span>
                <span class="value">{{ getBookingTime(selectedBooking) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Price:</span>
                <span class="value">{{ selectedBooking.totalPrice || selectedBooking.price }} EGP</span>
              </div>
              <!-- Additional academy-specific details -->
              <div v-if="selectedBooking.type === 'academy' && selectedBooking.category" class="detail-item">
                <span class="label">Category:</span>
                <span class="value">{{ selectedBooking.category }}</span>
              </div>
              <div v-if="selectedBooking.type === 'academy' && selectedBooking.ageGroup" class="detail-item">
                <span class="label">Age Group:</span>
                <span class="value">{{ selectedBooking.ageGroup }}</span>
              </div>
              <div v-if="selectedBooking.type === 'academy' && selectedBooking.duration" class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ selectedBooking.duration }} {{ getDurationUnit(selectedBooking.pricingType) }}</span>
              </div>
              <div v-if="selectedBooking.type === 'academy' && selectedBooking.pricingType" class="detail-item">
                <span class="label">Pricing:</span>
                <span class="value">{{ getPricingTypeLabel(selectedBooking.pricingType) }}</span>
              </div>
            </div>
          </div>

          <div v-if="isAcademyBooking(selectedBooking)" class="detail-section">
            <h3>Student Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Student Name:</span>
                <span class="value">{{ selectedBooking.studentName || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Student Age:</span>
                <span class="value">{{ selectedBooking.studentAge || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Parent/Guardian:</span>
                <span class="value">{{ selectedBooking.parentName || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">{{ selectedBooking.phone || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ selectedBooking.email || 'N/A' }}</span>
              </div>
              <div v-if="selectedBooking.notes" class="detail-item">
                <span class="label">Notes:</span>
                <span class="value">{{ selectedBooking.notes }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            v-if="canComplete(selectedBooking)"
            class="complete-booking-btn"
            @click="completeBooking(selectedBooking)"
          >
            Complete Booking
          </button>
          <button 
            v-if="canCancel(selectedBooking)"
            class="cancel-booking-btn"
            @click="cancelBooking(selectedBooking)"
          >
            Cancel Booking
          </button>
          <button class="close-modal-btn" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';
import { useNotificationStore } from 'src/stores/notifications';
import { useServiceBookingStore } from 'src/stores/serviceBookingStore';
import bookingService from 'src/services/bookingService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import PageHeader from '../../components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'MyBookingsPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();
const serviceBookingStore = useServiceBookingStore();

// Reactive data
const loading = ref(true);
const error = ref(null);
const activeFilter = ref('all');
const selectedBooking = ref(null);



// Computed properties
const projectId = computed(() => projectStore.selectedProject?.id);
const projectName = computed(() => projectStore.selectedProject?.name);

const filteredBookings = computed(() => {
  const allBookings = [...academiesStore.userBookings, ...serviceBookingStore.getBookings];
  
  if (activeFilter.value === 'all') {
    return allBookings;
  } else if (activeFilter.value === 'court') {
    return allBookings.filter(booking => isCourtBooking(booking));
  } else if (activeFilter.value === 'academy') {
    return allBookings.filter(booking => isAcademyBooking(booking));
  } else if (activeFilter.value === 'service') {
    return allBookings.filter(booking => isServiceBooking(booking));
  }
  return allBookings;
});

// Methods
const setFilter = (filter) => {
  activeFilter.value = filter;
};

const getTypeLabel = (type) => {
  if (type === 'court') return 'Court';
  if (type === 'academy') return 'Academy';
  if (type === 'service') return 'Service';
  return 'Booking';
};

const getTypeClass = (type) => {
  if (type === 'court') return 'court-type';
  if (type === 'academy') return 'academy-type';
  if (type === 'service') return 'service-type';
  return 'other-type';
};

// Helper function to detect court bookings by their data structure
const isCourtBooking = (booking) => {
  return booking.type === 'court' || 
         (booking.courtType && (booking.courtLocation || booking.bookingTime));
};

// Helper function to detect academy bookings by their data structure
const isAcademyBooking = (booking) => {
  return booking.type === 'academy' || 
         (booking.programName && (booking.studentName || booking.academyName));
};

// Helper function to detect service bookings by their data structure
const isServiceBooking = (booking) => {
  return booking.type === 'service' || 
         (booking.serviceName && booking.categoryName && booking.selectedDate);
};

const getStatusLabel = (status) => {
  const statusMap = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'enrolled': 'Enrolled'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusMap = {
    'confirmed': 'confirmed',
    'pending': 'pending',
    'cancelled': 'cancelled',
    'enrolled': 'enrolled',
    'completed': 'completed'
  };
  return statusMap[status] || 'pending';
};

const getBookingTitle = (booking) => {
  if (isCourtBooking(booking)) {
    const sport = booking.sport || 'Court';
    const courtName = booking.courtName || `${booking.courtType} Court`;
    return `${sport} - ${courtName}`;
  } else if (isAcademyBooking(booking)) {
    return booking.programName || 'Academy Program';
  } else {
    return 'Service Booking';
  }
};

const getBookingSubtitle = (booking) => {
  if (isCourtBooking(booking)) {
    return `Court Booking`;
  } else if (isAcademyBooking(booking)) {
    const academy = booking.academyName || 'Academy';
    return `${academy} Program`;
  } else {
    return 'Service';
  }
};


const formatBookingDate = (booking) => {
  // Try different date fields in order of preference
  const dateFields = [booking.date, booking.bookingDate, booking.createdAt];
  
  for (const dateField of dateFields) {
    if (dateField) {
      try {
        let d;
        
        // Handle Firestore timestamp
        if (dateField && typeof dateField === 'object' && dateField.seconds) {
          d = new Date(dateField.seconds * 1000);
        } else {
          d = new Date(dateField);
        }
        
        // Check if the date is valid
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (error) {
        console.error('Error formatting booking date:', error, 'Date value:', dateField);
        continue;
      }
    }
  }
  
  return 'N/A';
};

const formatCreationDate = (booking) => {
  if (!booking.createdAt) return 'N/A';
  
  try {
    let d;
    
    // Handle Firestore timestamp
    if (booking.createdAt && typeof booking.createdAt === 'object' && booking.createdAt.seconds) {
      d = new Date(booking.createdAt.seconds * 1000);
    } else {
      d = new Date(booking.createdAt);
    }
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      return 'N/A';
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting creation date:', error, 'Date value:', booking.createdAt);
    return 'N/A';
  }
};

const getBookingTime = (booking) => {
  if (isCourtBooking(booking)) {
    if (booking.timeSlots && Array.isArray(booking.timeSlots)) {
      return booking.timeSlots.join(', ');
    } else if (booking.bookingTime) {
      return booking.bookingTime;
    }
    return 'Time not specified';
  } else if (isAcademyBooking(booking)) {
    return 'Program Schedule';
  }
  return 'N/A';
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

const canCancel = (booking) => {
  return ['confirmed', 'pending', 'enrolled'].includes(booking.status);
};

const canComplete = (booking) => {
  return ['confirmed', 'pending', 'enrolled', 'open', 'processing'].includes(booking.status);
};

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking;
};

const closeModal = () => {
  selectedBooking.value = null;
};

const cancelBooking = async (booking) => {
  try {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await bookingService.cancelBooking(projectId.value, booking.id);
      
      // Refresh bookings after cancellation
      const user = await optimizedAuthService.getCurrentUser();
      if (user && projectId.value) {
        await academiesStore.fetchUserBookings(user.uid, projectId.value);
        await serviceBookingStore.fetchUserBookings(projectId.value, user.uid);
      }
      
      notificationStore.showSuccess('Booking cancelled successfully');
      closeModal();
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    notificationStore.showError('Failed to cancel booking. Please try again.');
  }
};

const completeBooking = async (booking) => {
  try {
    if (confirm('Are you sure you want to mark this booking as completed?')) {
      const user = await optimizedAuthService.getCurrentUser();
      if (!user || !projectId.value) {
        notificationStore.showError('Unable to complete booking. Please try again.');
        return;
      }

      if (isServiceBooking(booking)) {
        await serviceBookingStore.completeBooking(projectId.value, booking.id);
      } else {
        await academiesStore.completeBooking(projectId.value, booking.id);
      }
      
      // Refresh bookings after completion
      await academiesStore.fetchUserBookings(user.uid, projectId.value);
      await serviceBookingStore.fetchUserBookings(projectId.value, user.uid);
      
      notificationStore.showSuccess('Booking completed successfully');
      closeModal();
    }
  } catch (error) {
    console.error('Error completing booking:', error);
    notificationStore.showError('Failed to complete booking. Please try again.');
  }
};

const navigateToServices = () => {
  router.push('/services');
};









// Lifecycle
onMounted(async () => {
  if (projectId.value) {
    await fetchUserBookings();
  } else {
    error.value = 'No project selected. Please select a project first.';
    loading.value = false;
  }
});

// Watch for project changes
watch(projectId, async (newProjectId) => {
  if (newProjectId) {
    await fetchUserBookings();
  } else {
    // Clear bookings when no project is selected
    academiesStore.clearUserBookings();
    // Also clear any error state
    error.value = null;
  }
});

const fetchUserBookings = async () => {
  if (!projectId.value) {
    return;
  }
  
  try {
    loading.value = true;
    
    const user = await optimizedAuthService.getCurrentUser();
    
    if (!user) {
      error.value = 'User not authenticated. Please sign in again.';
      return;
    }
    
    console.log('Fetching user bookings for:', {
      userId: user.uid,
      projectId: projectId.value
    });
    
    await academiesStore.fetchUserBookings(user.uid, projectId.value);
    
    // Also fetch service bookings
    await serviceBookingStore.fetchUserBookings(projectId.value, user.uid);
    
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    error.value = 'Failed to fetch bookings: ' + error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.my-bookings-page {
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto;
}

/* Page header styles moved to PageHeader component */

.bookings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
}

.filter-tab:hover {
  background: #f8f9fa;
}

.filter-tab.active {
  background: #AF1E23;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  margin: 0;
}

.no-project-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.no-project-icon {
  font-size: 4rem;
  color: #AF1E23;
  margin-bottom: 16px;
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





.empty-icon {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: #999;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.book-now-btn {
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

.book-now-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.booking-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

.booking-card.confirmed {
  border-left: 3px solid #28a745;
}

.booking-card.pending {
  border-left: 3px solid #ffc107;
}

.booking-card.cancelled {
  border-left: 3px solid #dc3545;
  opacity: 0.8;
}

.booking-card.enrolled {
  border-left: 3px solid #17a2b8;
}

/* Compact Header */
.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.booking-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-icon.court-type {
  background: #e3f2fd;
  color: #1976d2;
}

.booking-icon.academy-type {
  background: #f3e5f5;
  color: #7b1fa2;
}

.booking-icon.service-type {
  background: #fff3e0;
  color: #e65100;
}

.booking-info {
  flex: 1;
  min-width: 0;
}

.booking-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px 0;
  line-height: 1.3;
}

.booking-subtitle {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.enrolled {
  background: #d1ecf1;
  color: #0c5460;
}

/* Compact Content */
.card-content {
  padding: 16px 20px;
}

.details-row {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.85rem;
}

.detail-item.price-item {
  margin-left: auto;
}

.detail-text {
  font-weight: 500;
}

.detail-text.price-text {
  color: #AF1E23;
  font-weight: 600;
}

.additional-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-tag {
  background: #f8f9fa;
  color: #666;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

/* Compact Footer */
.card-footer {
  background: #f8f9fa;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
}

.booking-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 0.8rem;
  font-weight: 400;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.view-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.view-btn:hover {
  background: #e9ecef;
  color: #333;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background: #c82333;
}

.complete-btn {
  background: #28a745;
  color: white;
}

.complete-btn:hover {
  background: #218838;
}

/* Modal Styles */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e1e5e9;
  padding-bottom: 20px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-grid .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-grid .detail-item:last-child {
  border-bottom: none;
}

.detail-grid .label {
  font-weight: 600;
  color: #333;
}

.detail-grid .value {
  color: #666;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  border-top: 1px solid #e1e5e9;
  padding-top: 20px;
}

.cancel-booking-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-booking-btn:hover {
  background: #c82333;
}

.complete-booking-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.complete-booking-btn:hover {
  background: #218838;
}

.close-modal-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: #5a6268;
}



/* Responsive Design */
@media (max-width: 768px) {
  .my-bookings-page {
    padding: 16px 0;
  }
  
  .filter-tabs {
    flex-direction: column;
  }
  
  .details-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-item.price-item {
    margin-left: 0;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
}

@media (max-width: 480px) {
  /* Page header responsive styles moved to PageHeader component */
  
  .card-header {
    padding: 12px 16px;
  }
  
  .card-content {
    padding: 12px 16px;
  }
  
  .card-footer {
    padding: 10px 16px;
  }
  
  .booking-icon {
    width: 32px;
    height: 32px;
  }
  
  .booking-title {
    font-size: 0.95rem;
  }
  
  .booking-subtitle {
    font-size: 0.8rem;
  }
  
  .details-row {
    gap: 6px;
  }
  
  .detail-item {
    font-size: 0.8rem;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 0.75rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
}
</style>
