<template>
  <div class="onboarding">
    <!-- Background Image -->
    <div class="background-image">
      <img src="../../assets/onboarding.png" alt="PRE Group Development" />
    </div>

    <!-- Dark Overlay -->
    <div class="overlay"></div>

    <!-- Content -->
    <div class="content">
      <!-- Main Title -->
      <div class="main-title">
        <h1>DISCOVER.</h1>
        <h1>MANAGE.</h1>
        <h1>RELIVE.</h1>
      </div>

      <!-- Company Description -->
      <div class="description-section">
        <div class="description-line"></div>
        <p class="company-description">
          Pioneers for Real Estate Development "PRE" is a real estate investor, developer and operator of integrated
          mixed-use projects based in Egypt. With expertise in planning and developing projects, PRE offers its clients
          tailored and crafted spaces that suit their every need.
        </p>
        <p class="company-description">
          Established in 2017, PRE quickly and adaptively managed to bring a new concept to the market in which luxury
          and practicality are fused together to offer its clients the best of all worlds. Through exclusive and
          contemporary residential and commercial projects, PRE continuously and skillfully tailor nature and the latest
          technological tools to create sustainable thriving communities that add elegance to our modern world.
        </p>
        <p class="company-description">
          Our developments are a true testimony to the expertise, knowledge and dedication brought daily to establish a
          brighter future.
        </p>
      </div>

      <!-- Pagination and More Content -->
      <!-- <div class="pagination-section">
        <div class="pagination-dots">
          <div class="dot active"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="more-content">200+ more...</span>
      </div> -->

      <!-- Action Buttons -->
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

// Component name for ESLint
defineOptions({
  name: 'OnboardingPage'
})

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
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

.background-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg,
      rgba(34, 34, 34, 0.95) 0%,
      rgba(34, 34, 34, 0.8) 30%,
      rgba(34, 34, 34, 0.6) 60%,
      rgba(34, 34, 34, 0.4) 100%);
  z-index: -1;
}

.content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 60px 30px 40px;
  padding-top: 100px !important;
  max-width: 500px;
  margin: 0 auto;
}

.main-title {
  margin-bottom: 40px;
  text-align: left;
}

.main-title h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.1;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.description-section {
  margin-bottom: 40px;
  position: relative;
}

.description-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: white;
  opacity: 0.8;
}

.company-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 20px 20px;
  text-align: left;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.company-description:last-of-type {
  margin-bottom: 0;
}

.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50px;
  margin-left: 20px;
}

.pagination-dots {
  display: flex;
  gap: 12px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.more-content {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
}

.actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.register-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 18px 80px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
  min-width: 200px;
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
    padding: 50px 25px 30px;
  }

  .main-title h1 {
    font-size: 2.4rem;
  }

  .company-description {
    font-size: 0.9rem;
  }

  .register-btn {
    padding: 16px 60px;
    font-size: 1rem;
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 40px 20px 25px;
  }

  .main-title h1 {
    font-size: 2.2rem;
  }

  .company-description {
    font-size: 0.85rem;
    margin-left: 15px;
  }

  .pagination-section {
    margin-left: 15px;
  }

  .register-btn {
    padding: 14px 50px;
    font-size: 0.95rem;
    min-width: 160px;
  }
}

@media (min-width: 1024px) {
  .content {
    max-width: 600px;
    padding: 80px 40px 60px;
  }

  .main-title h1 {
    font-size: 3.2rem;
  }

  .company-description {
    font-size: 1rem;
  }

  .register-btn {
    padding: 20px 100px;
    font-size: 1.2rem;
    min-width: 240px;
  }
}
</style>
