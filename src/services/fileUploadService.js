import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { Capacitor } from '@capacitor/core'
import { Auth } from 'aws-amplify'

// S3 Configuration
const S3_BUCKET = 'pre-app-user-images'
const AWS_REGION = 
  process.env.AWS_REGION || 
  process.env.VITE_AWS_REGION || 
  import.meta.env.AWS_REGION || 
  import.meta.env.VITE_AWS_REGION || 
  'us-east-1'

// Read AWS credentials from environment variables
// Vite exposes variables prefixed with VITE_ via import.meta.env
const AWS_ACCESS_KEY_ID = 
  import.meta.env.VITE_AWS_ACCESS_KEY_ID || 
  import.meta.env.AWS_ACCESS_KEY_ID ||
  process.env.VITE_AWS_ACCESS_KEY_ID || 
  process.env.AWS_ACCESS_KEY_ID

const AWS_SECRET_ACCESS_KEY = 
  import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 
  import.meta.env.AWS_SECRET_ACCESS_KEY ||
  process.env.VITE_AWS_SECRET_ACCESS_KEY || 
  process.env.AWS_SECRET_ACCESS_KEY

// S3 Client instance (singleton)
let s3Client = null

/**
 * Initialize S3 client with credentials
 * @returns {Promise<S3Client>} S3 client instance
 */
async function getS3Client() {
  if (s3Client) {
    return s3Client
  }

  const clientConfig = {
    region: AWS_REGION
  }

  // Detect platform: Web browser vs Native (iOS/Android)
  // Note: Capacitor apps have `window` but are native, so we check Capacitor too
  const isNative = Capacitor.isNativePlatform()
  const isBrowser = typeof window !== 'undefined' && !isNative
  
  console.log('[S3Service] Platform detection:', {
    isBrowser,
    isNative,
    platform: isNative ? Capacitor.getPlatform() : 'web'
  })
  
  if (isBrowser) {
    // Web browser - CORS applies, use environment variables or Cognito Identity Pool
    // Priority 1: Try Cognito Identity Pool (if user is authenticated)
    try {
      const amplifyConfig = Auth.configure()
      const identityPoolId = amplifyConfig?.aws_cognito_identity_pool_id
      
      if (identityPoolId) {
        try {
          // Try to get authenticated user (may fail during sign-up)
          const currentUser = await Auth.currentAuthenticatedUser()
          const idToken = currentUser.signInUserSession.idToken.jwtToken
          
          console.log('[S3Service] Using Cognito Identity Pool for credentials:', identityPoolId)
          
          // Use Cognito Identity Pool credentials
          clientConfig.credentials = fromCognitoIdentityPool({
            client: new CognitoIdentityClient({ region: AWS_REGION }),
            identityPoolId: identityPoolId,
            logins: {
              [`cognito-idp.${AWS_REGION}.amazonaws.com/${amplifyConfig.Auth.userPoolId}`]: idToken
            }
          })
        } catch (authError) {
          console.warn('[S3Service] User not authenticated, cannot use Identity Pool:', authError.message)
          // Fall through to environment variables
          throw authError
        }
      } else {
        throw new Error('No Identity Pool configured')
      }
    } catch {
      // Priority 2: Fallback to environment variables
      console.log('[S3Service] Trying environment variable credentials...')
      console.log('[S3Service] Credential check:', {
        hasAccessKey: !!AWS_ACCESS_KEY_ID,
        hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
        accessKeyLength: AWS_ACCESS_KEY_ID?.length || 0,
        secretKeyLength: AWS_SECRET_ACCESS_KEY?.length || 0
      })
      
      if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
        console.log('[S3Service] ✅ Using environment variable credentials')
        clientConfig.credentials = {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
      } else {
        // Priority 3: Try AWS SDK default credential provider chain
        console.error('[S3Service] ❌ No explicit credentials found!')
        console.error('[S3Service] Environment variable check:', {
          'import.meta.env.VITE_AWS_ACCESS_KEY_ID': !!import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
          'import.meta.env.AWS_ACCESS_KEY_ID': !!import.meta.env.AWS_ACCESS_KEY_ID,
          'import.meta.env.AWS_SECRET_ACCESS_KEY': !!import.meta.env.AWS_SECRET_ACCESS_KEY,
          'process.env.VITE_AWS_ACCESS_KEY_ID': !!process.env.VITE_AWS_ACCESS_KEY_ID,
          'process.env.VITE_AWS_SECRET_ACCESS_KEY': !!process.env.VITE_AWS_SECRET_ACCESS_KEY
        })
        throw new Error('AWS credentials not found. Please set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY in .env file and restart the dev server.')
      }
    }
  } else {
    // Native iOS/Android or Server-side: Use explicit credentials
    // Native apps don't have CORS restrictions, but still need credentials
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      console.log('[S3Service] Using environment variable credentials for native/server')
      clientConfig.credentials = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    } else if (isNative) {
      // For native apps, try Cognito Identity Pool if available
      try {
        const amplifyConfig = Auth.configure()
        const identityPoolId = amplifyConfig?.aws_cognito_identity_pool_id
        
        if (identityPoolId) {
          try {
            const currentUser = await Auth.currentAuthenticatedUser()
            const idToken = currentUser.signInUserSession.idToken.jwtToken
            
            console.log('[S3Service] Native: Using Cognito Identity Pool for credentials')
            clientConfig.credentials = fromCognitoIdentityPool({
              client: new CognitoIdentityClient({ region: AWS_REGION }),
              identityPoolId: identityPoolId,
              logins: {
                [`cognito-idp.${AWS_REGION}.amazonaws.com/${amplifyConfig.Auth.userPoolId}`]: idToken
              }
            })
          } catch {
            console.warn('[S3Service] Native: User not authenticated, credentials needed')
            throw new Error('AWS credentials required for native app. Set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY or configure Cognito Identity Pool.')
          }
        } else {
          throw new Error('AWS credentials required. Set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY in .env')
        }
      } catch (error) {
        console.error('[S3Service] Native: Failed to get credentials:', error)
        throw error
      }
    } else {
      // Server-side: Rely on AWS SDK default credential provider chain
      console.log('[S3Service] Server-side: Using AWS SDK default credential provider chain')
    }
  }

  s3Client = new S3Client(clientConfig)
  
  // Debug: Log credential availability (without exposing secrets)
  console.log('[S3Service] Environment check:', {
    hasAccessKey: !!AWS_ACCESS_KEY_ID,
    hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    bucket: S3_BUCKET
  })
  
  console.log('[S3Service] ✅ S3 client initialized', {
    region: AWS_REGION,
    bucket: S3_BUCKET,
    isBrowser,
    hasCredentials: !!(clientConfig.credentials),
    credentialSource: clientConfig.credentials ? 'configured' : 'default-provider-chain'
  })

  return s3Client
}

