<template>
  <div class="services-page">

    <div class="services-grid">
      <!-- Court Booking -->
      <div class="service-card" @click="navigateToCourtBooking">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Court Booking</span>
      </div>

      <!-- Academy Programs -->
      <div class="service-card" @click="navigateToAcademyPrograms">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Academy Programs</span>
      </div>

      <!-- Stores & Shopping -->
      <div class="service-card" @click="navigateToStores">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Shopping</span>
      </div>

      <!-- Shopping Cart -->
      <div class="service-card" @click="navigateToCart">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="service-name">My Cart</span>
      </div>

      <!-- My Bookings -->
      <div class="service-card" @click="navigateToMyBookings">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="service-name">My Bookings</span>
      </div>

      <!-- Equipment Rental -->
      <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Equipment Rental</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div>

      <!-- Event Planning -->
      <div class="service-card coming-soon">
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
      </div>

      <!-- Membership Plans -->
      <div class="service-card coming-soon">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Component name for ESLint
defineOptions({
  name: 'ServicesPage'
});

const router = useRouter();

const navigateToCourtBooking = () => {
  router.push('/court-booking');
};

const navigateToAcademyPrograms = () => {
  router.push('/academy-programs');
};

const navigateToStores = () => {
  router.push('/stores-shopping');
};

const navigateToCart = () => {
  router.push('/shopping-cart');
};

const navigateToMyBookings = () => {
  router.push('/my-bookings');
};
</script>

<style scoped>
.services-page {
  padding: 20px 16px;
  background: #fafafa;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin: 0;
  letter-spacing: -0.5px;
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.service-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card:not(.coming-soon):hover {
  transform: translateY(-2px);
  border-color: var(--q-secondary);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.12);
}

.service-card.coming-soon {
  opacity: 0.6;
  cursor: default;
}

.service-icon {
  margin-bottom: 16px;
  color: var(--q-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-name {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1.3;
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
  
  .page-header {
    margin-bottom: 48px;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .services-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    max-width: 1200px;
    gap: 20px;
  }
  
  .service-card {
    padding: 32px 24px;
    min-height: 140px;
  }
  
  .service-icon {
    margin-bottom: 20px;
  }
  
  .service-name {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .services-page {
    padding: 40px 32px;
  }
  
  .page-header h1 {
    font-size: 3rem;
  }
  
  .service-card {
    padding: 40px 32px;
    min-height: 160px;
  }
  
  .service-icon {
    margin-bottom: 24px;
  }
  
  .service-name {
    font-size: 1.375rem;
  }
}
</style>
