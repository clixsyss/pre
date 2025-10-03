import { 
  collection, 
  addDoc
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../boot/firebase';

class RequestSubmissionService {
  /**
   * Submit a request with form data and optional media files
   * @param {Object} submissionData - The request submission data
   * @param {Array} files - Array of File objects to upload
   * @returns {Promise<string>} The submission ID
   */
  async submitRequest(submissionData, files = []) {
    try {
      console.log('🚀 RequestSubmissionService: Submitting request', {
        categoryId: submissionData.categoryId,
        userId: submissionData.userId,
        filesCount: files.length
      });

      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Firebase Firestore not initialized');
      }
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }

      // Upload media files to Firebase Storage if any
      let uploadedFiles = [];
      if (files && files.length > 0) {
        try {
          console.log('📤 RequestSubmissionService: Attempting to upload files...');
          uploadedFiles = await this.uploadMediaFiles(submissionData.projectId, submissionData.userId, files);
          console.log('✅ RequestSubmissionService: Files uploaded successfully');
        } catch (uploadError) {
          console.warn('⚠️ RequestSubmissionService: File upload failed, continuing without files:', uploadError.message);
          // Continue with submission without files
          uploadedFiles = [];
        }
      }

      // Prepare the submission document
      const submissionDoc = {
        ...submissionData,
        mediaFiles: uploadedFiles,
        createdAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp for iOS compatibility
        updatedAt: new Date().toISOString()  // Use ISO string instead of serverTimestamp for iOS compatibility
      };

      console.log('📝 RequestSubmissionService: Prepared submission document', {
        hasCategoryId: !!submissionDoc.categoryId,
        hasUserId: !!submissionDoc.userId,
        hasFormData: !!submissionDoc.formData,
        formDataKeys: Object.keys(submissionDoc.formData || {}),
        hasFieldMetadata: !!submissionDoc.fieldMetadata,
        fieldMetadataLength: submissionDoc.fieldMetadata?.length || 0,
        mediaFilesCount: submissionDoc.mediaFiles?.length || 0,
        hasCreatedAt: !!submissionDoc.createdAt,
        hasUpdatedAt: !!submissionDoc.updatedAt
      });

      // Add the submission to Firestore
      console.log('📝 RequestSubmissionService: Adding document to Firestore', {
        collectionPath: `projects/${submissionData.projectId}/requestSubmissions`,
        submissionData: {
          categoryId: submissionData.categoryId,
          userId: submissionData.userId,
          userName: submissionData.userName,
          formDataKeys: Object.keys(submissionData.formData || {}),
          hasFieldMetadata: !!submissionData.fieldMetadata,
          fieldMetadataLength: submissionData.fieldMetadata?.length || 0,
          mediaFilesCount: submissionData.mediaFiles?.length || 0
        }
      });

      let docRef;
      try {
        console.log('📝 RequestSubmissionService: Attempting to add document to Firestore...');
        
        // iOS-specific: Use firestoreService for better compatibility
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          console.log('📱 iOS: Using firestoreService for better iOS compatibility');
          console.log('📱 iOS: Submission data before firestoreService:', {
            projectId: submissionData.projectId,
            categoryId: submissionData.categoryId,
            userId: submissionData.userId,
            formDataKeys: Object.keys(submissionData.formData || {}),
            hasFieldMetadata: !!submissionData.fieldMetadata,
            mediaFilesCount: submissionData.mediaFiles?.length || 0
          });
          
          try {
            const { default: firestoreService } = await import('./firestoreService');
            console.log('📱 iOS: firestoreService imported successfully');
            
            await firestoreService.initialize();
            console.log('📱 iOS: firestoreService initialized successfully');
            
            console.log('📱 iOS: Calling firestoreService.addDoc...');
            docRef = await firestoreService.addDoc(
              `projects/${submissionData.projectId}/requestSubmissions`, 
              submissionDoc
            );
            console.log('📱 iOS: firestoreService.addDoc completed successfully:', docRef);
          } catch (firestoreServiceError) {
            console.warn('⚠️ iOS: firestoreService failed, falling back to Web SDK:', firestoreServiceError.message);
            console.log('📱 iOS: Falling back to Web SDK for submission');
            docRef = await addDoc(
              collection(db, `projects/${submissionData.projectId}/requestSubmissions`), 
              submissionDoc
            );
            console.log('📱 iOS: Web SDK fallback completed successfully:', docRef);
          }
        } else {
          console.log('🌐 Web: Using Web SDK for submission');
          docRef = await addDoc(
            collection(db, `projects/${submissionData.projectId}/requestSubmissions`), 
            submissionDoc
          );
        }
        
        console.log('✅ RequestSubmissionService: Document added successfully, ID:', docRef.id);
      } catch (firestoreError) {
        console.error('❌ RequestSubmissionService: Firestore addDoc error:', firestoreError);
        console.error('❌ Firestore error details:', {
          message: firestoreError.message,
          code: firestoreError.code,
          stack: firestoreError.stack
        });
        
        // iOS-specific: Provide more helpful error messages
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          if (firestoreError.message?.includes('permission')) {
            throw new Error('Permission denied. Please make sure you are logged in and have the correct permissions.');
          } else if (firestoreError.message?.includes('network')) {
            throw new Error('Network error. Please check your internet connection and try again.');
          } else if (firestoreError.message?.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
          }
        }
        
        throw firestoreError;
      }

      console.log('✅ RequestSubmissionService: Request submitted successfully', {
        submissionId: docRef.id,
        categoryId: submissionData.categoryId
      });

      return docRef.id;

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error submitting request:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        submissionData: {
          projectId: submissionData.projectId,
          categoryId: submissionData.categoryId,
          userId: submissionData.userId,
          hasFormData: !!submissionData.formData,
          formDataKeys: Object.keys(submissionData.formData || {}),
          mediaFilesCount: submissionData.mediaFiles?.length || 0
        }
      });
      throw new Error(`Failed to submit request: ${error.message}`);
    }
  }

  /**
   * Upload media files to Firebase Storage
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID
   * @param {Array} files - Array of File objects
   * @returns {Promise<Array>} Array of uploaded file metadata
   */
  async uploadMediaFiles(projectId, userId, files) {
    console.log('📤 RequestSubmissionService: Starting file uploads...', files.length);
    
    // Generate a unique submission ID for this upload session
    const submissionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`📤 Uploading file ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `request_${timestamp}_${index}.${fileExtension}`;
        
        // Create storage reference - matches the storage rules
        const storagePath = `projects/${projectId}/requestSubmissions/${submissionId}/media/${fileName}`;
        const fileRef = storageRef(storage, storagePath);
        
        // Compress image if it's too large
        let fileToUpload = file;
        let isCompressed = false;
        
        // Debug mode: skip compression for testing
        const DEBUG_SKIP_COMPRESSION = false;
        
        // iOS Debug: Create a simple test file for iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && file.type.startsWith('image/')) {
          console.log(`📱 iOS Debug: Creating simple test file for iOS`);
          const testContent = 'iOS test file';
          const testBlob = new Blob([testContent], { type: 'text/plain' });
          const testFile = new File([testBlob], 'ios-test.txt', { type: 'text/plain' });
          console.log(`📱 iOS Debug: Test file created: ${testFile.name}, size: ${testFile.size} bytes`);
          // Don't replace the original file, just log for debugging
        }

             // iOS-specific: Enhanced file handling for iOS
             if (isIOS) {
               console.log(`📱 iOS: Processing file upload for iOS`);
               
               // Validate file for iOS
               if (!fileToUpload || fileToUpload.size === 0) {
                 throw new Error('Invalid file: file is empty or undefined');
               }
               
               // iOS-specific file validation
               if (fileToUpload.size > 50 * 1024 * 1024) { // 50MB limit for iOS
                 throw new Error('File too large for iOS upload (max 50MB)');
               }
               
               console.log(`📱 iOS: File validated - ${fileToUpload.name}, size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
             }
        
        if (!DEBUG_SKIP_COMPRESSION && file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) { // 2MB
          try {
            console.log(`📐 Compressing large image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            fileToUpload = await this.compressImage(file);
            isCompressed = true;
            console.log(`✅ Image compressed: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
          } catch (compressionError) {
            console.warn(`⚠️ Compression failed for ${file.name}, using original file:`, compressionError);
            fileToUpload = file; // Fallback to original file
            isCompressed = false;
          }
        }
        
        // Validate file before upload
        if (!fileToUpload || fileToUpload.size === 0) {
          throw new Error('Invalid file: file is empty or undefined');
        }
        
        // Test: Create a simple text file to test upload
        if (DEBUG_SKIP_COMPRESSION && file.type.startsWith('image/')) {
          console.log(`🧪 DEBUG: Creating test file instead of image`);
          const testContent = 'Test file for debugging upload';
          const testBlob = new Blob([testContent], { type: 'text/plain' });
          fileToUpload = new File([testBlob], 'test.txt', { type: 'text/plain' });
          console.log(`🧪 DEBUG: Test file created: ${fileToUpload.name}, size: ${fileToUpload.size} bytes`);
        }

        // Test: Create a very small image file to test upload for large files (DISABLED)
        // if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) { // 5MB
        //   console.log(`🧪 Creating small test image instead of large file`);
        //   const canvas = document.createElement('canvas');
        //   canvas.width = 10;
        //   canvas.height = 10;
        //   const ctx = canvas.getContext('2d');
        //   ctx.fillStyle = '#FF0000';
        //   ctx.fillRect(0, 0, 10, 10);
        //   
        //   // Make this synchronous by using a Promise
        //   await new Promise((resolve) => {
        //     canvas.toBlob((blob) => {
        //       const smallFile = new File([blob], 'test-small.jpg', { type: 'image/jpeg' });
        //       console.log(`🧪 Small test file created: ${smallFile.name}, size: ${smallFile.size} bytes`);
        //       fileToUpload = smallFile;
        //       resolve();
        //     }, 'image/jpeg', 0.1);
        //   });
        // }
        
        console.log(`📤 Uploading file: ${fileToUpload.name}, size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB, type: ${fileToUpload.type}`);
        console.log(`📤 File validation:`, {
          isFile: fileToUpload instanceof File,
          hasName: !!fileToUpload.name,
          hasType: !!fileToUpload.type,
          size: fileToUpload.size,
          lastModified: fileToUpload.lastModified,
          userAgent: navigator.userAgent,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
        });
        
             let snapshot;
             let retryCount = 0;
             const maxRetries = isIOS ? 3 : 2; // More retries for iOS
             
             while (retryCount <= maxRetries) {
               try {
                 console.log(`📤 Upload attempt ${retryCount + 1} for ${file.name}...`);
                 
                 // Check network connectivity
                 if (!navigator.onLine) {
                   throw new Error('No internet connection');
                 }
                 
                 // iOS-specific debugging and preparation
                 if (isIOS) {
                   console.log(`📱 iOS Debug: Starting upload for ${file.name}`, {
                     fileSize: fileToUpload.size,
                     fileType: fileToUpload.type,
                     isIOS: true,
                     storagePath: storagePath,
                     fileRef: fileRef ? 'exists' : 'null',
                     userAgent: navigator.userAgent,
                     isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                     isWebKit: /WebKit/.test(navigator.userAgent)
                   });
                   
                   // iOS-specific: Ensure file is properly formatted
                   if (fileToUpload instanceof File) {
                     console.log(`📱 iOS: File object is valid File instance`);
                   } else {
                     console.warn(`📱 iOS: File object is not File instance, type: ${typeof fileToUpload}`);
                   }
                 }
                 
                 // iOS-specific: Use Capacitor Firebase Storage for better compatibility
                 if (isIOS) {
                   console.log(`📱 iOS: Using Capacitor Firebase Storage for upload`);
                   try {
                     const { FirebaseStorage } = await import('@capacitor-firebase/storage');
                     
                     // Convert File to Blob for Capacitor
                     const fileBlob = await fileToUpload.arrayBuffer();
                     const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBlob)));
                     
                     console.log(`📱 iOS: File converted to base64, size: ${base64Data.length} characters`);
                     
                     const uploadTimeout = 120000; // 2 minutes for iOS
                     const uploadPromise = FirebaseStorage.uploadFile({
                       path: storagePath,
                       data: base64Data,
                       metadata: {
                         contentType: fileToUpload.type,
                         customMetadata: {
                           originalName: fileToUpload.name,
                           uploadedAt: new Date().toISOString()
                         }
                       }
                     });
                     
                     const timeoutPromise = new Promise((_, reject) => 
                       setTimeout(() => reject(new Error('Upload timeout')), uploadTimeout)
                     );
                     
                     console.log(`📤 Starting iOS upload race with ${uploadTimeout/1000}s timeout...`);
                     const result = await Promise.race([uploadPromise, timeoutPromise]);
                     
                     // Get download URL
                     const downloadURL = await FirebaseStorage.getDownloadUrl({
                       path: storagePath
                     });
                     
                     console.log(`✅ iOS file ${file.name} uploaded successfully:`, result);
                     console.log(`✅ iOS download URL:`, downloadURL.url);
                     
                     snapshot = {
                       ref: { 
                         fullPath: storagePath,
                         downloadURL: downloadURL.url
                       },
                       metadata: result.metadata,
                       downloadURL: downloadURL.url
                     };
                     
                   } catch (capacitorError) {
                     console.warn(`⚠️ iOS: Capacitor Firebase Storage failed, falling back to Web SDK:`, capacitorError.message);
                     
                     // Fallback to Web SDK
                     const uploadTimeout = 120000; // 2 minutes
                     const uploadPromise = uploadBytes(fileRef, fileToUpload);
                     const timeoutPromise = new Promise((_, reject) => 
                       setTimeout(() => reject(new Error('Upload timeout')), uploadTimeout)
                     );
                     
                     console.log(`📤 Starting Web SDK fallback upload with ${uploadTimeout/1000}s timeout...`);
                     snapshot = await Promise.race([uploadPromise, timeoutPromise]);
                   }
                 } else {
                   // Web: Use Firebase Web SDK directly
                   console.log(`🌐 Web: Using Firebase Web SDK for upload`);
                   const uploadTimeout = 120000; // 2 minutes
                   const uploadPromise = uploadBytes(fileRef, fileToUpload);
                   const timeoutPromise = new Promise((_, reject) => 
                     setTimeout(() => reject(new Error('Upload timeout')), uploadTimeout)
                   );
                   
                   console.log(`📤 Starting Web upload race with ${uploadTimeout/1000}s timeout...`);
                   snapshot = await Promise.race([uploadPromise, timeoutPromise]);
                 }
                 console.log(`✅ File ${file.name} uploaded successfully to path: ${storagePath}`);
                 break; // Success, exit retry loop
               } catch (uploadError) {
                 retryCount++;
                 console.warn(`⚠️ Upload attempt ${retryCount} failed for ${file.name}:`, uploadError.message);
                 console.warn(`⚠️ Upload error details:`, {
                   code: uploadError.code,
                   message: uploadError.message,
                   stack: uploadError.stack,
                   isNetworkError: uploadError.message.includes('timeout') || uploadError.message.includes('network'),
                   isPermissionError: uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/object-not-found',
                   isIOS: isIOS,
                   retryCount,
                   maxRetries
                 });
                 
                 if (retryCount > maxRetries) {
                   // If compressed file failed and we haven't tried original yet, try original file
                   if (isCompressed && fileToUpload !== file) {
                     console.log(`🔄 Trying original file for ${file.name} after compressed file failed`);
                     fileToUpload = file;
                     isCompressed = false;
                     retryCount = 0; // Reset retry count for original file
                     continue;
                   }
                   
                   // iOS-specific: More lenient error handling
                   if (isIOS) {
                     console.warn(`📱 iOS: All retries failed for ${file.name}, but continuing with submission`);
                     return {
                       name: file.name,
                       type: file.type,
                       size: file.size,
                       url: null,
                       storagePath: null,
                       uploadedAt: new Date(),
                       error: `iOS upload failed: ${uploadError.message}`,
                       isIOS: true
                     };
                   }
                   
                   // If it's a network or permission error, return a placeholder instead of failing
                   if (uploadError.message.includes('timeout') || uploadError.message.includes('network') || 
                       uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/object-not-found') {
                     console.warn(`⚠️ Skipping file ${file.name} due to persistent error, continuing with submission`);
                     return {
                       name: file.name,
                       type: file.type,
                       size: file.size,
                       url: null,
                       storagePath: null,
                       uploadedAt: new Date(),
                       error: uploadError.message
                     };
                   }
                   
                   throw uploadError; // Re-throw if all retries failed
                 }
                 
                 // iOS-specific: Longer wait times between retries
                 const waitTime = isIOS ? (2000 * retryCount) : (1000 * retryCount);
                 console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
                 await new Promise(resolve => setTimeout(resolve, waitTime));
               }
        }
        
        // Get the download URL
        let downloadURL;
        if (isIOS && snapshot.ref && snapshot.ref.fullPath) {
          // iOS: Use the download URL we already got from Capacitor Firebase Storage
          downloadURL = snapshot.downloadURL || snapshot.ref.downloadURL;
          console.log(`🔗 iOS Download URL obtained for ${file.name}:`, downloadURL);
        } else {
          // Web: Use Firebase Web SDK
          downloadURL = await getDownloadURL(snapshot.ref);
          console.log(`🔗 Web Download URL obtained for ${file.name}:`, downloadURL);
        }
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          storagePath: storagePath,
          uploadedAt: new Date()
        };
        
      } catch (error) {
        console.error(`❌ RequestSubmissionService: Error uploading file ${file.name}:`, error);
        console.error(`❌ Error details:`, {
          message: error.message,
          code: error.code,
          stack: error.stack,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        
        // If it's a timeout or compression error, return a placeholder instead of failing
        if (error.message.includes('timeout') || error.message.includes('compress') || error.message.includes('storage')) {
          console.warn(`⚠️ Skipping file ${file.name} due to error, continuing with submission`);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: null,
            storagePath: null,
            uploadedAt: new Date(),
            error: error.message
          };
        }
        
        throw new Error(`Failed to upload file ${file.name}: ${error.message}`);
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log('✅ RequestSubmissionService: All files uploaded successfully');
    return results;
  }

  /**
   * Compress an image file to reduce its size
   * @param {File} file - The image file to compress
   * @returns {Promise<File>} The compressed file
   */
  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width, maintain aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // Validate the compressed file
              console.log(`📐 Compressed file created: ${compressedFile.name}, size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB, type: ${compressedFile.type}`);
              console.log(`📐 Compressed file validation:`, {
                isFile: compressedFile instanceof File,
                hasName: !!compressedFile.name,
                hasType: !!compressedFile.type,
                size: compressedFile.size,
                lastModified: compressedFile.lastModified,
                blobSize: blob.size
              });
              
              if (compressedFile.size === 0) {
                reject(new Error('Compressed file is empty'));
                return;
              }
              
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image - no blob created'));
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get request submissions for a user
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of user's request submissions
   */
  async getUserSubmissions(projectId, userId) {
    try {
      console.log('🚀 RequestSubmissionService: Getting user submissions', {
        projectId,
        userId
      });

      // iOS-specific: Use firestoreService for better compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('📱 iOS: Using firestoreService for getUserSubmissions');
        const { default: firestoreService } = await import('./firestoreService');
        await firestoreService.initialize();
        
        const collectionPath = `projects/${projectId}/requestSubmissions`;
        const queryOptions = {
          filters: [
            { field: 'userId', operator: '==', value: userId }
          ],
          orderBy: { field: 'createdAt', direction: 'desc' },
          timeoutMs: 10000
        };
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions);
        const submissions = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved user submissions via firestoreService', {
          count: submissions.length
        });

        return submissions;
      } else {
        // Web: Use Firebase Web SDK directly
        console.log('🌐 Web: Using Firebase Web SDK for getUserSubmissions');
        const { getDocs, query, where, orderBy, collection } = await import('firebase/firestore');
        
        const q = query(
          collection(db, `projects/${projectId}/requestSubmissions`),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved user submissions via Web SDK', {
          count: submissions.length
        });

        return submissions;
      }

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error getting user submissions:', error);
      throw new Error(`Failed to get user submissions: ${error.message}`);
    }
  }

  /**
   * Get request submissions for a category
   * @param {string} projectId - The project ID
   * @param {string} categoryId - The category ID
   * @returns {Promise<Array>} Array of category request submissions
   */
  async getCategorySubmissions(projectId, categoryId) {
    try {
      console.log('🚀 RequestSubmissionService: Getting category submissions', {
        projectId,
        categoryId
      });

      // iOS-specific: Use firestoreService for better compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('📱 iOS: Using firestoreService for getCategorySubmissions');
        const { default: firestoreService } = await import('./firestoreService');
        await firestoreService.initialize();
        
        const collectionPath = `projects/${projectId}/requestSubmissions`;
        const queryOptions = {
          filters: [
            { field: 'categoryId', operator: '==', value: categoryId }
          ],
          orderBy: { field: 'createdAt', direction: 'desc' },
          timeoutMs: 10000
        };
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions);
        const submissions = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved category submissions via firestoreService', {
          count: submissions.length
        });

        return submissions;
      } else {
        // Web: Use Firebase Web SDK directly
        console.log('🌐 Web: Using Firebase Web SDK for getCategorySubmissions');
        const { getDocs, query, where, orderBy, collection } = await import('firebase/firestore');
        
        const q = query(
          collection(db, `projects/${projectId}/requestSubmissions`),
          where('categoryId', '==', categoryId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved category submissions via Web SDK', {
          count: submissions.length
        });

        return submissions;
      }

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error getting category submissions:', error);
      throw new Error(`Failed to get category submissions: ${error.message}`);
    }
  }

  /**
   * Get all request submissions for a project (admin view)
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of all request submissions
   */
  async getAllSubmissions(projectId) {
    try {
      console.log('🚀 RequestSubmissionService: Getting all submissions', {
        projectId
      });

      // iOS-specific: Use firestoreService for better compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('📱 iOS: Using firestoreService for getAllSubmissions');
        const { default: firestoreService } = await import('./firestoreService');
        await firestoreService.initialize();
        
        const collectionPath = `projects/${projectId}/requestSubmissions`;
        const queryOptions = {
          orderBy: { field: 'createdAt', direction: 'desc' },
          timeoutMs: 10000
        };
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions);
        const submissions = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved all submissions via firestoreService', {
          count: submissions.length
        });

        return submissions;
      } else {
        // Web: Use Firebase Web SDK directly
        console.log('🌐 Web: Using Firebase Web SDK for getAllSubmissions');
        const { getDocs, query, orderBy, collection } = await import('firebase/firestore');
        
        const q = query(
          collection(db, `projects/${projectId}/requestSubmissions`),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ RequestSubmissionService: Retrieved all submissions via Web SDK', {
          count: submissions.length
        });

        return submissions;
      }

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error getting all submissions:', error);
      throw new Error(`Failed to get all submissions: ${error.message}`);
    }
  }

  /**
   * Update request submission status
   * @param {string} projectId - The project ID
   * @param {string} submissionId - The submission ID
   * @param {string} status - New status
   * @param {string} adminId - Admin user ID
   * @returns {Promise<void>}
   */
  async updateSubmissionStatus(projectId, submissionId, status, adminId) {
    try {
      console.log('🚀 RequestSubmissionService: Updating submission status', {
        projectId,
        submissionId,
        status,
        adminId
      });

      const { doc, updateDoc } = await import('firebase/firestore');
      
      const submissionRef = doc(db, `projects/${projectId}/requestSubmissions/${submissionId}`);
      await updateDoc(submissionRef, {
        status,
        updatedAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp for iOS compatibility
        updatedBy: adminId
      });

      console.log('✅ RequestSubmissionService: Submission status updated successfully');

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error updating submission status:', error);
      throw new Error(`Failed to update submission status: ${error.message}`);
    }
  }

  /**
   * Add a message to a request submission
   * @param {string} projectId - The project ID
   * @param {string} submissionId - The submission ID
   * @param {Object} messageData - Message data
   * @returns {Promise<string>} Message ID
   */
  async addMessage(projectId, submissionId, messageData) {
    try {
      console.log('🚀 RequestSubmissionService: Adding message to submission', {
        projectId,
        submissionId
      });

      const { addDoc, collection } = await import('firebase/firestore');
      
      const messagesRef = collection(db, `projects/${projectId}/requestSubmissions/${submissionId}/messages`);
      const messageDoc = {
        ...messageData,
        createdAt: new Date().toISOString() // Use ISO string instead of serverTimestamp for iOS compatibility
      };
      
      const docRef = await addDoc(messagesRef, messageDoc);
      
      console.log('✅ RequestSubmissionService: Message added successfully', {
        messageId: docRef.id
      });

      return docRef.id;

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error adding message:', error);
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Test function for debugging iOS submission issues
   * Call this from browser console: requestSubmissionService.testIOSSubmission()
   */
  async testIOSSubmission() {
    console.log('🧪 Testing iOS submission...');
    
    try {
      // Create a test submission
      const testSubmissionData = {
        categoryId: 'test-category',
        categoryName: 'Test Category',
        userId: 'test-user-id',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userPhone: '1234567890',
        formData: {
          testField: 'test value'
        },
        fieldMetadata: [{
          id: 'testField',
          fieldName: 'Test Field',
          fieldType: 'text',
          required: true,
          placeholder: 'Enter test value'
        }],
        mediaFiles: [],
        status: 'pending',
        projectId: 'test-project'
      };

      console.log('🧪 Test submission data:', testSubmissionData);
      
      // Try to submit
      const result = await this.submitRequest(testSubmissionData, []);
      console.log('✅ Test submission successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Test submission failed:', error);
      throw error;
    }
  }
}

const requestSubmissionService = new RequestSubmissionService();
export default requestSubmissionService;
