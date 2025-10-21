import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

export default async () => {
  // Only run on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // Hide native splash IMMEDIATELY to show our custom video splash
      // This prevents white screen flashes
      await SplashScreen.hide()
      console.log('✅ Native splash hidden immediately - custom video splash will take over')
      
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

