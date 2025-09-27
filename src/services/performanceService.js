/**
 * Performance Service - Monitor and track app performance metrics
 */

class PerformanceService {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
    this.isEnabled = true
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName) {
    if (!this.isEnabled) return
    
    this.startTimes.set(operationName, performance.now())
    console.log(`⏱️ Performance: Started timing "${operationName}"`)
  }

  /**
   * End timing an operation and record the result
   */
  endTimer(operationName) {
    if (!this.isEnabled) return
    
    const startTime = this.startTimes.get(operationName)
    if (!startTime) {
      console.warn(`⏱️ Performance: No start time found for "${operationName}"`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Record the metric
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, [])
    }
    
    const operationMetrics = this.metrics.get(operationName)
    operationMetrics.push({
      timestamp: Date.now(),
      duration: duration,
      date: new Date().toISOString()
    })

    // Keep only last 100 measurements per operation
    if (operationMetrics.length > 100) {
      operationMetrics.shift()
    }

    console.log(`⏱️ Performance: "${operationName}" took ${duration.toFixed(2)}ms`)
    
    // Remove start time
    this.startTimes.delete(operationName)
    
    return duration
  }

  /**
   * Get average time for an operation
   */
  getAverageTime(operationName) {
    const operationMetrics = this.metrics.get(operationName)
    if (!operationMetrics || operationMetrics.length === 0) {
      return null
    }

    const totalTime = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return totalTime / operationMetrics.length
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result = {}
    
    for (const [operationName, metrics] of this.metrics.entries()) {
      result[operationName] = {
        count: metrics.length,
        average: this.getAverageTime(operationName),
        latest: metrics.length > 0 ? metrics[metrics.length - 1] : null,
        all: metrics
      }
    }
    
    return result
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      totalOperations: 0,
      slowOperations: [],
      fastOperations: [],
      averageTimes: {}
    }

    for (const [operationName, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        const avgTime = this.getAverageTime(operationName)
        summary.totalOperations += metrics.length
        summary.averageTimes[operationName] = avgTime

        // Categorize operations by speed
        if (avgTime > 1000) { // Slower than 1 second
          summary.slowOperations.push({ operation: operationName, average: avgTime })
        } else if (avgTime < 100) { // Faster than 100ms
          summary.fastOperations.push({ operation: operationName, average: avgTime })
        }
      }
    }

    // Sort slow operations by average time
    summary.slowOperations.sort((a, b) => b.average - a.average)
    
    // Sort fast operations by average time
    summary.fastOperations.sort((a, b) => a.average - b.average)

    return summary
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear()
    this.startTimes.clear()
    console.log('⏱️ Performance: All metrics cleared')
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`⏱️ Performance: Monitoring ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Time a promise-based operation
   */
  async timeOperation(operationName, operation) {
    this.startTimer(operationName)
    try {
      const result = await operation()
      this.endTimer(operationName)
      return result
    } catch (error) {
      this.endTimer(operationName)
      throw error
    }
  }

  /**
   * Time a synchronous operation
   */
  timeSyncOperation(operationName, operation) {
    this.startTimer(operationName)
    try {
      const result = operation()
      this.endTimer(operationName)
      return result
    } catch (error) {
      this.endTimer(operationName)
      throw error
    }
  }

  /**
   * Log performance summary to console
   */
  logSummary() {
    const summary = this.getPerformanceSummary()
    
    console.group('⏱️ Performance Summary')
    console.log(`Total operations tracked: ${summary.totalOperations}`)
    
    if (summary.slowOperations.length > 0) {
      console.group('🐌 Slow Operations (>1s)')
      summary.slowOperations.forEach(op => {
        console.log(`${op.operation}: ${op.average.toFixed(2)}ms average`)
      })
      console.groupEnd()
    }
    
    if (summary.fastOperations.length > 0) {
      console.group('⚡ Fast Operations (<100ms)')
      summary.fastOperations.forEach(op => {
        console.log(`${op.operation}: ${op.average.toFixed(2)}ms average`)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}

// Create singleton instance
const performanceService = new PerformanceService()

// Log performance summary every 30 seconds in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceService.logSummary()
  }, 30000)
}

export default performanceService