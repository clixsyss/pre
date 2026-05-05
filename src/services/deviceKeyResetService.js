import firestoreService from './firestoreService'

const deviceKeyResetService = {
  /**
   * Submit a device key reset request to the global table.
   * Device keys are user-level, not project-level.
   */
  async submitResetRequest(userId, reason) {
    if (!userId) throw new Error('User ID is required')
    if (!reason || !reason.trim()) throw new Error('Reason is required')

    const requestData = {
      userId,
      reason: reason.trim(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
      adminNotes: null
    }

    console.log('📝 Submitting device key reset request:', requestData)
    const docRef = await firestoreService.addDoc('deviceKeyResetRequests', requestData)
    console.log('✅ Device key reset request submitted:', docRef.id)

    return { id: docRef.id, ...requestData }
  },

  /**
   * Get all reset requests for a user from the global table.
   */
  async getUserResetRequests(userId) {
    const snapshot = await firestoreService.getDocs('deviceKeyResetRequests', {
      filters: [{ field: 'userId', operator: '==', value: userId }]
    })

    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    requests.sort((a, b) => {
      const toMs = (v) => {
        if (!v) return 0
        if (typeof v === 'string') return new Date(v).getTime()
        if (v?.toMillis) return v.toMillis()
        if (v?.toDate) return v.toDate().getTime()
        if (v instanceof Date) return v.getTime()
        return 0
      }
      return toMs(b.requestedAt) - toMs(a.requestedAt)
    })

    return requests
  },

  async hasPendingRequest(userId) {
    try {
      const requests = await this.getUserResetRequests(userId)
      return requests.some(req => req.status === 'pending')
    } catch {
      return false
    }
  },

  async getLatestRequest(userId) {
    try {
      const requests = await this.getUserResetRequests(userId)
      return requests[0] ?? null
    } catch {
      return null
    }
  },

  getStatusDisplay(status) {
    const map = {
      pending:  { label: 'Pending Review', color: '#f59e0b', icon: 'clock' },
      approved: { label: 'Approved',       color: '#10b981', icon: 'check' },
      rejected: { label: 'Rejected',       color: '#ef4444', icon: 'x'     }
    }
    return map[status] ?? map.pending
  }
}

export default deviceKeyResetService