/**
 * Generate S3 URL for an object
 * @param {string} key - S3 object key
 * @returns {string} Public URL
 */
function getS3Url(key) {
  // Use virtual-hosted-style URL
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
}

class FileUploadService {
  /**
   * Upload a file to AWS S3
   * @param {File} file - The file to upload
   * @param {string} path - The S3 key path (e.g., 'users/userId/')
   * @param {string} fileName - The file name
   * @returns {Promise<string>} - The download URL
   */
  async uploadFile(file, path, fileName) {
    try {
      console.log('🚀 Uploading file to S3:', { path, fileName, fileSize: file?.size })
        
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

      // Get file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Construct S3 key (path + fileName)
      const s3Key = `${path}${fileName}`.replace(/\/+/g, '/') // Remove duplicate slashes
      
      console.log('📤 Uploading to S3:', {
        bucket: S3_BUCKET,
        key: s3Key,
        contentType: file.type,
        size: file.size
      })

      // Get S3 client (async - may need to fetch credentials)
      const client = await getS3Client()

      // Prepare PutObject command
      const putCommand = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: uint8Array,
        ContentType: file.type,
        // Make object publicly readable (adjust ACL based on your bucket policy)
        // ACL: 'public-read' // Uncomment if bucket allows public ACLs
      })

      // Upload to S3
      await client.send(putCommand)
      
      console.log('✅ File uploaded successfully to S3')

