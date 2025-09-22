import { getUserFines } from './finesService'

// Check for new violations that haven't been shown to the user
export const checkForNewViolations = async (projectId, userId) => {
  try {
    // Get all user violations
    const violations = await getUserFines(projectId, userId)
    
    // Filter for issued violations (new ones that need attention)
    const newViolations = violations.filter(violation => 
      violation.status === 'issued' && 
      !violation.notificationShown
    )
    
    return {
      hasNewViolations: newViolations.length > 0,
      violationCount: newViolations.length,
      violations: newViolations
    }
  } catch (error) {
    console.error('Error checking for new violations:', error)
    return {
      hasNewViolations: false,
      violationCount: 0,
      violations: []
    }
  }
}

// Mark violations as notification shown
export const markViolationsAsShown = (violationIds) => {
  try {
    const shownNotifications = JSON.parse(localStorage.getItem('shownViolationNotifications') || '[]')
    const updatedNotifications = [...shownNotifications, ...violationIds]
    localStorage.setItem('shownViolationNotifications', JSON.stringify(updatedNotifications))
    return true
  } catch (error) {
    console.error('Error marking violations as shown:', error)
    return false
  }
}

// Get shown violation notifications from localStorage
export const getShownViolationNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem('shownViolationNotifications') || '[]')
  } catch (error) {
    console.error('Error getting shown violation notifications:', error)
    return []
  }
}

// Check if user has any violations that need attention (regardless of notification status)
export const hasActiveViolations = async (projectId, userId) => {
  try {
    const violations = await getUserFines(projectId, userId)
    const activeViolations = violations.filter(violation => 
      violation.status === 'issued' || violation.status === 'disputed'
    )
    
    return {
      hasActiveViolations: activeViolations.length > 0,
      violationCount: activeViolations.length,
      violations: activeViolations
    }
  } catch (error) {
    console.error('Error checking for active violations:', error)
    return {
      hasActiveViolations: false,
      violationCount: 0,
      violations: []
    }
  }
}

// Clear old notification history (optional cleanup)
export const clearOldNotificationHistory = () => {
  try {
    // For now, we'll just clear all old notifications
    // In a more sophisticated implementation, you might want to store timestamps
    localStorage.setItem('shownViolationNotifications', JSON.stringify([]))
    return true
  } catch (error) {
    console.error('Error clearing old notification history:', error)
    return false
  }
}

export default {
  checkForNewViolations,
  markViolationsAsShown,
  getShownViolationNotifications,
  hasActiveViolations,
  clearOldNotificationHistory
}
