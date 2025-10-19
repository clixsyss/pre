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

    return `🏘️ *PRE Group - Guest Pass*

Dear ${guestName},

You have been invited as a guest to PRE Group community.

📋 *Pass Details:*
👤 Guest: ${guestName}
📅 Valid Until: ${validDate}
🎯 Purpose: ${purpose}

✅ *Instructions:*
Please present the attached QR code at the main gate for entry. The security team will scan it for verification.

Thank you for visiting PRE Group! 🌟

_This is an automated message from PRE Group Management System._`
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
        // For native platforms, use Filesystem + Share plugin
        const { Share } = await import('@capacitor/share')
        const { Filesystem, Directory } = await import('@capacitor/filesystem')
        
        try {
          // Extract base64 data from data URL
          const base64Data = qrCodeDataUrl.split(',')[1]
          if (!base64Data) {
            throw new Error('Invalid QR code data URL')
          }
          
          // Create a unique filename
          const fileName = `PRE-GuestPass-${validatedPass.guestName.replace(/\s+/g, '-')}-${Date.now()}.png`
          
          console.log('📝 Writing QR code to filesystem:', fileName)
          
          // Write the file to the cache directory
          const writeResult = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          })
          
          console.log('✅ File written successfully:', writeResult.uri)
          
          // Share using the file URI
          try {
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              url: writeResult.uri,
              dialogTitle: 'Share PRE Group Guest Pass',
            })

            // Clean up the temporary file after sharing
            try {
              await Filesystem.deleteFile({
                path: fileName,
                directory: Directory.Cache,
              })
              console.log('🗑️ Temporary file cleaned up')
            } catch (deleteError) {
              console.warn('⚠️ Could not delete temporary file:', deleteError)
            }

            return {
              success: true,
              message: 'Pass shared successfully!',
            }
          } catch (shareError) {
            console.warn('Share with image failed, falling back to text only:', shareError)
            
            // Clean up the file if sharing failed
            try {
              await Filesystem.deleteFile({
                path: fileName,
                directory: Directory.Cache,
              })
            } catch (deleteError) {
              console.warn('⚠️ Could not delete temporary file:', deleteError)
            }
            
            // Fallback to text only
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              dialogTitle: 'Share PRE Group Guest Pass',
            })

            return {
              success: true,
              message: 'Pass shared successfully (text only)!',
            }
          }
        } catch (filesystemError) {
          console.error('❌ Filesystem error:', filesystemError)
          
          // Final fallback to text only
          try {
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              dialogTitle: 'Share PRE Group Guest Pass',
            })

            return {
              success: true,
              message: 'Pass shared successfully (text only)!',
            }
          } catch (finalError) {
            throw new Error('Failed to share pass: ' + finalError.message)
          }
        }
      } else {
        // For web, download the QR code and show instructions
        try {
          // Download the QR code image
          const link = document.createElement('a')
          link.href = qrCodeDataUrl
          link.download = `PRE-Group-GuestPass-${validatedPass.guestName.replace(/\s+/g, '-')}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          return {
            success: true,
            message: 'PRE Group Guest Pass downloaded. You can now share it via any app.',
          }
        } catch (webError) {
          console.warn('Web sharing failed:', webError)
          return {
            success: true,
            message: 'Pass generated successfully. Please use the share button.',
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sharing pass with image:', error)
      throw new Error('Failed to share pass: ' + (error.message || 'Unknown error'))
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
