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
   * Create WhatsApp message for gate pass
   * @param {Object} pass - Gate pass object
   * @returns {string} - Formatted message
   */
  createGatePassMessage(pass) {
    const validUntil = new Date(pass.validUntil).toLocaleString()

    // Sanitize all user inputs to prevent XSS
    const guestName = sanitizeString(pass.guestName, 100)
    const purpose = sanitizeString(pass.purpose, 200)

    return `This is a guest for ${guestName}

Pass Details:
Valid Until: ${validUntil}
Purpose: ${purpose}

Please show the QR code image at the gate for entry.`
  }






  /**
   * Share pass with QR code image using native share
   * @param {Object} pass - Gate pass object
   * @param {string} qrCodeDataUrl - QR code as data URL
   * @returns {Promise<Object>} - Success status
   */
  async sharePassWithImage(pass, qrCodeDataUrl) {
    try {
      // Validate inputs
      const validatedPass = validatePass(pass)

      // Create message
      const message = this.createGatePassMessage(validatedPass)

      console.log('📱 Sharing pass with QR code image')

      if (Capacitor.isNativePlatform()) {
        // For native platforms, use the Share plugin
        const { Share } = await import('@capacitor/share')
        
        // Convert data URL to blob for sharing
        const response = await fetch(qrCodeDataUrl)
        const blob = await response.blob()
        
        // Create a temporary file URL for the image
        const imageUrl = URL.createObjectURL(blob)
        
        try {
          await Share.share({
            title: `Gate Pass for ${validatedPass.guestName}`,
            text: message,
            url: imageUrl,
            dialogTitle: 'Share Gate Pass',
          })

          return {
            success: true,
            message: 'Pass shared successfully!',
          }
        } catch (shareError) {
          console.warn('Share failed, falling back to text only:', shareError)
          // Fallback to text only
          await Share.share({
            title: `Gate Pass for ${validatedPass.guestName}`,
            text: message,
            dialogTitle: 'Share Gate Pass',
          })

          return {
            success: true,
            message: 'Pass shared successfully (text only)!',
          }
        }
      } else {
        // For web, download the QR code and show instructions
        try {
          // Download the QR code image
          const link = document.createElement('a')
          link.href = qrCodeDataUrl
          link.download = `gate-pass-${validatedPass.guestName.replace(/\s+/g, '-')}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          return {
            success: true,
            message: 'QR code downloaded. You can now share it via any app on your device.',
          }
        } catch (webError) {
          console.warn('Web sharing failed:', webError)
          return {
            success: true,
            message: 'Pass generated. Please use the share button to share manually.',
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sharing pass with image:', error)
      throw new Error('Failed to share pass')
    }
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

      if (Capacitor.isNativePlatform()) {
        // For native platforms, use the Share plugin
        const { Share } = await import('@capacitor/share')
        
        await Share.share({
          title: `Gate Pass for ${validatedPass.guestName}`,
          text: message,
          dialogTitle: 'Share Gate Pass',
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
