/**
 * Start Face enrollment offline queue processor (retries at 12 PM–1 PM & 12 AM–1 AM + online).
 * Ensures queued enrollments are sent when the device becomes available.
 * Safe to run in SSR; startQueueProcessor guards for window.
 */
import { boot } from 'quasar/wrappers'
import { startQueueProcessor } from '../services/faceEnrollmentService'

export default boot(() => {
  startQueueProcessor()
})
