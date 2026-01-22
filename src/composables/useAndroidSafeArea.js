import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'

/**
 * Composable to handle Android safe area insets
 * Since env(safe-area-inset-*) doesn't work reliably in Android WebView,
 * we calculate safe areas using JavaScript and apply them as CSS variables
 */
export function useAndroidSafeArea() {
  const safeAreaTop = ref(0)
  const safeAreaBottom = ref(0)

  /**
   * Calculate safe area insets for Android
   * Uses multiple methods to get accurate safe area values
   * NOTE: This is kept for potential future use, but currently we use simple CSS padding
   */
  const calculateSafeAreas = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return
    }

    try {
      // Wait a brief moment for layout to stabilize (important after orientation changes)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const devicePixelRatio = window.devicePixelRatio || 1
      
      // Get dimensions in CSS pixels
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // Get screen dimensions in physical pixels
      const screenHeight = window.screen.height
      const screenWidth = window.screen.width
      
      // Method 1: Try to get status bar height from Capacitor StatusBar plugin
      let statusBarHeight = 0
      try {
        const statusBarInfo = await StatusBar.getInfo()
        if (statusBarInfo && statusBarInfo.visible) {
          // StatusBar height is in device pixels, convert to CSS pixels
          statusBarHeight = (statusBarInfo.height || 0) / devicePixelRatio
          console.log('📱 StatusBar.getInfo() result:', { 
            height: statusBarInfo.height, 
            cssHeight: statusBarHeight,
            visible: statusBarInfo.visible 
          })
        }
      } catch {
        console.log('📱 StatusBar.getInfo() not available, using fallback calculation')
      }
      
      // Method 2: Calculate from screen/viewport differences
      const screenHeightCSS = screenHeight / devicePixelRatio
      const systemUISpace = screenHeightCSS - viewportHeight
      
      // Calculate top inset (status bar)
      let topInset = 24 // Safe default
      
      if (statusBarHeight > 0) {
        // Use actual status bar height from plugin
        topInset = Math.max(statusBarHeight, 24)
      } else if (systemUISpace > 0) {
        // Estimate from system UI space
        if (systemUISpace < 60) {
          // Small space, likely just status bar
          topInset = Math.min(Math.max(systemUISpace, 24), 48)
        } else {
          // Larger space, might include navigation bar
          // Status bar is typically 24-48px
          topInset = 48 // Safe for notch devices
        }
      }
      
      // Calculate bottom inset (navigation bar)
      let bottomInset = 16 // Safe minimum for gesture navigation
      
      if (systemUISpace > topInset) {
        // Navigation bar likely present
        const estimatedNavBar = (systemUISpace - topInset)
        // Navigation bar is typically 48px for button nav, 16px for gesture nav
        bottomInset = Math.max(16, Math.min(estimatedNavBar, 48))
      } else {
        // Use a safe default based on common Android navigation patterns
        // Modern Android devices use gesture navigation (16px) or button nav (48px)
        bottomInset = 24 // Balanced default
      }
      
      // Apply minimum safe values (ensures UI is never hidden)
      topInset = Math.max(topInset, 24)
      bottomInset = Math.max(bottomInset, 16)
      
      safeAreaTop.value = topInset
      safeAreaBottom.value = bottomInset
      
      // Apply as CSS custom properties
      document.documentElement.style.setProperty('--android-safe-area-top', `${topInset}px`)
      document.documentElement.style.setProperty('--android-safe-area-bottom', `${bottomInset}px`)
      
      console.log('📱 Android Safe Areas Calculated:', {
        devicePixelRatio,
        viewport: `${viewportWidth}x${viewportHeight}`,
        screen: `${screenWidth}x${screenHeight} (${screenHeightCSS.toFixed(1)} CSS px)`,
        systemUISpace: `${systemUISpace.toFixed(1)}px`,
        statusBarHeight: statusBarHeight > 0 ? `${statusBarHeight.toFixed(1)}px` : 'not available',
        calculated: { 
          top: `${topInset}px`, 
          bottom: `${bottomInset}px` 
        },
        cssVars: {
          top: `var(--android-safe-area-top) = ${topInset}px`,
          bottom: `var(--android-safe-area-bottom) = ${bottomInset}px`
        }
      })
    } catch (error) {
      console.error('⚠️ Error calculating Android safe areas:', error)
      // Fallback to safe defaults that work on most devices
      const topFallback = 24
      const bottomFallback = 24 // Increased from 16 to 24 for better compatibility
      safeAreaTop.value = topFallback
      safeAreaBottom.value = bottomFallback
      document.documentElement.style.setProperty('--android-safe-area-top', `${topFallback}px`)
      document.documentElement.style.setProperty('--android-safe-area-bottom', `${bottomFallback}px`)
      console.log('📱 Using fallback safe areas:', { top: topFallback, bottom: bottomFallback })
    }
  }


  /**
   * Initialize safe area - simplified approach using CSS padding
   * The platform-android class is set in App.vue, this is just a fallback
   */
  const initialize = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return
    }

    // Ensure Android class is set (fallback if App.vue hasn't set it yet)
    if (!document.body.classList.contains('platform-android')) {
      document.body.classList.add('platform-android')
      console.log('📱 Android platform class added by useAndroidSafeArea (fallback)')
    }

    // Set CSS variables for consistency (though we're using direct padding in CSS now)
    document.documentElement.style.setProperty('--android-safe-area-top', '24px')
    document.documentElement.style.setProperty('--android-safe-area-bottom', '24px')
  }

  /**
   * Cleanup - simplified, no listeners to clean up
   */
  const cleanup = () => {
    // No cleanup needed with simplified approach
  }

  return {
    safeAreaTop,
    safeAreaBottom,
    initialize,
    cleanup,
    calculateSafeAreas
  }
}