      // Generate and return public URL
      const downloadUrl = getS3Url(s3Key)
      console.log('📥 Download URL:', downloadUrl)
      
      return downloadUrl
    } catch (error) {
      console.error('❌ Error uploading file to S3:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error constructor:', error?.constructor?.name)
      console.error('❌ Error message:', error?.message)
      console.error('❌ Error code:', error?.code)
      console.error('❌ Error stack:', error?.stack)
      console.error('❌ Full error object:', JSON.stringify({
        code: error?.code,
        errorMessage: error?.message,
        name: error?.name
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
   * Delete a file from S3
   * @param {string} s3Key - The S3 key of the file to delete
   */
  async deleteFile(s3Key) {
    try {
      const client = await getS3Client()
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key
      })
      
      await client.send(deleteCommand)
      console.log('✅ File deleted successfully from S3:', s3Key)
    } catch (error) {
      console.error('❌ Error deleting file from S3:', error)
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
   * Upload user documents (National ID and Profile Picture) to S3
   * @param {string} userId - User ID
   * @param {File} frontIdFile - Front National ID file
   * @param {File} backIdFile - Back National ID file
   * @param {File} profilePictureFile - Profile picture file (optional)
   * @returns {Promise<Object>} - Object with download URLs
   */
  async uploadUserDocuments(userId, frontIdFile, backIdFile, profilePictureFile = null) {
    try {
      console.log('[FileUpload] Starting S3 upload for user:', userId)
      const uploads = []
      
      // Upload front ID - store as national-id-front.jpg
      if (frontIdFile) {
        const extension = frontIdFile.name.split('.').pop() || 'jpg'
        const frontIdName = `national-id-front.${extension}`
        console.log('[FileUpload] Adding front ID:', frontIdName)
        uploads.push({
          file: frontIdFile,
          path: `users/${userId}/`,
          fileName: frontIdName,
          type: 'frontId'
        })
      }

      // Upload back ID - store as national-id-back.jpg
      if (backIdFile) {
        const extension = backIdFile.name.split('.').pop() || 'jpg'
        const backIdName = `national-id-back.${extension}`
        console.log('[FileUpload] Adding back ID:', backIdName)
        uploads.push({
          file: backIdFile,
          path: `users/${userId}/`,
          fileName: backIdName,
          type: 'backId'
        })
      }

      // Upload profile picture - store as profile-picture.jpg
      if (profilePictureFile) {
        const extension = profilePictureFile.name.split('.').pop() || 'jpg'
        const profileName = `profile-picture.${extension}`
        console.log('[FileUpload] Adding profile picture:', profileName)
        uploads.push({
          file: profilePictureFile,
          path: `users/${userId}/`,
          fileName: profileName,
          type: 'profilePicture'
        })
      }

      console.log('[FileUpload] Uploading', uploads.length, 'files to S3...')
      
      // Upload all files
      const downloadURLs = await this.uploadMultipleFiles(uploads)
      console.log('[FileUpload] All files uploaded to S3, URLs received')

      // Map URLs to their types
      const result = {}
      uploads.forEach((upload, index) => {
        result[upload.type] = downloadURLs[index]
        console.log('[FileUpload]', upload.type, '→', downloadURLs[index])
      })

      console.log('[FileUpload] ✅ S3 upload complete')
      return result
    } catch (error) {
      console.error('[FileUpload] ❌ S3 upload failed:', error)
      console.error('[FileUpload] Error code:', error?.code)
      console.error('[FileUpload] Error message:', error?.message)
      throw error
    }
  }

  /**
   * Upload face verification photos (front, left, right) to S3
   * @param {string} userId - User ID
   * @param {Array} photos - Array of photo objects with {type: 'front'|'left'|'right', data: base64DataUrl}
   * @returns {Promise<Object>} - Object with download URLs for each photo type
   */
  async uploadFaceVerificationPhotos(userId, photos) {
    try {
      console.log('[FileUpload] Starting face verification photos upload for user:', userId)
      
      if (!photos || photos.length === 0) {
        console.warn('[FileUpload] No photos provided for face verification')
        return {}
      }

      const uploads = []
      
      // Convert base64 data URLs to Files and prepare uploads
      for (const photo of photos) {
        if (!photo.data || !photo.type) {
          console.warn('[FileUpload] Skipping invalid photo:', photo)
          continue
        }

        try {
          // Convert base64 data URL to File
          const file = await this.dataURLtoFile(photo.data, `face-${photo.type}.jpg`)
          
          const fileName = `face-verification-${photo.type}.jpg`
          console.log('[FileUpload] Adding face photo:', fileName, 'Type:', photo.type)
          
          uploads.push({
            file: file,
            path: `users/${userId}/images/face-verification/`,
            fileName: fileName,
            type: `face${photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}` // faceFront, faceLeft, faceRight
          })
        } catch (convertError) {
          console.error(`[FileUpload] Error converting photo ${photo.type}:`, convertError)
          // Continue with other photos
        }
      }

      if (uploads.length === 0) {
        console.warn('[FileUpload] No valid photos to upload')
        return {}
      }

      console.log('[FileUpload] Uploading', uploads.length, 'face verification photos to S3...')
      
      // Upload all files
      const downloadURLs = await this.uploadMultipleFiles(uploads)
      console.log('[FileUpload] All face photos uploaded to S3, URLs received')

      // Map URLs to their types
      const result = {}
      uploads.forEach((upload, index) => {
        // Map to both camelCase and URL format for compatibility
        const url = downloadURLs[index]
        result[upload.type] = url // faceFront, faceLeft, faceRight
        // Also map to URL format for DynamoDB
        if (upload.type === 'faceFront') result.faceFrontUrl = url
        if (upload.type === 'faceLeft') result.faceLeftUrl = url
        if (upload.type === 'faceRight') result.faceRightUrl = url
        console.log('[FileUpload]', upload.type, '→', url)
      })

      console.log('[FileUpload] ✅ Face verification photos upload complete')
      return result
    } catch (error) {
      console.error('[FileUpload] ❌ Face verification photos upload failed:', error)
      console.error('[FileUpload] Error code:', error?.code)
      console.error('[FileUpload] Error message:', error?.message)
      throw error
    }
  }

  /**
   * Convert base64 data URL to File object with optional quality optimization
   * @param {string} dataUrl - Base64 data URL (e.g., "data:image/jpeg;base64,...")
   * @param {string} filename - Desired filename
   * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB, will compress if larger)
   * @returns {Promise<File>} File object
   */
  async dataURLtoFile(dataUrl, filename, maxSizeMB = 5) {
    try {
      // Extract base64 data and mime type
      const arr = dataUrl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      if (!mimeMatch) {
        throw new Error('Invalid data URL format')
      }
      const mime = mimeMatch[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      
      // Create initial file
      let file = new File([u8arr], filename, { type: mime })
      
      // Check file size and compress if needed (but maintain quality for face verification)
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes && mime.startsWith('image/')) {
        console.log(`[FileUpload] File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds max (${maxSizeMB}MB), compressing...`)
        
        // Use canvas to compress while maintaining quality
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Maintain aspect ratio
            const maxDimension = 1920
            let width = img.width
            let height = img.height
            
            if (width > maxDimension || height > maxDimension) {
              const ratio = Math.min(maxDimension / width, maxDimension / height)
              width = width * ratio
              height = height * ratio
            }
            
            canvas.width = width
            canvas.height = height
            
            // Use high quality settings
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(img, 0, 0, width, height)
            
            // Convert to blob with high quality (0.92 for face verification)
            canvas.toBlob((blob) => {
              if (blob) {
                file = new File([blob], filename, { type: mime })
                console.log(`[FileUpload] Compressed to ${(file.size / 1024 / 1024).toFixed(2)}MB`)
                resolve()
              } else {
                reject(new Error('Failed to compress image'))
              }
            }, mime, 0.92) // High quality for face verification
          }
          img.onerror = reject
          img.src = dataUrl
        })
      }
      
      return file
    } catch (error) {
      console.error('[FileUpload] Error converting data URL to file:', error)
      throw new Error('Failed to convert image data: ' + error.message)
    }
  }
}

export default new FileUploadService()
