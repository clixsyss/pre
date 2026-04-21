import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { Capacitor } from '@capacitor/core'
import { Auth } from 'aws-amplify'

// S3 Configuration
const S3_BUCKET = 'pre-app-user-images'
const processEnv = typeof process !== 'undefined' ? process.env || {} : {}
const AWS_REGION =
  processEnv.AWS_REGION ||
  processEnv.VITE_AWS_REGION ||
  import.meta.env.AWS_REGION ||
  import.meta.env.VITE_AWS_REGION ||
  'us-east-1'

// Read AWS credentials from environment variables
// Vite exposes variables prefixed with VITE_ via import.meta.env
const AWS_ACCESS_KEY_ID = 
  import.meta.env.VITE_AWS_ACCESS_KEY_ID || 
  import.meta.env.AWS_ACCESS_KEY_ID ||
  processEnv.VITE_AWS_ACCESS_KEY_ID || 
  processEnv.AWS_ACCESS_KEY_ID

const AWS_SECRET_ACCESS_KEY = 
  import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 
  import.meta.env.AWS_SECRET_ACCESS_KEY ||
  processEnv.VITE_AWS_SECRET_ACCESS_KEY || 
  processEnv.AWS_SECRET_ACCESS_KEY

// S3 Client instance (singleton)
let s3Client = null

const IMAGE_OPTIMIZATION = {
  maxDimension: 1600,
  jpegQuality: 0.82,
  minBytesToOptimize: 450 * 1024,
}

