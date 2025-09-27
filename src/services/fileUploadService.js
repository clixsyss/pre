import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../boot/firebase'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'

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

        // Create storage reference
        const fullPath = `${path}${fileName}`
        const fileRef = storageRef(storage, fullPath)

        // Upload file
        const snapshot = await uploadBytes(fileRef, file)
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        console.log('✅ File uploaded successfully:', downloadURL)
        return downloadURL
      } catch (error) {
        console.error('❌ Error uploading file:', error)
        errorHandlingService.handleFirestoreError(error, 'uploadFile')
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
