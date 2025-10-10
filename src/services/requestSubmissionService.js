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

      // First, create the document to get the actual submission ID
      const submissionDoc = {
        ...submissionData,
        mediaFiles: [], // Will be updated after file uploads
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📝 RequestSubmissionService: Creating document first to get submission ID...');
      
      let docRef;
      try {
        // iOS-specific: Use firestoreService for better compatibility
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          console.log('📱 iOS: Using firestoreService for document creation');
          const { default: firestoreService } = await import('./firestoreService');
          await firestoreService.initialize();
          
          docRef = await firestoreService.addDoc(
            `projects/${submissionData.projectId}/requestSubmissions`, 
            submissionDoc
          );
          console.log('📱 iOS: Document created with ID:', docRef.id);
        } else {
          console.log('🌐 Web: Using Web SDK for document creation');
          docRef = await addDoc(
            collection(db, `projects/${submissionData.projectId}/requestSubmissions`), 
            submissionDoc
          );
          console.log('🌐 Web: Document created with ID:', docRef.id);
        }
      } catch (firestoreError) {
        console.error('❌ RequestSubmissionService: Error creating document:', firestoreError);
        throw firestoreError;
      }

      const submissionId = docRef.id;
      console.log('✅ RequestSubmissionService: Document created successfully with ID:', submissionId);

      // Now upload media files using the actual submission ID
      let uploadedFiles = [];
      if (files && files.length > 0) {
        try {
          console.log('📤 RequestSubmissionService: Uploading files with actual submission ID...');
          uploadedFiles = await this.uploadMediaFiles(submissionData.projectId, submissionId, files);
          console.log('✅ RequestSubmissionService: Files uploaded successfully');
          
          // Update the document with the uploaded files
          console.log('📝 RequestSubmissionService: Updating document with uploaded files...');
          
          // Use the same iOS-compatible approach for updating
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            console.log('📱 iOS: Using firestoreService for document update');
            const { default: firestoreService } = await import('./firestoreService');
            await firestoreService.initialize();
            
            await firestoreService.updateDoc(
              `projects/${submissionData.projectId}/requestSubmissions/${submissionId}`,
              {
                mediaFiles: uploadedFiles,
                updatedAt: new Date().toISOString()
              }
            );
            console.log('📱 iOS: Document updated with media files via firestoreService');
          } else {
            console.log('🌐 Web: Using Web SDK for document update');
            const { doc, updateDoc } = await import('firebase/firestore');
            const submissionRef = doc(db, `projects/${submissionData.projectId}/requestSubmissions/${submissionId}`);
            await updateDoc(submissionRef, {
              mediaFiles: uploadedFiles,
              updatedAt: new Date().toISOString()
            });
            console.log('🌐 Web: Document updated with media files via Web SDK');
          }
          console.log('✅ RequestSubmissionService: Document updated with media files');
        } catch (uploadError) {
          console.warn('⚠️ RequestSubmissionService: File upload failed, continuing without files:', uploadError.message);
          // Continue with submission without files
          uploadedFiles = [];
        }
      }

      console.log('✅ RequestSubmissionService: Request submitted successfully', {
        submissionId: submissionId,
        categoryId: submissionData.categoryId
      });

      return submissionId;

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
   * @param {string} submissionId - The actual submission ID (not temp)
   * @param {Array} files - Array of File objects
   * @returns {Promise<Array>} Array of uploaded file metadata
   */
  async uploadMediaFiles(projectId, submissionId, files) {
    console.log('📤 RequestSubmissionService: Starting file uploads...', files.length);
    console.log('📤 RequestSubmissionService: Using actual submission ID:', submissionId);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`📤 Uploading file ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `request_${timestamp}_${index}.${fileExtension}`;
        
        // Create storage path using actual submission ID
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
