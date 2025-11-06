// Stub for @capacitor/core in web environment
export const Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web',
  isPluginAvailable: () => false,
}

export const registerPlugin = (/* name, options */) => {
  // Return a mock plugin object
  return {
    addListener: () => Promise.resolve(),
    removeListener: () => Promise.resolve(),
    removeAllListeners: () => Promise.resolve(),
    // Add other common plugin methods as needed
  }
}

export const CapacitorHttp = {
  request: async () => Promise.resolve({ data: {}, status: 200 }),
  get: async () => Promise.resolve({ data: {}, status: 200 }),
  post: async () => Promise.resolve({ data: {}, status: 200 }),
  put: async () => Promise.resolve({ data: {}, status: 200 }),
  patch: async () => Promise.resolve({ data: {}, status: 200 }),
  delete: async () => Promise.resolve({ data: {}, status: 200 }),
}

export class WebPlugin {
  constructor() {
    // Mock WebPlugin class
  }
}

export const buildRequestInit = (options) => {
  return {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || null,
  }
}

export class CapacitorException extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

// Additional stub exports for specific plugins
export const Network = {
  getStatus: async () => ({ connected: true, connectionType: 'wifi' }),
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
}

export const Haptics = {
  impact: async () => {},
  notification: async () => {},
  vibrate: async () => {},
  selectionStart: async () => {},
  selectionChanged: async () => {},
  selectionEnd: async () => {},
}

export const Badge = {
  set: async () => {},
  get: async () => ({ count: 0 }),
  clear: async () => {},
  check: async () => ({ isSupported: false }),
  increase: async () => {},
  decrease: async () => {},
}

export const Keyboard = {
  show: async () => {},
  hide: async () => {},
  setAccessoryBarVisible: async () => {},
  setStyle: async () => {},
  setScroll: async () => {},
  setResize: async () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
}

export const Geolocation = {
  getCurrentPosition: async () => ({ latitude: 0, longitude: 0 }),
  watchPosition: async () => ({ id: '0' }),
  clearWatch: async () => {},
  checkPermissions: async () => ({ location: 'granted' }),
  requestPermissions: async () => ({ location: 'granted' }),
}

export const App = {
  getInfo: async () => ({ name: 'PRE Group', id: 'com.pre-group.app', version: '1.0.0', build: '1' }),
  getState: async () => ({ isActive: true }),
  getLaunchUrl: async () => ({ url: null }),
  openSettings: async () => {
    console.warn('App.openSettings() is not available in web mode. This only works on native platforms.')
  },
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
}

export const Camera = {
  getPhoto: async () => ({ webPath: '', format: 'jpeg' }),
  pickImages: async () => ({ images: [] }),
  pickLimitedLibraryPhotos: async () => ({ photos: [] }),
  checkPermissions: async () => ({ camera: 'granted', photos: 'granted' }),
  requestPermissions: async () => ({ camera: 'granted', photos: 'granted' }),
}

export const CameraResultType = {
  Uri: 'uri',
  Base64: 'base64',
  DataUrl: 'dataUrl',
}

export const CameraSource = {
  Prompt: 'prompt',
  Camera: 'camera',
  Photos: 'photos',
}

export default Capacitor
