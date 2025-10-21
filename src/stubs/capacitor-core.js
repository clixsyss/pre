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

export default Capacitor
