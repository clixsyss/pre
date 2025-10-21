<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
      <!-- Video Background -->
      <video 
        ref="splashVideo"
        class="splash-video"
        :class="{ 'video-paused': videoPaused }"
        autoplay
        muted
        playsinline
        preload="auto"
        webkit-playsinline
        x5-playsinline
        @ended="onVideoEnded"
        @loadeddata="onVideoLoaded"
        @error="onVideoError"
      >
        <source src="../assets/splash.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <!-- Always show overlay on iOS or if video has issues -->
      <div class="video-overlay" :class="{ 'overlay-visible': showOverlay }">
        <div class="loading-content">
          <!-- Logo -->
          <div class="logo-container">
            <img 
              src="../assets/logo.png" 
              alt="PRE GROUP Logo" 
              class="logo" 
              @error="handleLogoError"
              @load="handleLogoLoad"
            />
          </div>
          
          <!-- Loading spinner - always visible when overlay is shown -->
          <div class="loading" v-if="showOverlay">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useSplashStore } from '../stores/splash'
import { Capacitor } from '@capacitor/core'

const splashStore = useSplashStore()
const splashVideo = ref(null)
const showOverlay = ref(false)
const videoPaused = ref(false)
const videoLoaded = ref(false)

const isIOS = Capacitor.getPlatform() === 'ios'

const handleLogoError = (event) => {
  console.warn('Logo failed to load, trying fallback')
  event.target.src = '../assets/logo.png'
  event.target.onerror = () => {
    console.warn('Fallback logo also failed')
    event.target.style.display = 'none'
  }
}

const handleLogoLoad = () => {
  console.log('Logo loaded successfully')
}

const onVideoLoaded = () => {
  console.log('📹 Video loaded and ready to play')
  videoLoaded.value = true
}

const onVideoError = (error) => {
  console.error('📹 Video error:', error)
  // Show overlay immediately on error
  showOverlay.value = true
  splashStore.setVideoCompleted()
}

const onVideoEnded = () => {
  console.log('📹 Video ended - pausing at last frame')
  
  // Pause video at the last frame
  if (splashVideo.value) {
    const video = splashVideo.value
    // Set to last frame and pause
    video.currentTime = video.duration - 0.04 // ~1 frame before end
    video.pause()
    videoPaused.value = true
    console.log(`📹 Video paused at ${video.currentTime.toFixed(2)}s of ${video.duration.toFixed(2)}s`)
  }
  
  // Show overlay after video ends
  showOverlay.value = true
  console.log('🎭 Overlay displayed with loading state')
  
  // Notify the splash store that video is completed
  splashStore.setVideoCompleted()
}

// Watch for when splash should hide
watch(() => splashStore.show, (newVal) => {
  console.log('👁️ Splash visibility changed:', newVal)
})

onMounted(() => {
  console.log('🎬 SplashScreen mounted', { platform: Capacitor.getPlatform(), isIOS })
  
  // On iOS, show overlay after a short delay since video autoplay can be unreliable
  if (isIOS) {
    setTimeout(() => {
      if (!showOverlay.value) {
        console.log('📱 iOS: Showing overlay with video background')
        showOverlay.value = true
        
        // If video hasn't played, mark it as completed
        if (splashVideo.value && splashVideo.value.currentTime < 0.5) {
          console.log('📱 iOS: Video not playing, marking as complete')
          splashStore.setVideoCompleted()
        }
      }
    }, 300)
  } else {
    // On other platforms, check video playback after a delay
    setTimeout(() => {
      if (splashVideo.value) {
        const video = splashVideo.value
        if (video.paused && video.currentTime === 0) {
          console.warn('⚠️ Video not playing, showing overlay')
          showOverlay.value = true
          splashStore.setVideoCompleted()
        }
      }
    }, 800)
  }
  
  // Fallback to force hide after 25 seconds
  setTimeout(() => {
    if (splashStore.show) {
      console.warn('⏱️ Splash timeout - forcing hide after 25s')
      showOverlay.value = true
      splashStore.setVideoCompleted()
      splashStore.setAppInitialized()
      splashStore.hideSplash()
    }
  }, 25000)
})
</script>

<style scoped>
/* Main Container */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #000; /* Black background to prevent white flash */
}

/* Video Background */
.splash-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  background: #000; /* Black background while video loads */
}

.splash-video.video-paused {
  /* Keep last frame visible */
  opacity: 1;
}

/* Video Overlay */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(35, 31, 32, 0); /* Start transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  opacity: 0;
  transition: all 0.4s ease-out;
  pointer-events: none;
}

.video-overlay.overlay-visible {
  background: rgba(35, 31, 32, 0.85); /* Semi-transparent overlay */
  opacity: 1;
  animation: overlayFadeIn 0.5s ease-out;
  pointer-events: auto;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: contentFadeIn 0.8s ease-out;
}

/* Content */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 10;
  position: relative;
  animation: fadeIn 0.8s ease-out;
}

/* Logo Container */
.logo-container {
  margin-bottom: 30px;
  animation: logoFadeIn 1s ease-out 0.3s both;
}

.logo {
  max-width: 200px;
  height: auto;
  display: block;
  animation: logoFloat 3s ease-in-out infinite;
}

/* App Name */
.app-name {
  margin-bottom: 40px;
  animation: nameFadeIn 1s ease-out 0.6s both;
}

.app-name h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: loadingFadeIn 1s ease-out 0.9s both;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.8;
  margin: 0;
  letter-spacing: 0.1em;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes nameFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


/* Transition Effects */
.splash-fade-enter-active {
  transition: opacity 0.5s ease-out;
}

.splash-fade-leave-active {
  transition: opacity 0.8s ease-in;
}

.splash-fade-enter-from {
  opacity: 0;
}

.splash-fade-leave-to {
  opacity: 0;
}

/* Ensure splash screen stays visible during fade out */
.splash-screen {
  opacity: 1;
  animation: splashFadeIn 0.2s ease-out;
  /* Ensure it covers everything during transition */
  will-change: opacity;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

@keyframes splashFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .logo {
    max-width: 160px;
  }
  
  .app-name h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .logo {
    max-width: 140px;
  }
  
  .app-name h1 {
    font-size: 1.5rem;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
  
  .loading-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 320px) {
  .logo {
    max-width: 120px;
  }
  
  .app-name h1 {
    font-size: 1.25rem;
  }
}
</style>
