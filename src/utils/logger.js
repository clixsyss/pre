/**
 * Conditional logger utility
 * Only logs in development mode to improve production performance
 */

const isDev = process.env.DEV || process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args)
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    }
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
  }
}

export default logger

