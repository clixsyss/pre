<template>
  <div class="upcoming-bookings-card" @click="goToBookings">
    <div class="card-header">
      <h3>{{ $t('upcomingBookings') }}</h3>
    </div>

    <div class="card-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ $t('loadingBookings') }}</p>
      </div>

      <!-- Bookings List -->
      <div v-else-if="upcomingBookings.length > 0" class="bookings-list">
        <div 
          v-for="booking in upcomingBookings.slice(0, 4)" 
          :key="booking.id" 
          class="booking-item"
        >
          <div class="booking-info">
            <div class="booking-title">
              {{ getBookingTitle(booking) }}
            </div>
            <div class="booking-date">
              {{ formatDate(booking.date) }}
            </div>
          </div>
          <div class="booking-status">
            <span class="status-badge" :class="getStatusClass(booking)">
              {{ getStatusLabel(booking) }}
            </span>
          </div>
        </div>
        
        <div v-if="upcomingBookings.length > 4" class="view-more">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ upcomingBookings.length - 4 }} {{ $t('moreBookings') }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ccc" stroke-width="2"/>
          </svg>
        </div>
        <p>{{ $t('noUpcomingBookings') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useServiceBookingStore } from 'src/stores/serviceBookingStore';
import { useProjectStore } from 'src/stores/projectStore';
import optimizedAuthService from '../services/optimizedAuthService';

// Component name for ESLint
defineOptions({
  name: 'UpcomingBookingsCard'
});

const router = useRouter();
const { t } = useI18n();
const academiesStore = useAcademiesStore();
const serviceBookingStore = useServiceBookingStore();
const projectStore = useProjectStore();

// Reactive data
const loading = ref(true);

// Computed properties
const upcomingBookings = computed(() => {
  // Combine all booking types from different stores
  const courtAndAcademyBookings = academiesStore.userBookings || [];
  const serviceBookings = serviceBookingStore.getBookings || [];
  
  console.log('Court/Academy bookings:', courtAndAcademyBookings.length);
  console.log('Service bookings:', serviceBookings.length);
  
  // Filter court and academy bookings
  const upcomingCourtAndAcademy = courtAndAcademyBookings.filter(booking => {
    if (booking.type === 'court' && booking.date) {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate >= today && booking.status !== 'cancelled';
    } else if (booking.type === 'academy') {
      return booking.status === 'enrolled';
    }
    return false;
  });
  
  // Filter service bookings (open/processing status = upcoming)
  // EXCLUDE any request submissions - they're handled separately
  const upcomingServices = serviceBookings.filter(booking => {
    // Service bookings MUST have serviceId (requests don't have this)
    if (!booking.serviceId) return false;
    // Must NOT have formData or fieldMetadata (those are for request submissions)
    if (booking.formData || booking.fieldMetadata) return false;
    // Must have serviceName
    if (!booking.serviceName) return false;
    
    // Check if booking is upcoming (status + date)
    const upcomingStatuses = ['open', 'pending', 'processing', 'confirmed'];
    if (upcomingStatuses.includes(booking.status)) {
      // Check if the selected date is in the future
      if (booking.selectedDate) {
        const bookingDate = new Date(booking.selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      }
      // If no specific date, still show as upcoming
      return true;
    }
    return false;
  }).map(booking => ({
    ...booking,
    type: 'service',
    date: booking.selectedDate
  }));
  
  // Combine all bookings
  const allUpcoming = [...upcomingCourtAndAcademy, ...upcomingServices];
  
  // Sort by date (earliest first)
  const sorted = allUpcoming.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    // If one has a date and the other doesn't, prioritize the one with a date
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });
  
  return sorted;
});

// Methods
const getBookingTitle = (booking) => {
  if (booking.type === 'court') {
    return `${booking.sport} - ${booking.courtName}`;
  } else if (booking.type === 'academy') {
    return booking.programName || t('academyProgram');
  } else if (booking.type === 'service') {
    return booking.serviceName || booking.categoryName || t('serviceRequest');
  }
  return t('booking');
};

const formatDate = (dateString) => {
  if (!dateString) return t('ongoing');
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getStatusLabel = (booking) => {
  if (booking.type === 'service') {
    // Support both old and new status values from dashboard
    if (booking.status === 'open' || booking.status === 'pending') return t('pending');
    if (booking.status === 'processing' || booking.status === 'confirmed') return t('inProgress');
    if (booking.status === 'closed' || booking.status === 'completed') return t('completed');
    if (booking.status === 'rejected' || booking.status === 'cancelled') return t('rejected');
  } else if (booking.type === 'court') {
    return t('upcoming');
  } else if (booking.type === 'academy') {
    return t('enrolled');
  }
  return t('upcoming');
};

const getStatusClass = (booking) => {
  if (booking.type === 'service') {
    // Support both old and new status values from dashboard
    if (booking.status === 'open' || booking.status === 'pending') return 'pending';
    if (booking.status === 'processing' || booking.status === 'confirmed') return 'processing';
    if (booking.status === 'closed' || booking.status === 'completed') return 'completed';
    if (booking.status === 'rejected' || booking.status === 'cancelled') return 'rejected';
  } else if (booking.type === 'court') {
    return 'upcoming';
  } else if (booking.type === 'academy') {
    return 'enrolled';
  }
  return 'upcoming';
};

const goToBookings = () => {
  router.push('/my-bookings');
};

// Fetch bookings function
const fetchBookings = async () => {
  try {
    loading.value = true;
    const user = await optimizedAuthService.getCurrentUser();
    if (user && projectStore.selectedProject?.id) {
      console.log('Fetching user bookings for:', {
        userId: user.uid,
        projectId: projectStore.selectedProject.id
      });
      await academiesStore.fetchUserBookings(user.uid, projectStore.selectedProject.id);
      await serviceBookingStore.fetchUserBookings(projectStore.selectedProject.id, user.uid);
    } else {
      console.log('Cannot fetch bookings - missing user or project:', {
        hasUser: !!user,
        hasProject: !!projectStore.selectedProject?.id,
        projectId: projectStore.selectedProject?.id
      });
    }
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  } finally {
    loading.value = false;
  }
};

// Watch for project changes
watch(() => projectStore.selectedProject?.id, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('Project changed, refetching bookings:', { oldProjectId, newProjectId });
    fetchBookings();
  }
});

