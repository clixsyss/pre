/**
 * Start Face enrollment offline queue processor (30min interval, online, visibility).
 * Ensures queued enrollments are sent when the device becomes available.
 * Safe to run in SSR; startQueueProcessor guards for window.
 */
import { boot } from 'quasar/wrappers'
import { startQueueProcessor } from '../services/faceEnrollmentService'

export default boot(() => {
  startQueueProcessor()
})
