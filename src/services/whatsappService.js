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
    qrCodeUrl: typeof pass.qrCodeUrl === 'string' ? pass.qrCodeUrl.trim() : '',
    qrImageDataUrl: typeof pass.qrImageDataUrl === 'string' ? pass.qrImageDataUrl.trim() : '',
  }
}

/**
 * Sharing Service
 * Handles sharing gate passes with QR codes using native share functionality
 */
class SharingService {
  async fetchImageBlob(imageUrlOrDataUrl) {
    if (!imageUrlOrDataUrl) {
      throw new Error('No QR image available to share')
    }
    const response = await fetch(imageUrlOrDataUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch QR image: ${response.status}`)
    }
    return response.blob()
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result !== 'string') {
          reject(new Error('Failed to convert image to base64'))
          return
        }
        resolve(result.split(',')[1] || result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async tryShareNativeImageFile({ Filesystem, Share, base64Data, fileName, message, validatedPass }) {
    const directories = ['CACHE', 'DOCUMENTS']
    for (const directory of directories) {
      try {
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory,
          recursive: true,
        })

        // Some platforms return non-file URIs from writeFile; resolve to file:// URI explicitly.
        const uriResult = await Filesystem.getUri({
          path: fileName,
          directory,
        })

        const candidateUris = [uriResult?.uri, writeResult?.uri].filter(Boolean)

        for (const uri of candidateUris) {
          try {
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              files: [uri],
              dialogTitle: 'Share PRE Group Guest Pass',
            })
            return true
          } catch (shareUriError) {
            console.warn(`⚠️ Share files failed for URI ${uri}:`, shareUriError)
          }
        }
      } catch (fileWriteError) {
        console.warn(`⚠️ Failed writing share file in ${directory}:`, fileWriteError)
      }
    }
    return false
  }


  /**
   * Create guest pass message for QR image sharing.
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
Please present the attached QR image at the main gate for entry. The security team will scan it for verification.

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
   * Get shareable QR image URL for pass.
   * Falls back to pass URL for very old passes that lack image.
   * @param {Object} pass
   * @returns {string}
   */
  getPassShareImageUrl(pass) {
    const dataUrl = typeof pass?.qrImageDataUrl === 'string' ? pass.qrImageDataUrl.trim() : ''
    if (dataUrl) return dataUrl
    const imageUrl = typeof pass?.qrCodeUrl === 'string' ? pass.qrCodeUrl.trim() : ''
    if (imageUrl) return imageUrl
    return this.generatePassUrl(pass)
  }






  /**
   * Share pass as QR image URL (static image).
   * @param {Object} pass - Gate pass object
   * @returns {Promise<Object>} - Success status
   */
  async sharePassWithImage(pass) {
    try {
      // Validate inputs
      const validatedPass = validatePass(pass)

      // Create message with image share
      const message = this.createGatePassMessage(validatedPass)
      const passImageUrl = this.getPassShareImageUrl(validatedPass)

      console.log('🖼️ Sharing pass with image URL:', passImageUrl)

      // Enhanced iOS/Android detection
      const protocol = window.location.protocol
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined
      const isNative = protocol === 'capacitor:' || hasIOSBridge || Capacitor.getPlatform() === 'android'
      
      console.log('📱 Platform detection:', { protocol, isNative, platform: Capacitor.getPlatform() })

      if (isNative) {
        // For native platforms, use Share plugin from Capacitor.Plugins
        console.log('📱 Accessing Share from Capacitor.Plugins...')
        const Share = window.Capacitor?.Plugins?.Share
        const Filesystem = window.Capacitor?.Plugins?.Filesystem
        
        if (!Share) {
          console.error('❌ Share not found in Capacitor.Plugins')
          throw new Error('Share plugin not available')
        }
        
        try {
          const imageBlob = await this.fetchImageBlob(passImageUrl)
          let sharedAsFile = false

          if (Filesystem?.writeFile && Filesystem?.getUri) {
            try {
              const base64Data = await this.blobToBase64(imageBlob)
              const fileName = `guest-pass-${validatedPass.id || Date.now()}.png`
              sharedAsFile = await this.tryShareNativeImageFile({
                Filesystem,
                Share,
                base64Data,
                fileName,
                message,
                validatedPass,
              })
            } catch (fileShareError) {
              console.warn('⚠️ File share failed, falling back to URL share:', fileShareError)
            }
          }

          if (!sharedAsFile) {
          console.log('📤 Opening native share dialog...')
            await Share.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              url: passImageUrl,
              dialogTitle: 'Share PRE Group Guest Pass',
            })
          }
          console.log('✅ Share dialog completed')

            return {
              success: true,
              message: 'Guest pass image shared successfully!',
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
        // For web, share actual image file when supported
        try {
          const imageBlob = await this.fetchImageBlob(passImageUrl)
          const imageFile = new File(
            [imageBlob],
            `guest-pass-${validatedPass.id || Date.now()}.png`,
            { type: imageBlob.type || 'image/png' }
          )

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              files: [imageFile],
            })
          } else if (navigator.share) {
            await navigator.share({
              title: `PRE Group - Guest Pass for ${validatedPass.guestName}`,
              text: message,
              url: passImageUrl,
            })
          } else {
            throw new Error('Image sharing is not supported on this browser')
          }

          return {
            success: true,
            message: 'Guest pass image shared successfully!',
          }
        } catch (webShareError) {
          console.warn('Web share failed:', webShareError)
          throw new Error('Image sharing is not supported on this browser/device')
        }
      }
    } catch (error) {
      console.error('❌ Error sharing pass:', error)
      throw new Error('Failed to share pass: ' + (error.message || 'Unknown error'))
    }
  }

  /**
   * Backward-compatible alias for existing callers.
   */
  async sharePassWithLink(pass) {
    return this.sharePassWithImage(pass)
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
