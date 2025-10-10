import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../boot/firebase'
import { Capacitor } from '@capacitor/core'

class FileUploadService {
  /**
   * Upload a file to Firebase Storage
   * @param {File} file - The file to upload
   * @param {string} path - The storage path (e.g., 'users/userId/documents/')
   * @param {string} fileName - The file name
   * @returns {Promise<string>} - The download URL
   */
  async uploadFile(file, path, fileName) {
    try {
      console.log('🚀 Uploading file:', { path, fileName, fileSize: file?.size })
        
        // Validate file
        if (!file) {
          throw new Error('No file provided')
        }

        // Validate file type (images only)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Only JPEG, PNG, and WebP images are allowed')
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          throw new Error('File size must be less than 10MB')
        }

        const isNative = Capacitor.isNativePlatform()
        const platform = Capacitor.getPlatform()
        
        if (isNative && (platform === 'ios' || platform === 'android')) {
          console.log(`📱 ${platform} detected, using Storage REST API...`)
          
          // Convert file to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          
          // Convert to base64 for upload
          let binary = ''
          const len = uint8Array.byteLength
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i])
          }
          const base64 = btoa(binary)
          
          console.log(`📱 ${platform}: File converted to base64`)
          
          // Get auth token
          const { Http } = await import('@capacitor-community/http')
          const fullPath = `${path}${fileName}`
          const bucket = 'pre-group.firebasestorage.app'
          
          // Upload using Storage REST API
          console.log(`📱 ${platform}: Uploading via REST API to:`, fullPath)
          const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(fullPath)}`
          
          const uploadResponse = await Http.request({
            url: uploadUrl,
            method: 'POST',
            headers: {
              'Content-Type': file.type
            },
            data: base64,
            connectTimeout: 60000,
            readTimeout: 60000
          })
          
          console.log(`📱 ${platform}: Upload response:`, uploadResponse.status)
          
          if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
            console.log(`📱 ${platform}: ✅ File uploaded successfully`)
            
            // Get download URL
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}?alt=media`
            console.log(`📱 ${platform}: Download URL:`, downloadUrl)
            
            return downloadUrl
          } else {
            throw new Error(`Upload failed with status ${uploadResponse.status}`)
          }
        } else {
          // Use Web SDK for web platform
          console.log('🌐 Using Firebase Web SDK for upload (web)...')
          
          const fullPath = `${path}${fileName}`
          const fileRef = storageRef(storage, fullPath)
          
          const snapshot = await uploadBytes(fileRef, file)
          const downloadURL = await getDownloadURL(snapshot.ref)
          
          return downloadURL
        }
      } catch (error) {
        console.error('❌ Error uploading file:', error)
        console.error('❌ Error type:', typeof error)
        console.error('❌ Error constructor:', error?.constructor?.name)
        console.error('❌ Error message:', error?.message)
        console.error('❌ Error code:', error?.code)
        console.error('❌ Error stack:', error?.stack)
        console.error('❌ Full error object:', JSON.stringify({
          code: error?.code,
          errorMessage: error?.message
        }))
        console.error('❌ Error keys:', Object.keys(error || {}))
        
        throw error
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of {file, path, fileName} objects
   * @returns {Promise<Array>} - Array of download URLs
   */
  async uploadMultipleFiles(files) {
    try {
      const uploadPromises = files.map(({ file, path, fileName }) => 
        this.uploadFile(file, path, fileName)
      )
      
      const downloadURLs = await Promise.all(uploadPromises)
      return downloadURLs
    } catch (error) {
      console.error('Error uploading multiple files:', error)
      throw error
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param {string} filePath - The storage path of the file to delete
   */
  async deleteFile(filePath) {
    try {
      const fileRef = storageRef(storage, filePath)
      await deleteObject(fileRef)
      console.log('File deleted successfully:', filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Generate a unique file name with timestamp
   * @param {string} originalName - Original file name
   * @param {string} userId - User ID for uniqueness
   * @returns {string} - Unique file name
   */
  generateUniqueFileName(originalName, userId) {
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    const baseName = originalName.replace(/\.[^/.]+$/, '')
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_')
    
    return `${userId}_${sanitizedBaseName}_${timestamp}.${extension}`
  }

  /**
   * Upload user documents (National ID and Profile Picture)
   * @param {string} userId - User ID
   * @param {File} frontIdFile - Front National ID file
   * @param {File} backIdFile - Back National ID file
   * @param {File} profilePictureFile - Profile picture file (optional)
   * @returns {Promise<Object>} - Object with download URLs
   */
  async uploadUserDocuments(userId, frontIdFile, backIdFile, profilePictureFile = null) {
    try {
      console.log('[FileUpload] Starting upload for user:', userId)
      const uploads = []
      
      // Upload front ID
      if (frontIdFile) {
        const frontIdName = this.generateUniqueFileName(frontIdFile.name, userId)
        console.log('[FileUpload] Adding front ID:', frontIdName)
        uploads.push({
          file: frontIdFile,
          path: `users/${userId}/documents/`,
          fileName: frontIdName,
          type: 'frontId'
        })
      }

      // Upload back ID
      if (backIdFile) {
        const backIdName = this.generateUniqueFileName(backIdFile.name, userId)
        console.log('[FileUpload] Adding back ID:', backIdName)
        uploads.push({
          file: backIdFile,
          path: `users/${userId}/documents/`,
          fileName: backIdName,
          type: 'backId'
        })
      }

      // Upload profile picture
      if (profilePictureFile) {
        const profileName = this.generateUniqueFileName(profilePictureFile.name, userId)
        console.log('[FileUpload] Adding profile picture:', profileName)
        uploads.push({
          file: profilePictureFile,
          path: `users/${userId}/profile/`,
          fileName: profileName,
          type: 'profilePicture'
        })
      }

      console.log('[FileUpload] Uploading', uploads.length, 'files...')
      
      // Upload all files
      const downloadURLs = await this.uploadMultipleFiles(uploads)
      console.log('[FileUpload] All files uploaded, URLs received')

      // Map URLs to their types
      const result = {}
      uploads.forEach((upload, index) => {
        result[upload.type] = downloadURLs[index]
        console.log('[FileUpload]', upload.type, '→', downloadURLs[index])
      })

      console.log('[FileUpload] ✅ Upload complete')
      return result
    } catch (error) {
      console.error('[FileUpload] ❌ Upload failed:', error)
      console.error('[FileUpload] Error code:', error?.code)
      console.error('[FileUpload] Error message:', error?.message)
      throw error
    }
  }
}

export default new FileUploadService()
