import { 
  collection, 
  addDoc
} from 'firebase/firestore';
import { db } from '../boot/firebase';
import fileUploadService from './fileUploadService';

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
        
        // Create storage path
        const storagePath = `projects/${projectId}/requestSubmissions/${submissionId}/media/`;
        
        // Upload using fileUploadService (which handles iOS automatically)
        const downloadURL = await fileUploadService.uploadFile(file, storagePath, fileName);
        
        console.log(`✅ File ${file.name} uploaded successfully`);
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          storagePath: storagePath + fileName,
          uploadedAt: new Date()
        };
        
      } catch (error) {
        console.error(`❌ RequestSubmissionService: Error uploading file ${file.name}:`, error);
        
        // Return a placeholder with error info instead of failing the entire submission
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
