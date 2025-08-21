<template>
  <div class="onboarding">
    <!-- Background with blur effect -->
    <div class="background-overlay"></div>
    
    <!-- Content -->
    <div class="content">
      <div class="welcome-text">
        <h1 class="main-title">DISCOVER. <br /> MANAGE. <br /> RELIVE.</h1>
        <p class="description">
          Experience the future of property management with PRE Group. 
          Discover innovative solutions, manage your properties efficiently, 
          and relive the joy of hassle-free real estate management.
        </p>
      </div>
      
      <!-- Pagination dots -->
      <div class="pagination">
        <div class="dot active"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      
      <!-- Action buttons -->
      <div class="actions">
        <button @click="goToRegister" class="register-btn">
          Register
        </button>
        <div class="signin-section">
          <span class="signin-text">Already have an account?</span>
          <button @click="goToSignIn" class="signin-btn">Sign in</button>
        </div>
        
        <div class="support-link">
          <button @click="goToSupport" class="support-btn">Need Help?</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToRegister = () => {
  router.push('/register')
}

const goToSignIn = () => {
  router.push('/signin')
}

const goToSupport = () => {
  router.push('/support')
}
</script>

<style scoped>
.onboarding {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="100" height="100" fill="%23333" filter="url(%23blur)"/></svg>');
  z-index: -1;
}

.content {
  text-align: center;
  padding: 0 40px;
  max-width: 500px;
  z-index: 1;
}

.welcome-text {
  margin-bottom: 60px;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 30px;
  line-height: 1.2;
  letter-spacing: 1px;
}

.description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background-color: white;
  transform: scale(1.2);
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.register-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 18px 60px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
}

.register-btn:hover {
  background-color: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.4);
}

.signin-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signin-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.signin-btn {
  background: none;
  border: none;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.signin-btn:hover {
  color: #ff6b35;
}

.support-link {
  margin-top: 10px;
}

.support-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.support-btn:hover {
  color: #ff6b35;
}

/* Responsive design */
@media (max-width: 768px) {
  .content {
    padding: 0 30px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .register-btn {
    padding: 16px 50px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 0 20px;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 0.95rem;
  }
  
  .register-btn {
    padding: 14px 40px;
    font-size: 0.95rem;
  }
}
</style>
