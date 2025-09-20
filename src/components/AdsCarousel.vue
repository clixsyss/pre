<template>
  
  <div class="ads-carousel" v-if="ads.length > 0">
    <div class="carousel-container" ref="carouselContainer">
      <div 
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div 
          v-for="ad in ads" 
          :key="ad.id"
          class="carousel-slide"
          @click="handleAdClick(ad)"
          :class="{ 'has-link': ad.linkUrl }"
        >
          <div class="ad-image-container">
            <img 
              :src="ad.imageUrl" 
              :alt="`Advertisement`"
              class="ad-image"
              @error="handleImageError"
            />
            <!-- Gradient overlay for better visual appeal -->
            <div class="ad-gradient-overlay"></div>
            
            <!-- Click indicator for ads with links -->
            <div v-if="ad.linkUrl" class="click-indicator">
              <div class="click-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Tap to view</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modern Navigation Dots -->
      <div class="carousel-dots" v-if="ads.length > 1">
        <button
          v-for="(ad, index) in ads"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
        />
      </div>
      
      <!-- Modern Navigation Arrows -->
      <button 
        class="carousel-nav prev" 
        @click="previousSlide"
        v-if="ads.length > 1"
        aria-label="Previous ad"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button 
        class="carousel-nav next" 
        @click="nextSlide"
        v-if="ads.length > 1"
        aria-label="Next ad"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Progress indicator -->
      <div class="progress-bar" v-if="ads.length > 1">
        <div 
          class="progress-fill" 
          :style="{ 
            width: `${((currentIndex + 1) / ads.length) * 100}%`,
            transition: 'width 0.3s ease'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { getActiveAds } from '../services/adsService';

const props = defineProps({
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoPlayInterval: {
    type: Number,
    default: 5000 // 5 seconds
  },
  showOverlay: {
    type: Boolean,
    default: true
  }
});

const projectStore = useProjectStore();
const ads = ref([]);
const currentIndex = ref(0);
const carouselContainer = ref(null);
const autoPlayTimer = ref(null);
const isHovered = ref(false);
const isLoading = ref(true);

const loadAds = async () => {
  try {
    isLoading.value = true;
    const projectId = projectStore.selectedProject?.id;
    console.log('AdsCarousel: Loading ads for project:', projectId);
    
    if (!projectId) {
      console.warn('AdsCarousel: No project selected for ads');
      return;
    }
    
    const adsData = await getActiveAds(projectId);
    console.log('AdsCarousel: Loaded ads:', adsData);
    ads.value = adsData;
    
    // Reset to first slide if current index is out of bounds
    if (currentIndex.value >= adsData.length) {
      currentIndex.value = 0;
    }
    
    // Start auto-play after ads are loaded
    if (adsData.length > 1) {
      stopAutoPlay(); // Stop any existing timer first
      startAutoPlay();
    } else {
      stopAutoPlay(); // Stop auto-play if not enough ads
    }
  } catch (error) {
    console.error('AdsCarousel: Error loading ads:', error);
  } finally {
    isLoading.value = false;
  }
};

const nextSlide = () => {
  if (ads.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % ads.value.length;
};

const previousSlide = () => {
  if (ads.value.length === 0) return;
  currentIndex.value = currentIndex.value === 0 
    ? ads.value.length - 1 
    : currentIndex.value - 1;
};

const goToSlide = (index) => {
  currentIndex.value = index;
};

const handleAdClick = (ad) => {
  if (ad.linkUrl) {
    // Open link in new tab/window
    window.open(ad.linkUrl, '_blank');
  }
};

const handleImageError = (event) => {
  console.error('Error loading ad image:', event);
  // Hide the slide if image fails to load
  event.target.style.display = 'none';
};

const startAutoPlay = () => {
  if (!props.autoPlay || ads.value.length <= 1) {
    console.log('AdsCarousel: Auto-play not started - autoPlay:', props.autoPlay, 'ads count:', ads.value.length);
    return;
  }
  
  console.log('AdsCarousel: Starting auto-play with interval:', props.autoPlayInterval);
  autoPlayTimer.value = setInterval(() => {
    if (!isHovered.value) {
      console.log('AdsCarousel: Auto-advancing to next slide');
      nextSlide();
    }
  }, props.autoPlayInterval);
};

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    console.log('AdsCarousel: Stopping auto-play');
    clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
};

// Watch for project changes
watch(() => projectStore.selectedProject, () => {
  loadAds();
}, { immediate: true });

// Watch for autoPlay prop changes
watch(() => props.autoPlay, (newValue) => {
  if (newValue) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
});

onMounted(() => {
  loadAds();
  startAutoPlay();
  
  // Handle mouse events for pause on hover
  if (carouselContainer.value) {
    carouselContainer.value.addEventListener('mouseenter', () => {
      isHovered.value = true;
    });
    
    carouselContainer.value.addEventListener('mouseleave', () => {
      isHovered.value = false;
    });
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.ads-carousel {
  width: 100%;
  margin-bottom: 24px;
  position: relative;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.carousel-slide.has-link {
  cursor: pointer;
}

.ad-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.ad-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  pointer-events: none;
}

.click-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.click-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #AF1E23;
  border-radius: 50%;
  color: white;
}

.carousel-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.dot.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #333;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  opacity: 0;
}

.carousel-nav.prev {
  left: 16px;
}

.carousel-nav.next {
  right: 16px;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 0 0 16px 16px;
  transition: width 0.3s ease;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .carousel-container {
    height: 200px;
    border-radius: 12px;
    margin: 0 16px;
    width: calc(100% - 32px);
  }
  
  .ad-image-container {
    border-radius: 12px;
  }
  
  .carousel-nav {
    display: none; /* Hide arrows on mobile */
  }
  
  .carousel-dots {
    bottom: 12px;
    padding: 6px 10px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
  }
  
  .click-indicator {
    top: 12px;
    right: 12px;
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .progress-bar {
    height: 2px;
  }
}

/* Touch/swipe support */
.carousel-container {
  touch-action: pan-x;
}

/* Loading state */
.ads-carousel.loading {
  opacity: 0.7;
}

.ads-carousel.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 20;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .carousel-track,
  .carousel-slide,
  .dot,
  .carousel-nav,
  .progress-fill {
    transition: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .click-indicator {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
  
  .carousel-nav {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
}
</style>