// Watch for both user and project to be available
watch([() => projectStore.selectedProject?.id, () => projectStore.userProjects.length], ([projectId, projectsCount]) => {
  if (projectId && projectsCount > 0) {
    console.log('Project and user available, fetching bookings:', { projectId, projectsCount });
    fetchBookings();
  }
});

// Lifecycle
onMounted(async () => {
  // Only fetch if we have both user and project
  const user = await optimizedAuthService.getCurrentUser();
  if (user && projectStore.selectedProject?.id) {
    fetchBookings();
  } else {
    console.log('Waiting for user and project to be available...');
  }
});
</script>

<style scoped>
.upcoming-bookings-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Mobile app - hover effects disabled */
/* .upcoming-bookings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #AF1E23;
} */

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.card-content {
  min-height: 120px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .booking-item:hover {
  background: #fff5f2;
} */

.booking-info {
  flex: 1;
}

.booking-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.booking-date {
  color: #666;
  font-size: 0.8rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-badge.upcoming {
  background: #d4edda;
  color: #155724;
}

.status-badge.enrolled {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.view-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #AF1E23;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 8px 4px;
  margin-top: 4px;
}

.view-more svg {
  flex-shrink: 0;
}

.view-more span {
  line-height: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
}

.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upcoming-bookings-card {
    padding: 16px;
  }
  
  .card-header h3 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .booking-item {
    align-items: flex-start;
    gap: 8px;
  }
  
  .status-badge {
    align-self: flex-end;
  }
}
</style>
