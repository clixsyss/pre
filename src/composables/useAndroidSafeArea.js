import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'

/**
 * Composable to handle Android safe area insets
 * Since env(safe-area-inset-*) doesn't work reliably in Android WebView,
 * we calculate safe areas using JavaScript and apply them as CSS variables
 */
export function useAndroidSafeArea() {
  const safeAreaTop = ref(0)
  const safeAreaBottom = ref(0)
  let resizeTimeout = null

  /**
   * Calculate safe area insets for Android
   * Uses proven calculation method that works reliably across Android devices
   */
  const calculateSafeAreas = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return
    }

    try {
      // Wait a brief moment for layout to stabilize (important after orientation changes)
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const devicePixelRatio = window.devicePixelRatio || 1
      
      // Get dimensions in CSS pixels (what we care about for layout)
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // Get screen dimensions in physical pixels
      const screenHeight = window.screen.height
      const screenWidth = window.screen.width
      
      // Calculate system UI space
      // Screen height (in CSS px) = screenHeight / devicePixelRatio
      // The difference tells us how much space system UI takes
      const screenHeightCSS = screenHeight / devicePixelRatio
      const systemUISpace = screenHeightCSS - viewportHeight
      
      // Android status bar standard heights:
      // - Normal devices: 24dp (converts to ~24px at 1x, ~48px at 2x, but we want CSS px)
      // - Notch devices: 48dp (converts to ~48px at 1x)
      // In CSS pixels, typically: 24px (most) or 48px (notch/cutout)
      let topInset = 24 // Safe default
      
      // Estimate top inset from system UI space
      // If system UI space is small (< 60px), likely just status bar
      // If larger, might include notch - use higher value
      if (systemUISpace > 0) {
        if (systemUISpace < 60) {
          topInset = Math.min(Math.max(systemUISpace, 24), 48)
        } else {
          // Likely includes navigation bar, so status bar is probably ~24-48px
          topInset = 48 // Safe for notch devices
        }
      } else {
        // If system UI space is 0 or negative, use minimum
        topInset = 24
      }
      
      // Bottom navigation bar estimation
      // Gesture navigation: 0-16px (minimal)
      // Button navigation: ~48px in CSS pixels
      // Calculate: if system UI space is large, navigation bar is likely present
      let bottomInset = 16 // Safe minimum for gesture nav
      
      if (systemUISpace > topInset) {
        // Navigation bar likely present
        const estimatedNavBar = systemUISpace - topInset
        bottomInset = Math.max(16, Math.min(estimatedNavBar, 48))
      } else if (systemUISpace > 0) {
        // Small system UI, might be gesture nav with minimal inset
        bottomInset = Math.max(16, systemUISpace - topInset)
      }
      
      // Apply minimum safe values
      topInset = Math.max(topInset, 24)
      bottomInset = Math.max(bottomInset, 16)
      
      safeAreaTop.value = topInset
      safeAreaBottom.value = bottomInset
      
      // Apply as CSS custom properties (these will be used in our CSS)
      document.documentElement.style.setProperty('--android-safe-area-top', `${topInset}px`)
      document.documentElement.style.setProperty('--android-safe-area-bottom', `${bottomInset}px`)
      
      console.log('📱 Android Safe Areas:', {
        devicePixelRatio,
        viewport: `${viewportWidth}x${viewportHeight}`,
        screen: `${screenWidth}x${screenHeight} (${screenHeightCSS.toFixed(1)} CSS px)`,
        systemUISpace: `${systemUISpace.toFixed(1)}px`,
        calculated: { top: topInset, bottom: bottomInset }
      })
    } catch (error) {
      console.error('⚠️ Error calculating Android safe areas:', error)
      // Fallback to safe defaults that work on most devices
      const topFallback = 24
      const bottomFallback = 16
      safeAreaTop.value = topFallback
      safeAreaBottom.value = bottomFallback
      document.documentElement.style.setProperty('--android-safe-area-top', `${topFallback}px`)
      document.documentElement.style.setProperty('--android-safe-area-bottom', `${bottomFallback}px`)
      console.log('📱 Using fallback safe areas:', { top: topFallback, bottom: bottomFallback })
    }
  }

  /**
   * Handle window resize (orientation change, keyboard, etc.)
   */
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      calculateSafeAreas()
    }, 100)
  }

  /**
   * Initialize safe area calculation
   */
  const initialize = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return
    }

    // Calculate immediately
    await calculateSafeAreas()

    // Recalculate on resize/orientation change
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    // Also listen for visual viewport changes (keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }
  }

  /**
   * Cleanup listeners
   */
  const cleanup = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize)
    }
  }

  return {
    safeAreaTop,
    safeAreaBottom,
    initialize,
    cleanup,
    calculateSafeAreas
  }
}
