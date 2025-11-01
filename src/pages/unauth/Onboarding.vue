<template>
  <div class="onboarding-container" ref="containerRef">
    <!-- Skip Button -->
    <button v-if="currentSlide < slides.length - 1" @click="skipToEnd" class="skip-btn">
      {{ $t('skip') }}
    </button>

    <!-- Slides Container -->
    <div class="slides-wrapper" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <!-- Slide 1: Welcome -->
      <div class="slide slide-1">
        <div class="slide-background">
          <div class="animated-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </div>
        <div class="slide-content">
          <div class="final-logo" data-aos="zoom-in">
            <img src="../../assets/logo.png" alt="PRE Group Logo" class="logo-image" />
          </div>
          <h1 class="welcome-title" data-aos="fade-up" data-aos-delay="200">
            {{ $t('welcomeToNew') }}<br />{{ $t('theNew') }}<br />
            <span class="highlight">{{ $t('communityApp') }}</span>
          </h1>
          <p class="welcome-subtitle" data-aos="fade-up" data-aos-delay="400">
            {{ $t('allInOnePlatform') }}
          </p>
          <div class="feature-preview-grid" data-aos="fade-up" data-aos-delay="600">
            <div class="preview-card">
              <svg class="preview-icon" viewBox="0 0 24 24" fill="none">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" />
              </svg>
              <span>{{ $t('smartHome') }}</span>
            </div>
            <div class="preview-card">
              <svg class="preview-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                  fill="currentColor" />
              </svg>
              <span>{{ $t('community') }}</span>
            </div>
            <div class="preview-card">
              <svg class="preview-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"
                  fill="currentColor" />
              </svg>
              <span>{{ $t('services') }}</span>
            </div>
            <div class="preview-card">
              <svg class="preview-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="17" cy="8" r="5" fill="currentColor" />
                <path d="M2 21.5c0-2.5 5-5 10-5s10 2.5 10 5V23H2v-1.5z" fill="currentColor" opacity="0.6" />
                <path
                  d="M12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm7-2c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z"
                  fill="currentColor" />
              </svg>
              <span>{{ $t('activities') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 2: Smart Living -->
      <div class="slide slide-2">
        <div class="slide-content">
          <div class="feature-showcase" data-aos="zoom-in">
            <div class="showcase-icon-wrapper">
              <svg class="showcase-icon" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="58" stroke="#AF1E23" stroke-width="2" opacity="0.2" />
                <circle cx="60" cy="60" r="50" fill="#ffffff" opacity="0.1" />
                <path d="M60 30L40 45v30h10V55h20v20h10V45L60 30z" fill="#AF1E23" />
                <circle cx="60" cy="42" r="4" fill="white" />
                <rect x="52" y="60" width="16" height="2" rx="1" fill="white" />
                <rect x="52" y="66" width="16" height="2" rx="1" fill="white" />
                <rect x="52" y="72" width="10" height="2" rx="1" fill="white" />
              </svg>
            </div>
          </div>
          <h2 class="slide-title" data-aos="fade-up">
            <span class="highlight">{{ $t('smartLivingRedefined') }}</span><br />
            {{ $t('redefined') }}
          </h2>
          <p class="slide-description" data-aos="fade-up" data-aos-delay="200">
            {{ $t('controlHomeManageAccess') }}
          </p>
          <div class="features-grid" data-aos="fade-up" data-aos-delay="400">
            <div class="feature-card">
              <svg class="feature-card-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <path d="M24 14l-10 8v14h6v-8h8v8h6V22l-10-8z" fill="#AF1E23" />
              </svg>
              <div class="feature-card-content">
                <h4>{{ $t('smartDevices') }}</h4>
                <p>{{ $t('controlLightsClimateSecurity') }}</p>
              </div>
            </div>
            <div class="feature-card">
              <svg class="feature-card-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <rect x="14" y="18" width="20" height="16" rx="2" stroke="#AF1E23" stroke-width="2" fill="none" />
                <circle cx="24" cy="26" r="4" fill="#AF1E23" />
                <rect x="23" y="26" width="2" height="4" fill="#AF1E23" />
              </svg>
              <div class="feature-card-content">
                <h4>{{ $t('gateAccess') }}</h4>
                <p>{{ $t('remoteControlGuestPasses') }}</p>
              </div>
            </div>
            <div class="feature-card">
              <svg class="feature-card-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <path
                  d="M24 16c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
                  fill="#AF1E23" />
                <path d="M24 12v4m0 16v4m12-12h-4m-16 0h-4" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" />
              </svg>
              <div class="feature-card-content">
                <h4>{{ $t('automation') }}</h4>
                <p>{{ $t('createSmartHomeRoutines') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 3: Activities & Services -->
      <div class="slide slide-3">
        <div class="slide-content">
          <div class="feature-showcase" data-aos="zoom-in">
            <div class="showcase-icon-wrapper">
              <svg class="showcase-icon" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="58" stroke="#AF1E23" stroke-width="2" opacity="0.2" />
                <circle cx="60" cy="60" r="50" fill="#AF1E23" opacity="0.1" />
                <rect x="40" y="35" width="40" height="50" rx="4" stroke="#AF1E23" stroke-width="3" fill="none" />
                <line x1="40" y1="45" x2="80" y2="45" stroke="#AF1E23" stroke-width="2" />
                <circle cx="52" cy="55" r="3" fill="#AF1E23" />
                <circle cx="68" cy="55" r="3" fill="#AF1E23" />
                <line x1="48" y1="65" x2="72" y2="65" stroke="#AF1E23" stroke-width="2" />
                <line x1="48" y1="72" x2="65" y2="72" stroke="#AF1E23" stroke-width="2" />
              </svg>
            </div>
          </div>
          <h2 class="slide-title" data-aos="fade-up">
            {{ $t('everythingYouNeed') }}<br />
            <span class="highlight">{{ $t('oneTapAway') }}</span>
          </h2>
          <p class="slide-description" data-aos="fade-up" data-aos-delay="200">
            {{ $t('everythingDesc') }}
          </p>
          <div class="services-showcase" data-aos="fade-up" data-aos-delay="400">
            <div class="service-category">
              <svg class="service-category-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <circle cx="24" cy="18" r="6" stroke="#AF1E23" stroke-width="2" fill="none" />
                <path d="M17 35c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#AF1E23" stroke-width="2"
                  stroke-linecap="round" />
              </svg>
              <div class="service-category-content">
                <h4>{{ $t('sportsActivities') }}</h4>
                <p>{{ $t('sportsDesc') }}</p>
              </div>
            </div>
            <div class="service-category">
              <svg class="service-category-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <path d="M30 16l-2 2m-8-2l2 2m-4 6c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#AF1E23" stroke-width="2"
                  stroke-linecap="round" />
                <path d="M18 26h12l-2 10H20l-2-10z" stroke="#AF1E23" stroke-width="2" fill="none" />
              </svg>
              <div class="service-category-content">
                <h4>{{ $t('homeServices') }}</h4>
                <p>{{ $t('homeServicesDesc') }}</p>
              </div>
            </div>
            <div class="service-category">
              <svg class="service-category-icon" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#AF1E23" opacity="0.1" />
                <path d="M19 19l10 0 -2 10 -6 0z" stroke="#AF1E23" stroke-width="2" fill="none" />
                <path d="M17 29h14l-2 4H19l-2-4z" fill="#AF1E23" />
                <line x1="21" y1="22" x2="21" y2="27" stroke="#AF1E23" stroke-width="1.5" />
                <line x1="24" y1="22" x2="24" y2="27" stroke="#AF1E23" stroke-width="1.5" />
                <line x1="27" y1="22" x2="27" y2="27" stroke="#AF1E23" stroke-width="1.5" />
              </svg>
              <div class="service-category-content">
                <h4>{{ $t('foodDining') }}</h4>
                <p>{{ $t('orderFromTopRestaurants') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 4: Final Call to Action -->
      <div class="slide slide-4">
        <div class="slide-background-final">
          <div class="animated-particles">
            <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
          </div>
        </div>
        <div class="slide-content final-slide">
          <div class="final-logo" data-aos="zoom-in">
            <img src="../../assets/logo.png" alt="PRE Group Logo" class="logo-image" />
          </div>
          <h1 class="final-title" data-aos="fade-up" data-aos-delay="200">
            {{ $t('allThatAndMore') }}<br />
            <span class="highlight">{{ $t('muchMore') }}</span>
          </h1>
          <p class="final-description" data-aos="fade-up" data-aos-delay="400">
            {{ $t('joinThrivingCommunity') }}
          </p>
          <div class="final-stats" data-aos="fade-up" data-aos-delay="500">
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" class="stat-icon">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#AF1E23"
                  opacity="0.2" />
                <path d="M9 12l2 2 4-4" stroke="#AF1E23" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ $t('securePrivate') }}</span>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" class="stat-icon">
                <circle cx="12" cy="12" r="10" fill="#AF1E23" opacity="0.2" />
                <path d="M12 6v6l4 2" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" />
              </svg>
              <span>{{ $t('support247') }}</span>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" class="stat-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#AF1E23" opacity="0.2" />
                <path d="M9 11l3 3 6-6" stroke="#AF1E23" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ $t('easyToUse') }}</span>
            </div>
          </div>
          <div class="final-actions" data-aos="fade-up" data-aos-delay="600">
            <button @click="goToRegister" class="primary-btn">
              <span>{{ $t('getStarted') }}</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
            <div class="signin-section">
              <span class="signin-text">{{ $t('alreadyHaveAccount') }}</span>
              <button @click="goToSignIn" class="signin-link">{{ $t('signInButton') }}</button>
            </div>
            <button @click="goToSupport" class="support-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" />
              </svg>
              <span>{{ $t('needHelp') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Indicators & Navigation -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${((currentSlide + 1) / slides.length) * 100}%` }"></div>
      </div>
      <div class="progress-dots">
        <div v-for="(slide, index) in slides" :key="index" class="progress-dot"
          :class="{ active: currentSlide === index }" @click="goToSlide(index)">
          <span class="dot-number">{{ index + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Swipe Indicator (shows on all slides except last) -->
    <div v-if="currentSlide < slides.length - 1" class="swipe-indicator">
      <svg viewBox="0 0 100 50" class="swipe-animation">
        <path d="M10 25 L50 25 L40 15 M50 25 L40 35" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"
          stroke-linejoin="round" opacity="0.6" />
      </svg>
      <span>Swipe to explore</span>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="contact-modal-overlay" @click="closeContactModal">
      <div class="contact-modal" @click.stop>
        <div class="contact-modal-header">
          <button @click="closeContactModal" class="close-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <h3>Contact Us</h3>
          <div></div>
        </div>

        <div class="contact-modal-content">
          <div class="contact-intro">
            <img src="../../assets/logo.png" alt="PRE Group" class="contact-logo" />
            <p>We're here to help! Reach out to us through any of the channels below.</p>
          </div>

          <div class="contact-cards">
            <a href="tel:+201234567890" class="contact-card">
              <div class="contact-icon phone-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="contact-info">
                <h4>Phone</h4>
                <p>+20 123 456 7890</p>
              </div>
              <svg class="arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </a>

            <a href="mailto:info@pregroup.com" class="contact-card">
              <div class="contact-icon email-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="contact-info">
                <h4>Email</h4>
                <p>info@pregroup.com</p>
              </div>
              <svg class="arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </a>

            <a href="https://www.pregroup.com" target="_blank" rel="noopener noreferrer" class="contact-card">
              <div class="contact-icon website-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="contact-info">
                <h4>Website</h4>
                <p>www.pregroup.com</p>
              </div>
              <svg class="arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </a>

            <a href="https://maps.google.com/?q=Cairo,Egypt" target="_blank" rel="noopener noreferrer"
              class="contact-card">
              <div class="contact-icon location-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="contact-info">
                <h4>Location</h4>
                <p>Cairo, Egypt</p>
              </div>
              <svg class="arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </a>
          </div>

          <div class="contact-footer">
            <p>Available 24/7 to assist you</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'OnboardingPage'
})

const router = useRouter()
const containerRef = ref(null)
const currentSlide = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)
const hasInteracted = ref(false)
const showContactModal = ref(false)

const slides = [
  { id: 'welcome' },
  { id: 'smart-living' },
  { id: 'activities' },
  { id: 'final' }
]

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
    initAOS()
    hasInteracted.value = true
  }
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
    initAOS()
    hasInteracted.value = true
  }
}

const goToSlide = (index) => {
  currentSlide.value = index
  initAOS()
  hasInteracted.value = true
}

const skipToEnd = () => {
  currentSlide.value = slides.length - 1
  initAOS()
  hasInteracted.value = true
}

const goToRegister = () => {
  router.push('/register')
}

const goToSignIn = () => {
  router.push('/signin')
}

const goToSupport = () => {
  showContactModal.value = true
}

const closeContactModal = () => {
  showContactModal.value = false
}

const getParticleStyle = (i) => {
  const angle = (i / 20) * 360
  const distance = 150 + Math.random() * 100
  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${i * 0.1}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }
}

// Enhanced Touch/Swipe handlers with smooth tracking
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
  hasInteracted.value = true
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const swipeDistance = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50 // Minimum pixels to trigger slide change
  const swipeVelocity = Math.abs(swipeDistance)

  if (swipeVelocity > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped left - go to next slide
      nextSlide()
    } else {
      // Swiped right - go to previous slide
      previousSlide()
    }
  }

  isDragging.value = false
  touchStartX.value = 0
  touchEndX.value = 0
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    nextSlide()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    previousSlide()
  }
}

// Mouse wheel/trackpad support
const handleWheel = (e) => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    // Horizontal scroll
    e.preventDefault()
    if (e.deltaX > 30) {
      nextSlide()
    } else if (e.deltaX < -30) {
      previousSlide()
    }
  }
}

// Simple AOS-like animation initialization
const initAOS = () => {
  setTimeout(() => {
    const elements = document.querySelectorAll('[data-aos]')
    elements.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      setTimeout(() => {
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      }, parseInt(el.getAttribute('data-aos-delay') || 0))
    })
  }, 50)
}

onMounted(() => {
  initAOS()

  const container = containerRef.value
  if (container) {
    // Touch events for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Keyboard navigation
    window.addEventListener('keydown', handleKeydown)

    // Mouse wheel/trackpad (with throttling)
    let wheelTimeout
    const throttledWheel = (e) => {
      if (!wheelTimeout) {
        handleWheel(e)
        wheelTimeout = setTimeout(() => {
          wheelTimeout = null
        }, 500)
      }
    }
    container.addEventListener('wheel', throttledWheel, { passive: false })
  }
})

onUnmounted(() => {
  const container = containerRef.value
  if (container) {
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.onboarding-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #231F20 0%, #1a1a1a 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  touch-action: pan-y;
  user-select: none;
}

/* Skip Button */
.skip-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.skip-btn:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}

/* Slides Wrapper */
.slides-wrapper {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.slide {
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 70px 24px 110px;
  position: relative;
}

.slide-background,
.slide-background-final {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

/* Animated Circles Background */
.animated-circles {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(175, 30, 35, 0.15) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 350px;
  height: 350px;
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 450px;
  height: 450px;
  top: 50%;
  right: -15%;
  animation-delay: 2.5s;
}

.circle-3 {
  width: 280px;
  height: 280px;
  bottom: 10%;
  left: 30%;
  animation-delay: 5s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translate(40px, -40px) scale(1.15);
    opacity: 1;
  }
}

/* Animated Particles */
.animated-particles {
  position: relative;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #AF1E23;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(175, 30, 35, 0.6);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(2);
  }
}

.slide-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Logo Styles */
.logo-container,
.final-logo {
  margin-bottom: 24px;
}

.logo-text,
.logo-text-large {
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-weight: 900;
  letter-spacing: -2px;
}

.logo-text {
  font-size: 2.2rem;
}

.logo-text-large {
  font-size: 3rem;
}

.logo-image {
  width: 120px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 20px rgba(175, 30, 35, 0.4));
}

.logo-p {
  color: white;
  text-shadow: 0 4px 30px rgba(175, 30, 35, 0.6);
}

.logo-re {
  color: #AF1E23;
  text-shadow: 0 4px 30px rgba(175, 30, 35, 0.8);
}

.logo-group {
  font-size: 0.32em;
  color: rgba(255, 255, 255, 0.75);
  align-self: flex-start;
  margin-top: 0.6em;
  letter-spacing: 1px;
}

/* Typography */
.welcome-title,
.slide-title,
.final-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  line-height: 1.15;
  margin-bottom: 12px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  letter-spacing: -0.5px;
}

.final-title {
  font-size: 2rem;
}

.highlight {
  color: #AF1E23;
  position: relative;
  display: inline-block;
  text-shadow: 0 4px 20px rgba(175, 30, 35, 0.6);
}

.welcome-subtitle,
.slide-description,
.final-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 360px;
  font-weight: 400;
}

/* Feature Preview Grid (Slide 1) */
.feature-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 320px;
  margin-top: 8px;
}

.preview-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
}

.preview-card:active {
  background: rgba(175, 30, 35, 0.12);
  border-color: rgba(175, 30, 35, 0.4);
  transform: scale(0.95);
}

.preview-icon {
  width: 24px;
  height: 24px;
  color: #AF1E23;
}

.preview-card span {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* Feature Showcase */
.feature-showcase {
  margin-bottom: 24px;
}

.showcase-icon-wrapper {
  position: relative;
  animation: showcaseFloat 4s ease-in-out infinite;
}

@keyframes showcaseFloat {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

.showcase-icon {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 16px rgba(175, 30, 35, 0.4));
}

/* Features Grid (Slide 2) */
.features-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 360px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  text-align: left;
}

.feature-card:active {
  background: rgba(175, 30, 35, 0.12);
  border-color: rgba(175, 30, 35, 0.4);
  transform: scale(0.98);
}

.feature-card-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.feature-card-content h4 {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 3px;
  letter-spacing: 0.2px;
}

.feature-card-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
  line-height: 1.4;
}

/* Services Showcase (Slide 3) */
.services-showcase {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 360px;
}

.service-category {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  text-align: left;
}

.service-category:active {
  background: rgba(175, 30, 35, 0.12);
  border-color: rgba(175, 30, 35, 0.4);
  transform: scale(0.98);
}

.service-category-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.service-category-content h4 {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 3px;
  letter-spacing: 0.2px;
}

.service-category-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
  line-height: 1.4;
}

/* Final Slide */
.final-slide {
  justify-content: center;
}

.final-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  width: 28px;
  height: 28px;
}

.stat-item span {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.final-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 300px;
}

.primary-btn {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.45);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.3px;
}

.primary-btn:active {
  transform: scale(0.97);
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.6);
}

.signin-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.signin-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 500;
}

.signin-link {
  background: none;
  border: none;
  color: #AF1E23;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: all 0.3s ease;
  letter-spacing: 0.2px;
}

.signin-link:active {
  color: #d42429;
  transform: scale(0.95);
}

.support-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.support-link:active {
  color: rgba(255, 255, 255, 0.9);
  transform: scale(0.95);
}

/* Progress Container */
.progress-container {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 120px;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #AF1E23 0%, #d42429 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(175, 30, 35, 0.6);
}

.progress-dots {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.progress-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.dot-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  border-color: #AF1E23;
  box-shadow: 0 3px 16px rgba(175, 30, 35, 0.6);
  transform: scale(1.05);
}

.progress-dot.active .dot-number {
  color: white;
  font-size: 0.85rem;
}

.progress-dot:active {
  transform: scale(0.95);
}

/* Swipe Indicator */
.swipe-indicator {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0;
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes fadeInOut {

  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 0.7;
  }
}

.swipe-animation {
  width: 50px;
  height: 25px;
  animation: swipeAnim 2s ease-in-out infinite;
}

@keyframes swipeAnim {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(12px);
  }
}

.swipe-indicator span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .slide {
    padding: 60px 16px 90px;
  }

  .skip-btn {
    top: 16px;
    right: 16px;
    padding: 6px 14px;
    font-size: 0.75rem;
  }

  .logo-text {
    font-size: 2rem;
  }

  .logo-text-large {
    font-size: 2.7rem;
  }

  .logo-image {
    width: 100px;
  }

  .welcome-title,
  .slide-title {
    font-size: 1.6rem;
  }

  .final-title {
    font-size: 1.85rem;
  }

  .showcase-icon {
    width: 70px;
    height: 70px;
  }

  .feature-preview-grid {
    gap: 8px;
  }

  .preview-card {
    padding: 14px 10px;
  }

  .feature-card {
    padding: 12px;
    gap: 12px;
  }

  .feature-card-icon {
    width: 38px;
    height: 38px;
  }

  .primary-btn {
    padding: 13px 32px;
    font-size: 0.95rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .progress-bar {
    width: 100px;
  }

  .progress-dot {
    width: 28px;
    height: 28px;
  }

  .final-stats {
    gap: 14px;
  }
}

/* Contact Modal */
.contact-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.contact-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  width: 100%;
  max-height: 85vh;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.contact-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.contact-modal-header h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.9);
}

.contact-modal-content {
  padding: 24px 20px;
  overflow-y: auto;
  max-height: calc(85vh - 72px);
}

.contact-intro {
  text-align: center;
  margin-bottom: 28px;
}

.contact-logo {
  width: 80px;
  height: auto;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 12px rgba(175, 30, 35, 0.3));
}

.contact-intro p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  backdrop-filter: blur(10px);
}

.contact-card:active {
  background: rgba(175, 30, 35, 0.15);
  border-color: rgba(175, 30, 35, 0.4);
  transform: scale(0.98);
}

.contact-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.phone-icon {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.email-icon {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.website-icon {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.location-icon {
  background: linear-gradient(135deg, #AF1E23 0%, #d42429 100%);
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.3);
}

.contact-icon svg {
  color: white;
}

.contact-info {
  flex: 1;
  text-align: left;
}

.contact-info h4 {
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.contact-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin: 0;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.contact-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
}

/* Smooth Animations */
@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.feature-card h4,
.service-category h4,
.contact-info h4 {
  line-height: normal;
  font-size: 1rem;
}
</style>
