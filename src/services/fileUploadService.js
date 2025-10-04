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

        // Check if we're on iOS and use Capacitor Firebase Storage
        const isIOS = Capacitor.getPlatform() === 'ios'
        const isNative = Capacitor.isNativePlatform()
        
        if (isIOS && isNative) {
          console.log('📱 iOS detected, using Web SDK for better compatibility...')
          
          // Check authentication status
          const { getAuth } = await import('firebase/auth')
          const auth = getAuth()
          const user = auth.currentUser
          console.log('📱 iOS: Auth status:', {
            isAuthenticated: !!user,
            uid: user?.uid,
            email: user?.email
          })
          
          // Ensure user is authenticated before proceeding
          if (!user) {
            console.log('📱 iOS: User not authenticated, waiting for auth state...')
            
            // Wait for authentication with a timeout
            const authPromise = new Promise((resolve, reject) => {
              const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe()
                if (user) {
                  console.log('📱 iOS: User authenticated after wait:', user.uid)
                  resolve(user)
                } else {
                  reject(new Error('User authentication failed'))
                }
              })
            })
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Authentication timeout')), 5000)
            })
            
            await Promise.race([authPromise, timeoutPromise])
          }
          
          // Use Web SDK directly for iOS (more reliable than Capacitor plugin)
          console.log('📱 iOS: Using Web SDK for upload...')
          
          // Create storage reference
          const fullPath = `${path}${fileName}`
          console.log('📱 iOS: Creating storage reference:', { fullPath, path, fileName })
          
          const fileRef = storageRef(storage, fullPath)
          console.log('📱 iOS: Storage reference created:', { fileRef: !!fileRef, refPath: fileRef?.fullPath })

          // Upload file using Web SDK
          console.log('📱 iOS: Starting uploadBytes...')
          const snapshot = await uploadBytes(fileRef, file)
          console.log('📱 iOS: Upload completed, getting download URL...')
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref)
          console.log('📱 iOS: Download URL obtained:', downloadURL)
          
          return downloadURL
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
      const uploads = []
      
      // Upload front ID
      if (frontIdFile) {
        const frontIdName = this.generateUniqueFileName(frontIdFile.name, userId)
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
        uploads.push({
          file: profilePictureFile,
          path: `users/${userId}/profile/`,
          fileName: profileName,
          type: 'profilePicture'
        })
      }

      // Upload all files
      const downloadURLs = await this.uploadMultipleFiles(uploads)

      // Map URLs to their types
      const result = {}
      uploads.forEach((upload, index) => {
        result[upload.type] = downloadURLs[index]
      })

      return result
    } catch (error) {
      console.error('Error uploading user documents:', error)
      throw error
    }
  }
}

export default new FileUploadService()
