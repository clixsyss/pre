<template>
  <div class="services-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Services</h1>
          <p class="hero-subtitle">Smart home devices and other services</p>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Services Tab -->
      <div v-if="activeTab === 'services'" class="services-content">
        <!-- Loading State -->
        <div v-if="serviceCategoriesStore.isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading services...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="serviceCategoriesStore.getError" class="error-container">
          <p>{{ serviceCategoriesStore.getError }}</p>
          <button @click="loadServiceCategories" class="retry-btn">Retry</button>
        </div>

        <!-- Services Grid -->
        <div v-else class="services-grid">
      <!-- Dynamic Service Categories -->
      <div 
        v-for="category in serviceCategoriesStore.getCategories" 
        :key="category.id" 
        class="service-card" 
        @click="navigateToCategory(category)"
      >
        <div class="service-icon">
          <img 
            v-if="category.imageUrl" 
            :src="category.imageUrl" 
            :alt="category.englishTitle"
            class="service-image"
          />
          <svg 
            v-else 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="default-icon"
          >
            <path d="M14.7 6.3C14.7 4.4 13.3 3 11.4 3C9.5 3 8.1 4.4 8.1 6.3C8.1 8.2 9.5 9.6 11.4 9.6C13.3 9.6 14.7 8.2 14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="service-content">
          <h3 class="service-name">{{ category.englishTitle }}</h3>
        </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Static Services -->
      <!-- Smart Devices -->
      <div class="service-card" @click="navigateToSmartDevices">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="service-content">
          <h3 class="service-name">Smart Devices</h3>
          <p class="service-description">Control your smart home devices and automation</p>
      </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Calendar  -->
       <div class="service-card" @click="navigateToCalendar">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 18H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="service-content">
          <h3 class="service-name">Calendar</h3>
          <p class="service-description">View your schedule and upcoming events</p>
        </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
       </div>

      <!-- My Bookings -->
      <div class="service-card" @click="navigateToMyBookings">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="service-content">
          <h3 class="service-name">My Bookings</h3>
          <p class="service-description">Manage your reservations and appointments</p>
      </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Equipment Rental -->
      <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Equipment Rental</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->

      <!-- Event Planning -->
      <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 18H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Event Planning</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->

      <!-- Membership Plans -->
      <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Membership Plans</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->
    </div>
      </div>

      <!-- Open Bookings Tab -->
      <div v-else-if="activeTab === 'open'" class="bookings-content">
        <div v-if="loadingBookings" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading open bookings...</p>
        </div>
        <div v-else-if="openBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2"/>
              <path d="M12 8V12L15 15" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>No Open Bookings</h3>
          <p>You don't have any open service bookings at the moment.</p>
        </div>
        <div v-else class="bookings-list">
          <div 
            v-for="booking in openBookings" 
            :key="booking.id"
            class="booking-card"
            @click="openBookingModal(booking)"
          >
            <div class="booking-header">
              <h3 class="booking-title">{{ booking.serviceName }}</h3>
              <div class="header-right">
                <span class="booking-status open">{{ booking.status }}</span>
                <div v-if="getUnreadCount(booking) > 0" class="unread-badge">
                  {{ getUnreadCount(booking) }}
                </div>
              </div>
            </div>
            <div class="booking-details">
              <p class="booking-category">{{ booking.categoryName }}</p>
              <p class="booking-date">{{ formatDate(booking.selectedDate) }}</p>
              <p class="booking-price">EGP {{ booking.servicePrice }}</p>
            </div>
            <div class="booking-footer">
              <span class="last-message">
                {{ getLastMessagePreview(booking) }}
              </span>
              <span class="booking-time">{{ formatTime(booking.lastMessageAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Bookings Tab -->
      <div v-else-if="activeTab === 'closed'" class="bookings-content">
        <div v-if="loadingBookings" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading closed bookings...</p>
        </div>
        <div v-else-if="closedBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2"/>
              <path d="M9 12L11 14L15 10" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Closed Bookings</h3>
          <p>You don't have any closed service bookings yet.</p>
        </div>
        <div v-else class="bookings-list">
          <div 
            v-for="booking in closedBookings" 
            :key="booking.id"
            class="booking-card"
            @click="openBookingModal(booking)"
          >
            <div class="booking-header">
              <h3 class="booking-title">{{ booking.serviceName }}</h3>
              <div class="header-right">
                <span class="booking-status closed">{{ booking.status }}</span>
                <div v-if="getUnreadCount(booking) > 0" class="unread-badge">
                  {{ getUnreadCount(booking) }}
                </div>
              </div>
            </div>
            <div class="booking-details">
              <p class="booking-category">{{ booking.categoryName }}</p>
              <p class="booking-date">{{ formatDate(booking.selectedDate) }}</p>
              <p class="booking-price">EGP {{ booking.servicePrice }}</p>
            </div>
            <div class="booking-footer">
              <span class="last-message">
                {{ getLastMessagePreview(booking) }}
              </span>
              <span class="booking-time">{{ formatTime(booking.lastMessageAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Booking Modal -->
    <ServiceBookingModal
      :isOpen="showBookingModal"
      :booking="selectedBooking"
      @close="closeBookingModal"
      @openChat="openBookingChat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { useServiceCategoriesStore } from '../../stores/serviceCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';
import serviceBookingService from '../../services/serviceBookingService';
import ServiceBookingModal from '../../components/ServiceBookingModal.vue';

// Component name for ESLint
defineOptions({
  name: 'ServicesPage'
});

const router = useRouter();
const serviceCategoriesStore = useServiceCategoriesStore();
const projectStore = useProjectStore();

// Reactive state
const activeTab = ref('services');
const loadingBookings = ref(false);
const openBookings = ref([]);
const closedBookings = ref([]);
const showBookingModal = ref(false);
const selectedBooking = ref(null);

// Computed properties
const tabs = computed(() => [
  { 
    id: 'services', 
    label: 'Services', 
    icon: '' 
  },
  { 
    id: 'open', 
    label: 'Open', 
    icon: '', 
    count: openBookings.value.length 
  },
  { 
    id: 'closed', 
    label: 'Closed', 
    icon: '', 
    count: closedBookings.value.length 
  }
]);

// Load service categories and bookings on component mount
onMounted(async () => {
  if (projectStore.selectedProject?.id) {
    await loadServiceCategories();
    await loadBookings();
  }
});

// Watch for project changes
watch(() => projectStore.selectedProject?.id, async (newProjectId) => {
  if (newProjectId) {
    await loadBookings();
  }
});

const loadServiceCategories = async () => {
  if (projectStore.selectedProject?.id) {
    await serviceCategoriesStore.fetchCategories(projectStore.selectedProject.id);
  }
};

const navigateToCategory = (category) => {
  // Navigate to category details page
  router.push(`/service-category/${category.id}`);
};

const navigateToMyBookings = () => {
  router.push('/my-bookings');
};

const navigateToCalendar = () => {
  router.push('/calendar');
};

const navigateToSmartDevices = () => {
  router.push('/smart-devices');
};

// Load bookings function
const loadBookings = async () => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    loadingBookings.value = true;
    
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    // Load open bookings (including processing)
    const [openResults, processingResults, closedResults] = await Promise.all([
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'open'),
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'processing'),
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'closed')
    ]);
    
    openBookings.value = [...openResults, ...processingResults];
    closedBookings.value = closedResults;
  } catch (error) {
    console.error('Error loading bookings:', error);
  } finally {
    loadingBookings.value = false;
  }
};

// Open booking modal
const openBookingModal = (booking) => {
  selectedBooking.value = booking;
  showBookingModal.value = true;
};

// Close booking modal
const closeBookingModal = () => {
  showBookingModal.value = false;
  selectedBooking.value = null;
};

// Open booking chat (called from modal)
const openBookingChat = (booking) => {
  router.push(`/service-booking-chat/${booking.id}`);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Handle both ISO date strings and formatted date strings
  let date;
  if (dateString.includes('-')) {
    // ISO format (2025-01-15)
    date = new Date(dateString + 'T00:00:00');
  } else {
    // Already formatted or other format
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get unread message count
const getUnreadCount = (booking) => {
  if (!booking.messages || booking.messages.length === 0) {
    return 0;
  }
  
  // Get the last message ID that the user has read
  const lastReadId = localStorage.getItem(`lastReadMessage_${booking.id}`);
  
  if (!lastReadId) {
    // If no last read message, count all admin/system messages
    return booking.messages.filter(msg => 
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }
  
  // Count messages after the last read message
  const lastReadIndex = booking.messages.findIndex(msg => msg.id === lastReadId);
  if (lastReadIndex === -1) {
    return booking.messages.filter(msg => 
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }
  
  const unreadMessages = booking.messages.slice(lastReadIndex + 1);
  return unreadMessages.filter(msg => 
    msg.senderType === 'admin' || msg.senderType === 'system'
  ).length;
};

// Get last message preview
const getLastMessagePreview = (booking) => {
  if (!booking.messages || booking.messages.length === 0) {
    return 'No messages yet';
  }
  
  const lastMessage = booking.messages[booking.messages.length - 1];
  
  if (lastMessage.messageType === 'status_update') {
    return 'Status updated';
  } else if (lastMessage.messageType === 'details_update') {
    return 'Details updated';
  } else {
    const preview = lastMessage.text || 'New message';
    return preview.length > 40 ? preview.substring(0, 40) + '...' : preview;
  }
};
</script>

<style scoped>
.services-page {
  padding: 20px 16px;
  background: #fafafa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
}

.hero-content {
  width: 100%;
}

.hero-text {
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 4px;
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.service-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
}

.service-card.coming-soon {
  opacity: 0.6;
  cursor: default;
}

.service-icon {
  color: #AF1E23;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.service-arrow {
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.service-card:hover .service-arrow {
  color: #AF1E23;
  transform: translateX(4px);
}

.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f0f0f0;
  color: #999;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 400;
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .services-page {
    padding: 32px 24px;
  }
  
  .hero-section {
    margin-bottom: 24px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .services-grid {
    max-width: 800px;
    gap: 20px;
  }
  
  .service-card {
    padding: 32px;
  }
  
  .service-name {
    font-size: 1.375rem;
  }
  
  .service-description {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .services-page {
    padding: 40px 32px;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .services-grid {
    max-width: 1000px;
    gap: 24px;
  }
  
  .service-card {
    padding: 40px;
  }
  
  .service-name {
    font-size: 1.5rem;
  }
  
  .service-description {
    font-size: 1.125rem;
  }
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

/* Service Image Styles */
.service-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 8px;
}

.default-icon {
  color: #6b7280;
}

/* Tabs Styles */
.tabs-container {
  margin-bottom: 20px;
}

.tabs-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
}

.tab-btn.active {
  background: #AF1E23;
  color: white;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.tab-btn:not(.active) .tab-count {
  background: #e5e7eb;
  color: #666;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

.services-content,
.bookings-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bookings List */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.booking-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.booking-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.booking-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.booking-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.booking-status.open {
  background: #dcfce7;
  color: #166534;
}

.booking-status.processing {
  background: #fef3c7;
  color: #92400e;
}

.booking-status.closed {
  background: #e5e7eb;
  color: #374151;
}

.booking-details {
  margin-bottom: 16px;
}

.booking-details p {
  margin: 4px 0;
  font-size: 0.875rem;
}

.booking-category {
  color: #666;
}

.booking-date {
  color: #AF1E23;
  font-weight: 500;
}

.booking-price {
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.last-message {
  color: #666;
  font-size: 0.875rem;
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-time {
  color: #999;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Unread Message Badge */
.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