function supportsCanvasOptimization() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function optimizeImageForUpload(file) {
  if (!file?.type?.startsWith('image/')) {
    return file
  }

  if (!supportsCanvasOptimization() || file.size < IMAGE_OPTIMIZATION.minBytesToOptimize) {
    return file
  }

  // Keep PNGs with transparency and modern formats untouched unless very large.
  // Converting everything to JPEG can break transparency-sensitive uploads.
  const shouldKeepOriginalFormat =
    file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
  if (shouldKeepOriginalFormat && file.size < 1.2 * 1024 * 1024) {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const longestSide = Math.max(width, height)
    const scale = longestSide > IMAGE_OPTIMIZATION.maxDimension
      ? IMAGE_OPTIMIZATION.maxDimension / longestSide
      : 1

    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()

    const outputType = shouldKeepOriginalFormat ? file.type : 'image/jpeg'
    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        outputType,
        outputType === 'image/jpeg' ? IMAGE_OPTIMIZATION.jpegQuality : undefined
      )
    })

    if (!blob || blob.size >= file.size) {
      return file
    }

    const optimizedExtension = outputType === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'img')
    const optimizedName = outputType === 'image/jpeg'
      ? file.name.replace(/\.[^/.]+$/, '') + `.${optimizedExtension}`
      : file.name

    console.log('[S3Service] Optimized image before upload:', {
      originalBytes: file.size,
      optimizedBytes: blob.size,
      savingsPercent: Math.round((1 - blob.size / file.size) * 100),
      originalType: file.type,
      optimizedType: outputType,
    })

    return new File([blob], optimizedName, {
      type: outputType,
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('[S3Service] Image optimization skipped, using original file:', error?.message || error)
    return file
  }
}

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
          'process.env.VITE_AWS_ACCESS_KEY_ID': !!processEnv.VITE_AWS_ACCESS_KEY_ID,
          'process.env.VITE_AWS_SECRET_ACCESS_KEY': !!processEnv.VITE_AWS_SECRET_ACCESS_KEY
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
  async uploadFile(file, path, fileName, options = {}) {
    try {
      const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null
      console.log('🚀 Uploading file to S3:', { path, fileName, fileSize: file?.size })
        
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Validate file type (any image type + PDF for IDs/deed)
      const ext = (file.name && file.name.split('.').pop() || '').toLowerCase()
      const extToMime = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp',
        tif: 'image/tiff',
        tiff: 'image/tiff',
        avif: 'image/avif',
        jxl: 'image/jxl',
        heic: 'image/heic',
        heif: 'image/heif',
        pdf: 'application/pdf',
      }
      let contentType = (file.type || '').toLowerCase()
      if (!contentType || contentType === 'application/octet-stream') {
        contentType = extToMime[ext] || ''
        if (!contentType && ext && ext !== 'pdf') {
          contentType = `image/${ext}`
        }
      }
      const isImage = contentType.startsWith('image/')
      const isPdf = contentType === 'application/pdf'
      if (!isImage && !isPdf) {
        throw new Error('Only image files or PDF documents are allowed')
      }

      if (onProgress) {
        onProgress({ stage: 'optimizing', progress: 5 })
      }

      // Resize/compress large images to reduce network time dramatically on mobile.
      const uploadFile = await optimizeImageForUpload(file)
      // Capacitor iOS can fail when AWS SDK receives Blob/File directly ("getReader is not a function").
      // Use Uint8Array payload for broad compatibility.
      const uploadBytes = new Uint8Array(await uploadFile.arrayBuffer())

      // Construct S3 key (path + fileName)
      const s3Key = `${path}${fileName}`.replace(/\/+/g, '/') // Remove duplicate slashes
      
      console.log('📤 Uploading to S3:', {
        bucket: S3_BUCKET,
        key: s3Key,
        contentType: uploadFile.type || contentType,
        size: uploadFile.size
      })

      // Get S3 client (async - may need to fetch credentials)
      const client = await getS3Client()

      // Prepare PutObject command
      const putCommand = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: uploadBytes,
        ContentType: uploadFile.type || contentType,
        // Make object publicly readable (adjust ACL based on your bucket policy)
        // ACL: 'public-read' // Uncomment if bucket allows public ACLs
      })

      // Upload to S3
      if (onProgress) {
        onProgress({ stage: 'uploading', progress: 20 })
      }
      await client.send(putCommand)
      if (onProgress) {
        onProgress({ stage: 'uploaded', progress: 100 })
      }
      
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
  async uploadMultipleFiles(files, options = {}) {
    try {
      const onFileProgress = typeof options.onFileProgress === 'function' ? options.onFileProgress : null
      const onOverallProgress = typeof options.onOverallProgress === 'function' ? options.onOverallProgress : null

      // Dynamic concurrency: keep weak networks safe while speeding up typical 4-file registration.
      const effectiveType = typeof navigator !== 'undefined' ? navigator?.connection?.effectiveType : null
      const CONCURRENCY = effectiveType === '2g' || effectiveType === 'slow-2g' ? 1 : (effectiveType === '3g' ? 2 : 3)
      const results = []
      const normalizedProgress = files.map(() => 0)
      const totalFiles = files.length || 1

      const emitOverallProgress = () => {
        if (!onOverallProgress) return
        const sum = normalizedProgress.reduce((acc, value) => acc + value, 0)
        const progress = Math.min(100, Math.round((sum / totalFiles) * 100))
        onOverallProgress({ progress })
      }

      emitOverallProgress()

      for (let i = 0; i < files.length; i += CONCURRENCY) {
        const batch = files.slice(i, i + CONCURRENCY)
        const batchURLs = await Promise.all(
          batch.map(async ({ file, path, fileName, type }, batchIndex) => {
            const fileIndex = i + batchIndex
            const url = await this.uploadFile(file, path, fileName, {
              onProgress: ({ stage, progress }) => {
                const normalized = Math.max(0, Math.min(100, Math.round(progress || 0))) / 100
                normalizedProgress[fileIndex] = normalized
                if (onFileProgress) {
                  onFileProgress({
                    index: fileIndex,
                    type,
                    fileName,
                    stage,
                    progress: Math.round(normalized * 100),
                  })
                }
                emitOverallProgress()
              }
            })
            normalizedProgress[fileIndex] = 1
            emitOverallProgress()
            return url
          })
        )
        results.push(...batchURLs)
      }
      return results
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
   * Upload a face image for the face-sync system.
   * Path: projects/{projectId}/users/{userId}/faces/{faceId}.jpg
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} faceId - Unique face ID (e.g. UUID)
   * @param {File} file - Image file
   * @returns {Promise<string>} - Public imageUrl
   */
  async uploadFaceImage(projectId, userId, faceId, file) {
    const path = `projects/${projectId}/users/${userId}/faces/`
    const ext = (file.name && file.name.split('.').pop()) || 'jpg'
    const fileName = `${faceId}.${ext}`
    return this.uploadFile(file, path, fileName)
  }

  /**
   * Upload user documents (National ID, Profile Picture, Property Contract) to S3
   * @param {string} userId - User ID
   * @param {File} frontIdFile - Front National ID file
   * @param {File} backIdFile - Back National ID file
   * @param {File} profilePictureFile - Profile picture file (optional)
   * @param {File} propertyContractFile - Property contract/deed file (optional)
   * @returns {Promise<Object>} - Object with download URLs
   */
  async uploadUserDocuments(
    userId,
    frontIdFile,
    backIdFile,
    profilePictureFile = null,
    propertyContractFile = null,
    options = {}
  ) {
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

      // Upload property contract/deed - supports single file or array of files
      const propertyContractFiles = Array.isArray(propertyContractFile)
        ? propertyContractFile.filter(Boolean)
        : (propertyContractFile ? [propertyContractFile] : [])
      if (propertyContractFiles.length > 0) {
        propertyContractFiles.forEach((file, index) => {
          const extension = file.name.split('.').pop() || 'pdf'
          const suffix = propertyContractFiles.length > 1 ? `-${index + 1}` : ''
          const contractName = `property-contract${suffix}.${extension}`
          console.log('[FileUpload] Adding property contract/deed:', contractName)
          uploads.push({
            file,
            path: `users/${userId}/`,
            fileName: contractName,
            type: `propertyContract:${index}`
          })
        })
      }

      console.log('[FileUpload] Uploading', uploads.length, 'files to S3...')
      
      // Upload all files
      const downloadURLs = await this.uploadMultipleFiles(uploads, {
        onFileProgress: options.onFileProgress,
        onOverallProgress: options.onOverallProgress,
      })
      console.log('[FileUpload] All files uploaded to S3, URLs received')

      // Map URLs to their types
      const result = {}
      const propertyContractUrls = []
      uploads.forEach((upload, index) => {
        if (upload.type.startsWith('propertyContract:')) {
          propertyContractUrls.push(downloadURLs[index])
          console.log('[FileUpload]', upload.type, '→', downloadURLs[index])
          return
        }
        result[upload.type] = downloadURLs[index]
        console.log('[FileUpload]', upload.type, '→', downloadURLs[index])
      })
      if (propertyContractUrls.length > 0) {
        result.propertyContractUrls = propertyContractUrls
        result.propertyContract = propertyContractUrls[0]
      }

      console.log('[FileUpload] ✅ S3 upload complete')
      return result
    } catch (error) {
      console.error('[FileUpload] ❌ S3 upload failed:', error)
      console.error('[FileUpload] Error code:', error?.code)
      console.error('[FileUpload] Error message:', error?.message)
      throw error
    }
  }
}

export default new FileUploadService()
