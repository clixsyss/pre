import { defineBoot } from '#q-app/wrappers'

// Smart Mirror Firebase is temporarily disabled.
// Firebase init (initializeAuth + indexedDBLocalPersistence) on native adds
// significant startup latency. Re-enable by restoring the full implementation.

let smartMirrorApp = null
let smartMirrorAuth = null
let smartMirrorDb = null

// Kept as a lightweight export so existing importers (notificationCenter.js etc.) don't break.
const detectPlatformFromUrl = () => {
  const protocol = window.location.protocol
  const hasIOSBridge = window.webkit?.messageHandlers !== undefined
  if (protocol === 'capacitor:' || hasIOSBridge) return { isNative: true, platform: 'ios' }
  try {
    const cap = window.Capacitor
    if (cap) return { isNative: cap.isNativePlatform(), platform: cap.getPlatform() }
  } catch { /* ignore */ }
  return { isNative: false, platform: 'web' }
}

export default defineBoot(() => {
  // no-op
})

export { smartMirrorApp, smartMirrorAuth, smartMirrorDb, detectPlatformFromUrl }
