import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../boot/firebase'
import performanceService from './performanceService'
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
    return performanceService.timeOperation('uploadFile', async () => {
      try {
        console.log('🚀 Uploading file:', { path, fileName, fileSize: file?.size })
        console.log('🔍 Firebase Storage check:', {
          storage: !!storage,
          storageApp: storage?.app,
          storageBucket: storage?.bucket,
          isNative: typeof window === 'undefined' || window.Capacitor
        })
        
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

        // Check if we're on iOS
        const isIOS = Capacitor.getPlatform() === 'ios'
        const isNative = Capacitor.isNativePlatform()
        
        if (isIOS && isNative) {
          console.log('📱 iOS detected, using Capacitor Filesystem + Storage...')
          
          // Step 1: Save file to temp location using Capacitor Filesystem
          const { Filesystem, Directory } = await import('@capacitor/filesystem')
          
          // Convert blob to base64
          const reader = new FileReader()
          const base64Data = await new Promise((resolve) => {
            reader.onloadend = () => {
              const base64 = reader.result.split(',')[1]
              resolve(base64)
            }
            reader.readAsDataURL(file)
          })
          
          console.log('📱 iOS: File converted to base64')
          
          // Write to temp file
          const tempFileName = `temp_${Date.now()}_${fileName}`
          const writeResult = await Filesystem.writeFile({
            path: tempFileName,
            data: base64Data,
            directory: Directory.Cache
          })
          
          console.log('📱 iOS: Temp file created:', writeResult.uri)
          
          // Step 2: Upload using Capacitor Firebase Storage with URI
          const { FirebaseStorage } = await import('@capacitor-firebase/storage')
          
          const fullPath = `${path}${fileName}`
          console.log('📱 iOS: Uploading via Capacitor plugin:', fullPath)
          
          // Upload with progress tracking
          console.log('📱 iOS: Starting upload...')
          await FirebaseStorage.uploadFile({
            path: fullPath,
            uri: writeResult.uri
          })
          
          console.log('📱 iOS: Upload initiated, waiting for completion...')
          
          // Wait longer for file to be fully uploaded and indexed
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          console.log('📱 iOS: Getting download URL with retry...')
          
          // Retry getting download URL (sometimes takes time to index)
          let urlResult
          let retries = 3
          for (let i = 0; i < retries; i++) {
            try {
              urlResult = await FirebaseStorage.getDownloadUrl({
                path: fullPath
              })
              console.log('📱 iOS: Download URL obtained:', urlResult.downloadUrl)
              break
            } catch (e) {
              console.warn(`📱 iOS: URL attempt ${i + 1} failed, retrying...`)
              if (i === retries - 1) throw e
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }
          
          // Clean up temp file
          try {
            await Filesystem.deleteFile({
              path: tempFileName,
              directory: Directory.Cache
            })
            console.log('📱 iOS: Temp file cleaned up')
          } catch (e) {
            console.warn('📱 iOS: Failed to clean up temp file:', e)
          }
          
          return urlResult.downloadUrl
        } else {
          // Use Web SDK for web and other platforms
          console.log('🌐 Using Firebase Web SDK for upload...')
          
          // Create storage reference
          const fullPath = `${path}${fileName}`
          console.log('🔍 Creating storage reference:', { fullPath, path, fileName })
          
          const fileRef = storageRef(storage, fullPath)
          console.log('🔍 Storage reference created:', { fileRef: !!fileRef, refPath: fileRef?.fullPath })

          // Upload file
          console.log('🔍 Starting uploadBytes...')
          const snapshot = await uploadBytes(fileRef, file)
          console.log('🔍 Upload completed, getting download URL...')
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref)
          console.log('🔍 Download URL obtained:', downloadURL)
          
          return downloadURL
        }
      } catch (error) {
        console.error('❌ Error uploading file:', error)
        console.error('❌ Error type:', typeof error)
        console.error('❌ Error constructor:', error?.constructor?.name)
        console.error('❌ Error message:', error?.message)
        console.error('❌ Error code:', error?.code)
        console.error('❌ Error stack:', error?.stack)
        console.error('❌ Full error object:', JSON.stringify(error, null, 2))
        console.error('❌ Error keys:', Object.keys(error || {}))
        
        // Temporarily bypass errorHandlingService to see raw error
        // errorHandlingService.handleFirestoreError(error, 'uploadFile')
        throw error
      }
    })
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
