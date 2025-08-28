<template>
  <div class="services-page">
    <div class="page-header">
      <h1>Services</h1>
      <p>PRE Group services and utilities</p>
    </div>

    <div class="services-content">
      <!-- Booking Services Section -->
      <div class="services-section">
        <h2 class="section-title">Booking Services</h2>
        <p class="section-description">Book courts and academy programs with ease</p>
        
        <div class="services-grid">
          <!-- Court Booking Service -->
          <div class="service-card" @click="navigateToCourtBooking">
            <div class="service-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="service-content">
              <h3>Court Booking</h3>
              <p>Book sports courts for tennis, basketball, football, and more</p>
              <div class="service-features">
                <span class="feature-tag">Real-time availability</span>
                <span class="feature-tag">Instant confirmation</span>
                <span class="feature-tag">Flexible scheduling</span>
              </div>
            </div>
            <div class="service-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- Academy Programs Service -->
          <div class="service-card" @click="navigateToAcademyPrograms">
            <div class="service-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11V15" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 13H15" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="service-content">
              <h3>Academy Programs</h3>
              <p>Join sports academies and training programs for all skill levels</p>
              <div class="service-features">
                <span class="feature-tag">Professional coaching</span>
                <span class="feature-tag">Structured programs</span>
                <span class="feature-tag">Progress tracking</span>
              </div>
            </div>
            <div class="service-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- My Bookings Service -->
          <div class="service-card" @click="navigateToMyBookings">
            <div class="service-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ff6b35" stroke-width="2"/>
              </svg>
            </div>
            <div class="service-content">
              <h3>My Bookings</h3>
              <p>View and manage all your current and past bookings</p>
              <div class="service-features">
                <span class="feature-tag">Booking history</span>
                <span class="feature-tag">Easy cancellation</span>
                <span class="feature-tag">Reschedule options</span>
              </div>
            </div>
            <div class="service-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Coming Soon Section -->
      <div class="services-section">
        <h2 class="section-title">More Services Coming Soon</h2>
        <p class="section-description">We're working on bringing you more amazing services</p>
        
        <div class="coming-soon-grid">
          <div class="coming-soon-item">
            <div class="coming-soon-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Equipment Rental</span>
          </div>
          
          <div class="coming-soon-item">
            <div class="coming-soon-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21A2 2 0 0 1 11 21H13.73Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Event Planning</span>
          </div>
          
          <div class="coming-soon-item">
            <div class="coming-soon-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Membership Plans</span>
          </div>
        </div>
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

const navigateToMyBookings = () => {
  router.push('/my-bookings');
};
</script>

<style scoped>
.services-page {
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.page-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.services-content {
  max-width: 800px;
  margin: 0 auto;
}

.services-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.section-description {
  color: #666;
  font-size: 1rem;
  margin: 0 0 24px 0;
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.service-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #ff6b35;
}

.service-icon {
  flex-shrink: 0;
}

.service-content {
  flex: 1;
}

.service-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.service-content p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.service-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  background: #f8f9fa;
  color: #666;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.service-arrow {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.service-card:hover .service-arrow {
  opacity: 1;
}

.coming-soon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.coming-soon-item {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  opacity: 0.6;
}

.coming-soon-icon {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.coming-soon-item span {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .services-page {
    padding: 16px 0;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .services-section {
    margin-bottom: 32px;
  }
  
  .service-card {
    padding: 20px;
    gap: 16px;
  }
  
  .service-content h3 {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .service-card {
    padding: 16px;
    gap: 12px;
    flex-direction: column;
    text-align: center;
  }
  
  .service-features {
    justify-content: center;
  }
  
  .coming-soon-grid {
    grid-template-columns: 1fr;
  }
}
</style>
