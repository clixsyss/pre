<template>
  <div class="upcoming-bookings-card" @click="goToBookings">
    <div class="card-header">
      <h3>Upcoming Bookings</h3>
    </div>

    <div class="card-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>

      <!-- Bookings List -->
      <div v-else-if="upcomingBookings.length > 0" class="bookings-list">
        <div 
          v-for="booking in upcomingBookings.slice(0, 3)" 
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
            <span class="status-badge upcoming">Upcoming</span>
          </div>
        </div>
        
        <div v-if="upcomingBookings.length > 3" class="view-more">
          +{{ upcomingBookings.length - 3 }} more
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
        <p>No upcoming bookings</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';
import { getAuth } from 'firebase/auth';

// Component name for ESLint
defineOptions({
  name: 'UpcomingBookingsCard'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Reactive data
const loading = ref(true);

// Computed properties
const upcomingBookings = computed(() => {
  const allBookings = academiesStore.userBookings;
  console.log('All bookings from store:', allBookings);
  
  const filtered = allBookings.filter(booking => {
    console.log('Checking booking:', booking);
    
    if (booking.type === 'court' && booking.date) {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const isUpcoming = bookingDate >= today;
      console.log('Court booking date check:', {
        bookingDate: bookingDate.toISOString(),
        today: today.toISOString(),
        isUpcoming
      });
      
      return isUpcoming && booking.status !== 'cancelled';
    } else if (booking.type === 'academy') {
      // For academy programs, consider them upcoming if enrolled
      const isEnrolled = booking.status === 'enrolled';
      console.log('Academy booking status check:', {
        status: booking.status,
        isEnrolled
      });
      return isEnrolled;
    }
    return false;
  }).sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });
  
  console.log('Filtered upcoming bookings:', filtered);
  return filtered;
});

// Methods
const getBookingTitle = (booking) => {
  if (booking.type === 'court') {
    return `${booking.sport} - ${booking.courtName}`;
  } else {
    return booking.programName;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Ongoing";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const goToBookings = () => {
  router.push('/my-bookings');
};

// Fetch bookings function
const fetchBookings = async () => {
  try {
    loading.value = true;
    const auth = getAuth();
    if (auth.currentUser && projectStore.selectedProject?.id) {
      console.log('Fetching user bookings for:', {
        userId: auth.currentUser.uid,
        projectId: projectStore.selectedProject.id
      });
      await academiesStore.fetchUserBookings(auth.currentUser.uid, projectStore.selectedProject.id);
    } else {
      console.log('Cannot fetch bookings - missing user or project:', {
        hasUser: !!auth.currentUser,
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

// Lifecycle
onMounted(() => {
  fetchBookings();
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

.upcoming-bookings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #AF1E23;
}

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

.booking-item:hover {
  background: #fff5f2;
}

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

.view-more {
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  font-style: italic;
  padding: 8px;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .status-badge {
    align-self: flex-end;
  }
}
</style>
