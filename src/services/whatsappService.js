import { Capacitor } from '@capacitor/core'

/**
 * Input validation and sanitization utilities
 */

const sanitizeString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') {
    return ''
  }
  // Remove potentially dangerous characters and limit length
  return str
    .replace(/[<>"'&]/g, '')
    .substring(0, maxLength)
    .trim()
}

const validatePass = (pass) => {
  if (!pass || typeof pass !== 'object') {
    throw new Error('Invalid pass data')
  }

  if (!pass.guestName || !pass.code || !pass.validUntil) {
    throw new Error('Pass data is incomplete')
  }

  return {
    id: pass.id || pass.code, // Use id or fallback to code
    projectId: pass.projectId, // Preserve projectId for URL generation
    guestName: sanitizeString(pass.guestName, 100),
    purpose: sanitizeString(pass.purpose, 200),
    code: sanitizeString(pass.code, 50),
    validUntil: pass.validUntil,
  }
}

/**
 * Sharing Service
 * Handles sharing gate passes with QR codes using native share functionality
 */
class SharingService {


  /**
   * Create guest pass message with shareable link
   * @param {Object} pass - Gate pass object
   * @returns {string} - Formatted message
   */
  createGatePassMessage(pass) {
    const validDate = new Date(pass.validUntil).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Sanitize all user inputs to prevent XSS
    const guestName = sanitizeString(pass.guestName, 100)
    const purpose = sanitizeString(pass.purpose, 200)
    
    // Generate shareable link for the guest pass
    const passUrl = this.generatePassUrl(pass)

    return `🏘️ *PRE Group - Guest Pass*

Dear ${guestName},

You have been invited as a guest to PRE Group community.

📋 *Pass Details:*
👤 Guest: ${guestName}
📅 Valid Until: ${validDate}
🎯 Purpose: ${purpose}

🔗 *Your Guest Pass:*
${passUrl}

✅ *Instructions:*
Open the link above to view your QR code. Present the QR code at the main gate for entry. The security team will scan it for verification.

Thank you for visiting PRE Group! 🌟

_This is an automated message from PRE Group Management System._`
  }

  /**
   * Generate public URL for guest pass
   * @param {Object} pass - Gate pass object
   * @returns {string} - Public URL
   */
  generatePassUrl(pass) {
    console.log('🔗 Generating URL for pass:', { id: pass.id, code: pass.code, projectId: pass.projectId })
    
    // Use the pass ID (which could be in different fields)
    const passId = pass.id || pass.code || pass.passId
    const projectId = pass.projectId
    
    if (!passId || !projectId) {
      console.error('❌ Missing pass ID or project ID:', { passId, projectId, pass })
      throw new Error('Invalid pass data - missing ID or project ID')
    }
    
    // Get base URL from environment variable (AWS hosting)
    // Falls back to Firebase for backward compatibility during migration
    const baseUrl = 
      import.meta.env.VITE_GUEST_PASS_BASE_URL || 
      import.meta.env.VITE_PUBLIC_URL ||
      process.env.VITE_GUEST_PASS_BASE_URL ||
      process.env.VITE_PUBLIC_URL ||
      'https://pre-group.firebaseapp.com' // Fallback to Firebase during migration
    
    console.log('🌐 Using base URL for guest pass:', baseUrl)
    
    const url = `${baseUrl}/#/guest-pass/${projectId}/${passId}`
    console.log('🔗 Generated URL:', url)
    return url
  }






  /**
   * Share pass with link (NOT image)
   * The link displays the QR code when opened
   * @param {Object} pass - Gate pass object
   * @returns {Promise<Object>} - Success status
   */
  async sharePassWithLink(pass) {
    try {
      // Validate inputs
      const validatedPass = validatePass(pass)

      // Create message with shareable link
      const message = this.createGatePassMessage(validatedPass)
      const passUrl = this.generatePassUrl(validatedPass)

      console.log('🔗 Sharing pass with link:', passUrl)

      // Enhanced iOS/Android detection
      const protocol = window.location.protocol
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined
      const isNative = protocol === 'capacitor:' || hasIOSBridge || Capacitor.getPlatform() === 'android'
      
      console.log('📱 Platform detection:', { protocol, isNative, platform: Capacitor.getPlatform() })

      if (isNative) {
        // For native platforms, use Share plugin from Capacitor.Plugins
        console.log('📱 Accessing Share from Capacitor.Plugins...')
        const Share = window.Capacitor?.Plugins?.Share
        
        if (!Share) {
          console.error('❌ Share not found in Capacitor.Plugins')
          throw new Error('Share plugin not available')
        }
        
        try {
          console.log('📤 Opening native share dialog...')
          console.log('📤 Share object:', Share)
          console.log('📤 Pass URL:', passUrl)
          console.log('📤 Pass data:', validatedPass)
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
            url: passUrl, // Share the URL directly
              dialogTitle: 'Share PRE Group Guest Pass',
            })
          console.log('✅ Share dialog completed')

            return {
              success: true,
              message: 'Pass shared successfully!',
            }
          } catch (shareError) {
          console.error('❌ Share failed:', shareError)
            
          // If sharing failed, user might have cancelled
          if (shareError.message && shareError.message.includes('cancelled')) {
            return {
              success: false,
              message: 'Share cancelled',
            }
          }
          
          throw shareError
        }
      } else {
        // For web, copy link to clipboard
        try {
          await navigator.clipboard.writeText(`${message}\n\n${passUrl}`)
          return {
            success: true,
            message: 'Guest pass link copied to clipboard!',
          }
        } catch (clipboardError) {
          console.warn('Clipboard failed:', clipboardError)
          return {
            success: true,
            message: `Pass URL: ${passUrl}`,
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sharing pass:', error)
      throw new Error('Failed to share pass: ' + (error.message || 'Unknown error'))
    }
  }

  /**
   * Legacy method - now redirects to link sharing
   * @deprecated Use sharePassWithLink instead
   */
  async sharePassWithImage(pass) {
    console.log('⚠️ sharePassWithImage is deprecated, using sharePassWithLink instead')
    return this.sharePassWithLink(pass)
  }

  /**
   * Share pass text only using native share
   * @param {Object} pass - Gate pass object
   * @returns {Promise<Object>} - Success status
   */
  async sharePassText(pass) {
    try {
      // Validate inputs
      const validatedPass = validatePass(pass)

      // Create message
      const message = this.createGatePassMessage(validatedPass)

      console.log('📱 Sharing pass text')

      // Enhanced iOS/Android detection
      const protocol = window.location.protocol
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined
      const isNative = protocol === 'capacitor:' || hasIOSBridge || Capacitor.getPlatform() === 'android'

      if (isNative) {
        // For native platforms, use the Share plugin from Capacitor.Plugins
        const Share = window.Capacitor?.Plugins?.Share
        
        if (!Share) {
          throw new Error('Share plugin not available')
        }
        
        await Share.share({
          title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
          text: message,
          dialogTitle: 'Share PRE Group Guest Pass',
        })

        return {
          success: true,
          message: 'Pass shared successfully!',
        }
      } else {
        // For web, copy to clipboard
        try {
          await navigator.clipboard.writeText(message)
          return {
            success: true,
            message: 'Pass details copied to clipboard!',
          }
        } catch (clipboardError) {
          console.warn('Clipboard failed:', clipboardError)
          return {
            success: true,
            message: 'Pass generated. Please copy the details manually.',
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sharing pass text:', error)
      throw new Error('Failed to share pass')
    }
  }
}

// Export singleton instance
export default new SharingService()
