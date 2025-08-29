<template>
  <div class="my-bookings-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>My Bookings</h1>
      </div>
      <p class="header-subtitle">{{ projectName ? `Bookings in ${projectName}` : 'View and manage all your bookings' }}</p>
    </div>

    <div class="bookings-content">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          All Bookings
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'court' }"
          @click="setFilter('court')"
        >
          Court Bookings
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'academy' }"
          @click="setFilter('academy')"
        >
          Academy Programs
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>

      <!-- No Project Selected -->
      <div v-else-if="!projectId" class="no-project-state">
        <div class="no-project-icon">🏗️</div>
        <h3>No Project Selected</h3>
        <p>Please select a project to view your bookings.</p>
        <button @click="$router.push('/project-selection')" class="select-project-btn">
          Select Project
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
        <h3>No Bookings Found</h3>
        <p v-if="activeFilter === 'all'">You haven't made any bookings yet.</p>
        <p v-else>No {{ activeFilter }} bookings found.</p>
        <button class="book-now-btn" @click="navigateToServices">
          Book Now
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
          <div class="booking-header">
            <div class="booking-type">
              <span class="type-badge" :class="getTypeClass(booking.type)">
                {{ getTypeLabel(booking.type) }}
              </span>
              <span class="status-badge" :class="getStatusClass(booking.status)">
                {{ getStatusLabel(booking.status) }}
              </span>
            </div>
            <div class="booking-date">
              {{ formatDate(booking.createdAt) }}
            </div>
          </div>

          <div class="booking-content">
            <div class="booking-title">
              <h3>{{ getBookingTitle(booking) }}</h3>
              <p class="booking-subtitle">{{ getBookingSubtitle(booking) }}</p>
            </div>

            <div class="booking-details">
              <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ formatBookingDate(booking) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ getBookingTime(booking) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Price:</span>
                <span class="detail-value">{{ booking.totalPrice || booking.price }} EGP</span>
              </div>
              <!-- Academy-specific details -->
              <div v-if="isAcademyBooking(booking) && booking.studentName" class="detail-item">
                <span class="detail-label">Student:</span>
                <span class="detail-value">{{ booking.studentName }}</span>
              </div>
              <div v-if="isAcademyBooking(booking) && booking.category" class="detail-item">
                <span class="detail-label">Category:</span>
                <span class="detail-value">{{ booking.category }}</span>
              </div>
              <!-- Court-specific details -->
              <div v-if="isCourtBooking(booking) && booking.courtLocation" class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">{{ booking.courtLocation }}</span>
              </div>
              <div v-if="isCourtBooking(booking) && booking.courtType" class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ booking.courtType }}</span>
              </div>
            </div>

            <div class="booking-actions">
              <button 
                class="action-btn view-btn"
                @click="viewBookingDetails(booking)"
              >
                View Details
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
                <span class="value">{{ formatDate(selectedBooking.createdAt) }}</span>
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
import bookingService from 'src/services/bookingService';
import { getAuth } from 'firebase/auth';

// Component name for ESLint
defineOptions({
  name: 'MyBookingsPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Reactive data
const loading = ref(true);
const error = ref(null);
const activeFilter = ref('all');
const selectedBooking = ref(null);



// Computed properties
const projectId = computed(() => projectStore.selectedProject?.id);
const projectName = computed(() => projectStore.selectedProject?.name);

const filteredBookings = computed(() => {
  if (activeFilter.value === 'all') {
    return academiesStore.userBookings;
  } else if (activeFilter.value === 'court') {
    return academiesStore.userBookings.filter(booking => isCourtBooking(booking));
  } else if (activeFilter.value === 'academy') {
    return academiesStore.userBookings.filter(booking => isAcademyBooking(booking));
  }
  return academiesStore.userBookings;
});

// Methods
const setFilter = (filter) => {
  activeFilter.value = filter;
};

const getTypeLabel = (type) => {
  if (type === 'court') return 'Court';
  if (type === 'academy') return 'Academy';
  return 'Service';
};

const getTypeClass = (type) => {
  if (type === 'court') return 'court-type';
  if (type === 'academy') return 'academy-type';
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

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatBookingDate = (booking) => {
  if (booking.date) {
    const d = new Date(booking.date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (booking.bookingDate) {
    const d = new Date(booking.bookingDate);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (booking.createdAt) {
    const d = new Date(booking.createdAt);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return 'N/A';
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

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking;
};

const closeModal = () => {
  selectedBooking.value = null;
};

const cancelBooking = async (booking) => {
  try {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await bookingService.cancelBooking(booking.id);
      await academiesStore.fetchUserBookings('current-user-id'); // This should come from auth store
      alert('Booking cancelled successfully');
      closeModal();
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Failed to cancel booking. Please try again.');
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
    
    const auth = getAuth();
    
    let userId;
    if (auth.currentUser) {
      userId = auth.currentUser.uid;
    } else {
      // Try to get user ID from existing bookings first
      if (academiesStore.userBookings.length > 0) {
        userId = academiesStore.userBookings[0].userId;
      } else {
        // Fall back to localStorage
        userId = localStorage.getItem('currentUserId');
      }
      
      if (!userId) {
        error.value = 'No user ID found. Please try registering for an academy first.';
        return;
      }
    }
    
    await academiesStore.fetchUserBookings(userId, projectId.value);
    
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
  background: #ff6b35;
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
  border-top: 4px solid #ff6b35;
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
  color: #ff6b35;
  margin-bottom: 16px;
}

.select-project-btn {
  background: #ff6b35;
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
  background: #e55a2b;
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
  background: #ff6b35;
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
  background: #e55a2b;
  transform: translateY(-1px);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.booking-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.booking-card.confirmed {
  border-left: 4px solid #28a745;
}

.booking-card.pending {
  border-left: 4px solid #ffc107;
}

.booking-card.cancelled {
  border-left: 4px solid #dc3545;
  opacity: 0.7;
}

.booking-card.enrolled {
  border-left: 4px solid #17a2b8;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.booking-type {
  display: flex;
  gap: 8px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-badge.court-type {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.academy-type {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
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

.booking-date {
  font-size: 0.875rem;
  color: #666;
}

.booking-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.booking-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
  font-size: 0.875rem;
}

.detail-value {
  color: #333;
  font-weight: 500;
  font-size: 0.875rem;
}

.booking-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background: #f8f9fa;
  color: #333;
}

.view-btn:hover {
  background: #e9ecef;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background: #c82333;
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
  
  .booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .booking-card {
    padding: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
}
</style>
