/**
 * Capacitor Firebase App initialization
 * On iOS, the Capacitor Firebase plugins auto-initialize from GoogleService-Info.plist
 * This boot file is a placeholder for future initialization needs
 */

import { defineBoot } from '#q-app/wrappers'
import { detectPlatformFromUrl } from './firebase'

export default defineBoot(async () => {
  const platformInfo = detectPlatformFromUrl()
  
  if (platformInfo.isNative) {
    console.log('🔥 Capacitor Firebase: Running on', platformInfo.platform)
    console.log('🔥 Capacitor Firebase: Auto-initialized from native config files')
  } else {
    console.log('🌐 Capacitor Firebase: Web platform - using Firebase Web SDK')
  }
})

