<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
      <!-- Video Background -->
      <video 
        ref="splashVideo"
        class="splash-video"
        :class="{ 'video-paused': videoPaused }"
        :src="splashVideoSrc"
        :poster="logoImg"
        autoplay
        muted
        playsinline
        preload="auto"
        @ended="onVideoEnded"
        @loadeddata="onVideoLoaded"
        @canplay="onVideoCanPlay"
        @error="onVideoError"
      >
        Your browser does not support the video tag.
      </video>
      
      <!-- Overlay: show when video has issues, ended, or loading fallback -->
      <div class="video-overlay" :class="{ 'overlay-visible': showOverlay }">
        <div class="loading-content">
          <!-- Logo - only show if video hasn't completed -->
          <div class="logo-container" v-if="!videoCompleted">
            <img 
              :src="logoImg" 
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
import { nextTick, onMounted, ref, watch } from 'vue'
import { useSplashStore } from '../stores/splash'
import { Capacitor } from '@capacitor/core'
import { SplashScreen as CapSplash } from '@capacitor/splash-screen'
import logoImg from '../assets/logo.png'

// Use /splash.mp4 from public/ so it loads reliably in Capacitor (native) and web
const splashVideoSrc = '/splash.mp4'

const splashStore = useSplashStore()
const splashVideo = ref(null)
const showOverlay = ref(false)
const videoPaused = ref(false)
const videoLoaded = ref(false)
const videoCompleted = ref(false)

// Capacitor.getPlatform() returns 'web' inside iOS WebView; use protocol + webkit bridge
const isIOS = (() => {
  const p = Capacitor.getPlatform()
  if (p === 'ios') return true
  if (typeof window !== 'undefined' && (window.location?.protocol === 'capacitor:' || !!window.webkit?.messageHandlers)) return true
  return false
})()

let logoErrorHandled = false

const handleLogoError = (event) => {
  // Prevent infinite loop - if we've already handled this error, ignore it
  if (logoErrorHandled || !event || !event.target) {
    return
  }
  
  logoErrorHandled = true
  console.warn('Logo failed to load, hiding logo to prevent infinite retry loop')
  
  // Hide the image immediately and remove error handler to prevent further attempts
  const img = event.target
  img.style.display = 'none'
  img.onerror = null
}

const handleLogoLoad = () => {
  console.log('Logo loaded successfully')
}

const attemptPlay = () => {
  const video = splashVideo.value
  if (!video) return
  const p = video.play()
  if (p && typeof p.then === 'function') {
    p.catch((e) => {
      console.warn('📹 Video play() rejected:', e?.message || e)
    })
  }
}

const onVideoLoaded = () => {
  console.log('📹 Video loaded and ready to play')
  videoLoaded.value = true
  attemptPlay()
}

const onVideoCanPlay = () => {
  console.log('📹 Video canplay')
  if (splashVideo.value?.paused) attemptPlay()
}

const onVideoError = () => {
  const v = splashVideo.value
  const err = v?.error
  console.error('📹 Video error:', {
    message: err?.message,
    code: err?.code,
    networkState: v?.networkState,
    src: splashVideoSrc
  })
  showOverlay.value = true
  videoCompleted.value = false
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
  
  // Mark video as completed (this will hide the logo)
  videoCompleted.value = true
  
  // Show overlay after video ends (only loading spinner, no logo)
  showOverlay.value = true
  console.log('🎭 Overlay displayed with loading state (no logo)')
  
  // Notify the splash store that video is completed
  splashStore.setVideoCompleted()
}

// Watch for when splash should hide
watch(() => splashStore.show, (newVal) => {
  console.log('👁️ Splash visibility changed:', newVal)
})

onMounted(async () => {
  const platform = Capacitor.getPlatform()
  console.log('🎬 SplashScreen mounted', { platform, isIOS, videoSrc: splashVideoSrc })
  
  // Hide native Capacitor splash so our video splash is visible. The native splash
  // sits on top of the WebView; we hide it as soon as we're showing our custom splash.
  if (Capacitor.isNativePlatform()) {
    setTimeout(async () => {
      try {
        await CapSplash.hide()
        console.log('📹 Native splash hidden – video splash now visible')
      } catch (err) {
        console.warn('⚠️ Could not hide native splash early:', err)
      }
    }, 80)
  }
  
  await nextTick()
  attemptPlay()
  
  const videoNotPlayingMs = 1400
  setTimeout(() => {
    if (showOverlay.value) return // already showing (error or ended)
    const video = splashVideo.value
    if (!video) {
      console.warn('⚠️ Video element not available, showing overlay')
      showOverlay.value = true
      splashStore.setVideoCompleted()
      return
    }
    if (video.paused && video.currentTime === 0) {
      console.warn('⚠️ Video not playing after', videoNotPlayingMs, 'ms, showing overlay')
      showOverlay.value = true
      splashStore.setVideoCompleted()
    }
  }, videoNotPlayingMs)
  
  // Safety: force complete after 2.5s if video still "in progress"
  setTimeout(() => {
    if (!splashStore.videoCompleted) {
      console.warn('⏱️ Splash: Forcing video completion after 2.5s timeout')
      showOverlay.value = true
      splashStore.setVideoCompleted()
    }
  }, 2500)
  
  // Fallback to force hide after 4 seconds
  setTimeout(() => {
    if (splashStore.show) {
      console.warn('⏱️ Splash timeout - forcing hide after 4s')
      showOverlay.value = true
      splashStore.setVideoCompleted()
      splashStore.setAppInitialized()
      splashStore.hideSplash()
    }
  }, 4000)
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
  background: rgba(35, 31, 32, 0.3); /* Light overlay - video still visible */
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
  transition: opacity 0.25s ease-in;
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
