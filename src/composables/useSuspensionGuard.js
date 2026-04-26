import { computed } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { getSuspensionMessage } from '../services/suspensionService'

/**
 * Returns suspension state for a given feature page.
 * @param {string} featureId - one of: 'bookings', 'services', 'requests', 'complaints', 'support', 'qr_codes'
 *
 * Special rule: 'support' is NEVER blocked by a full suspension — suspended users must always
 * be able to contact support. It is only blocked for partial suspensions that explicitly list it.
 */
export function useSuspensionGuard(featureId) {
  const projectStore = useProjectStore()

  const isBlocked = computed(() => {
    const state = projectStore.suspensionState
    if (!state?.isSuspended) return false
    if (featureId === 'support') {
      // Full suspension: support always accessible
      if (state.level === 'full') return false
      // Partial suspension: only blocked if explicitly listed
      return state.blockedFeatures.includes('support')
    }
    return projectStore.isFeatureBlocked(featureId)
  })

  const suspensionMessage = computed(() => {
    if (!isBlocked.value) return null
    const details = projectStore.suspensionState?.details
    return getSuspensionMessage(details)
  })

  return { isBlocked, suspensionMessage }
}
