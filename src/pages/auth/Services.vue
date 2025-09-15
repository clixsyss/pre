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
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceCategoriesStore } from '../../stores/serviceCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';

// Component name for ESLint
defineOptions({
  name: 'ServicesPage'
});

const router = useRouter();
const serviceCategoriesStore = useServiceCategoriesStore();
const projectStore = useProjectStore();

// Load service categories on component mount
onMounted(async () => {
  if (projectStore.selectedProject?.id) {
    await loadServiceCategories();
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
</style>
