<template>
  <div class="facilities-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Facilities</h1>
          <p class="hero-subtitle">Book courts, join academies, and shop at our facilities</p>
        </div>
      </div>
    </div>

    <div class="facilities-grid">
      <!-- Court Booking -->
      <div class="facility-card" @click="navigateToCourtBooking">
        <div class="facility-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="facility-content">
          <h3 class="facility-name">Court Booking</h3>
          <p class="facility-description">Book tennis, basketball, and other sports courts</p>
        </div>
        <div class="facility-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Academy Programs -->
      <div class="facility-card" @click="navigateToAcademyPrograms">
        <div class="facility-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="facility-content">
          <h3 class="facility-name">Academy Programs</h3>
          <p class="facility-description">Join sports academies and training programs</p>
        </div>
        <div class="facility-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Stores & Shopping -->
      <div class="facility-card" @click="navigateToStores">
        <div class="facility-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="facility-content">
          <h3 class="facility-name">Shopping</h3>
          <p class="facility-description">Browse and shop at our retail stores</p>
        </div>
        <div class="facility-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Component name for ESLint
defineOptions({
  name: 'FacilitiesPage'
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
</script>

<style scoped>
.facilities-page {
  padding: 20px 16px;
  background: #fafafa;
  min-height: 100vh;
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

.facilities-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.facility-card {
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

.facility-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
}

.facility-icon {
  color: #AF1E23;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.facility-content {
  flex: 1;
  min-width: 0;
}

.facility-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.facility-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.facility-arrow {
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.facility-card:hover .facility-arrow {
  color: #AF1E23;
  transform: translateX(4px);
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .facilities-page {
    padding: 32px 24px;
  }
  
  .hero-section {
    margin-bottom: 24px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .facilities-grid {
    max-width: 800px;
    gap: 20px;
  }
  
  .facility-card {
    padding: 32px;
  }
  
  .facility-name {
    font-size: 1.375rem;
  }
  
  .facility-description {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .facilities-page {
    padding: 40px 32px;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .facilities-grid {
    max-width: 1000px;
    gap: 24px;
  }
  
  .facility-card {
    padding: 40px;
  }
  
  .facility-name {
    font-size: 1.5rem;
  }
  
  .facility-description {
    font-size: 1.125rem;
  }
}
</style>
