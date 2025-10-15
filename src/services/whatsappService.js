import { Capacitor } from '@capacitor/core'

/**
 * Input validation and sanitization utilities
 */
const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Phone number is required')
  }

  // Remove all non-digit characters for validation
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Basic validation - should be 10-15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number format')
  }

  return cleaned
}

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
 * WhatsApp Service
 * Handles sending gate passes via WhatsApp using phone numbers
 */
class WhatsAppService {
  /**
   * Send gate pass via WhatsApp
   * @param {Object} pass - Gate pass object
   * @param {string} phoneNumber - Recipient's phone number
   * @returns {Promise<Object>} - Success status and message
   */
  async sendGatePassViaWhatsApp(pass, phoneNumber) {
    try {
      // Validate inputs
      const validatedPass = validatePass(pass)
      const validatedPhone = validatePhoneNumber(phoneNumber)

      // Format phone number (remove spaces, add country code if needed)
      const formattedPhone = this.formatPhoneNumber(validatedPhone)

      // Create WhatsApp message
      const message = this.createGatePassMessage(validatedPass)

      // Create WhatsApp URL
      const whatsappUrl = this.createWhatsAppUrl(formattedPhone, message)

      console.log('📱 Sending gate pass via WhatsApp')

      if (Capacitor.isNativePlatform()) {
        // For native platforms, use the App plugin or open URL
        return await this.openWhatsAppNative(whatsappUrl)
      } else {
        // For web, open in new tab
        return await this.openWhatsAppWeb(whatsappUrl)
      }
    } catch {
      console.error('❌ Error sending gate pass via WhatsApp')
      throw new Error('Failed to send via WhatsApp')
    }
  }

  /**
   * Format phone number for WhatsApp
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '')

    // If it doesn't start with country code, assume it's a local number
    // You might want to adjust this based on your region
    if (cleaned.length === 10) {
      // Add country code (adjust based on your region)
      cleaned = '1' + cleaned // Example: US/Canada
    }

    // Validate the final phone number
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Invalid phone number format')
    }

    return cleaned
  }

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
    const code = sanitizeString(pass.code, 50)

    return `🚪 *Gate Pass for ${guestName}*

📋 *Pass Details:*
• Guest: ${guestName}
• Purpose: ${purpose}
• Valid Until: ${validUntil}
• Pass Code: ${code}

📱 *Instructions:*
1. Show this message at the gate
2. The QR code will be sent separately
3. Present valid ID when requested

⚠️ *Important:*
• This pass is valid only for the specified time
• Do not share this pass with others
• Contact the property management if you have issues

---
Sent via PRE Group Mobile App`
  }

  /**
   * Create WhatsApp URL
   * @param {string} phoneNumber - Formatted phone number
   * @param {string} message - Message text
   * @returns {string} - WhatsApp URL
   */
  createWhatsAppUrl(phoneNumber, message) {
    // Validate phone number format
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format for WhatsApp URL')
    }

    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  }

  /**
   * Open WhatsApp on native platforms
   * @param {string} whatsappUrl - WhatsApp URL
   * @returns {Promise<Object>} - Success status
   */
  async openWhatsAppNative(whatsappUrl) {
    try {
      // For native platforms, you might want to use a plugin like @capacitor/browser
      // or @capacitor/app to open the URL

      // Fallback: try to open the URL directly
      if (window.open) {
        window.open(whatsappUrl, '_blank')
        return {
          success: true,
          message: 'WhatsApp opened successfully',
        }
      } else {
        throw new Error('Unable to open WhatsApp on this platform')
      }
    } catch {
      console.error('❌ Error opening WhatsApp on native')
      throw new Error('Failed to open WhatsApp')
    }
  }

  /**
   * Open WhatsApp on web
   * @param {string} whatsappUrl - WhatsApp URL
   * @returns {Promise<Object>} - Success status
   */
  async openWhatsAppWeb(whatsappUrl) {
    try {
      // Open WhatsApp Web in a new tab
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      if (!newWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      return {
        success: true,
        message: 'WhatsApp Web opened successfully',
      }
    } catch {
      console.error('❌ Error opening WhatsApp Web')
      throw new Error('Failed to open WhatsApp Web')
    }
  }

  /**
   * Check if WhatsApp is available on the device
   * @returns {Promise<boolean>} - Availability status
   */
  async isWhatsAppAvailable() {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native platforms, assume WhatsApp is available
        return true
      } else {
        // On web, check if we can open URLs
        return typeof window !== 'undefined' && typeof window.open === 'function'
      }
    } catch {
      console.error('❌ Error checking WhatsApp availability')
      return false
    }
  }

  /**
   * Send QR code image via WhatsApp (if supported)
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} qrCodeDataUrl - QR code as data URL
   * @param {string} guestName - Guest name for context
   * @returns {Promise<Object>} - Success status
   */
  async sendQRCodeViaWhatsApp(phoneNumber, qrCodeDataUrl, guestName) {
    try {
      // Validate inputs
      const validatedPhone = validatePhoneNumber(phoneNumber)
      const sanitizedGuestName = sanitizeString(guestName, 100)

      // Note: WhatsApp Web API doesn't support sending images directly
      // This would require a backend service or different approach

      const message = `📱 *QR Code for ${sanitizedGuestName}*

The QR code for the gate pass has been generated. Please save this image and show it at the gate.

⚠️ *Note:* Due to platform limitations, the QR code image cannot be sent directly through this app. Please use the share function to send it via other means.`

      const formattedPhone = this.formatPhoneNumber(validatedPhone)
      const whatsappUrl = this.createWhatsAppUrl(formattedPhone, message)

      if (Capacitor.isNativePlatform()) {
        return await this.openWhatsAppNative(whatsappUrl)
      } else {
        return await this.openWhatsAppWeb(whatsappUrl)
      }
    } catch {
      console.error('❌ Error sending QR code via WhatsApp')
      throw new Error('Failed to send QR code via WhatsApp')
    }
  }
}

// Export singleton instance
export default new WhatsAppService()
