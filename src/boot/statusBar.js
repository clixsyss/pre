import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

// Keep native splash visible until app is fully loaded
let nativeSplashHidden = false

export const hideNativeSplash = async () => {
  if (nativeSplashHidden) return
  
  try {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.hide()
      nativeSplashHidden = true
      console.log('✅ Native splash hidden - app is fully loaded')
    }
  } catch (error) {
    console.error('Error hiding native splash:', error)
  }
}

export default async () => {
  // Only run on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // Keep native splash visible to prevent white screen flash
      // It will be hidden when the app is fully loaded
      console.log('✅ Keeping native splash visible until app is ready')
      
      // Show the status bar
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
      
    } catch (error) {
      console.error('Error initializing status bar/splash:', error)
    }
  }
}

