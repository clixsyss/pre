import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

export default async () => {
  // Only run on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // DON'T hide splash immediately - let Vue app initialize first
      // The custom splash screen will hide the native splash after it's ready
      // This prevents the white screen flash
      
      // Show the status bar (without hiding splash yet)
      await StatusBar.show()
      
      // Set status bar style to dark content (for light backgrounds)
      // Use Style.Light for dark content on light background (black text/icons)
      // Use Style.Dark for light content on dark background (white text/icons)
      await StatusBar.setStyle({ style: Style.Dark })
      
      // Set background color to match your app header
      await StatusBar.setBackgroundColor({ color: '#231F20' })
      
      // On iOS, make sure the status bar doesn't overlap web content
      await StatusBar.setOverlaysWebView({ overlay: false })
      
      console.log('✅ Status bar initialized successfully')
      
      // Wait for Vue app to be ready before hiding native splash
      // The SplashScreen component will trigger 'appReady' event
      const hideNativeSplash = async () => {
        // Small delay to ensure Vue splash is visible
        await new Promise(resolve => setTimeout(resolve, 100))
        await SplashScreen.hide()
        console.log('✅ Native splash screen hidden after Vue app ready')
      }
      
      // Listen for app ready event from Vue
      window.addEventListener('appReady', hideNativeSplash, { once: true })
      
      // Fallback: hide after 5 seconds if event never fires
      setTimeout(async () => {
        try {
          await SplashScreen.hide()
          console.log('⚠️ Native splash hidden via fallback timeout')
        } catch {
          // Ignore if already hidden
        }
      }, 5000)
      
    } catch (error) {
      console.error('Error initializing status bar/splash:', error)
    }
  }
}

