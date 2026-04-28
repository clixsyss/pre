import fileUploadService from './fileUploadService';
import { createRequestNotification } from './notificationCenterService';
import { smartMirrorDb as db } from '../boot/smartMirrorFirebase';

class RequestSubmissionService {
  isSubmissionMessagingClosed(status) {
    const normalized = String(status || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
    return ['closed', 'completed', 'resolved', 'rejected', 'cancelled'].includes(normalized);
  }

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

      // First, create the document to get the actual submission ID
      // Ensure createdAt is a number (timestamp) for DynamoDB GSI compatibility
      // The GSI userId-createdAt-index expects createdAt as N (number), not S (string)
      const submissionDoc = {
        ...submissionData,
        mediaFiles: [], // Will be updated after file uploads
        createdAt: submissionData.createdAt instanceof Date 
          ? submissionData.createdAt.getTime() 
          : (typeof submissionData.createdAt === 'number' 
            ? submissionData.createdAt 
            : (submissionData.createdAt ? new Date(submissionData.createdAt).getTime() : Date.now())),
        updatedAt: Date.now(), // Also use timestamp for consistency
        // Ensure all nested objects and arrays are properly formatted
        formData: submissionData.formData || {},
        fieldMetadata: submissionData.fieldMetadata || [],
        // Remove any undefined values
      };
      
      // Remove undefined values to prevent DynamoDB errors
      Object.keys(submissionDoc).forEach(key => {
        if (submissionDoc[key] === undefined) {
          delete submissionDoc[key];
        }
      });

      console.log('📝 RequestSubmissionService: Creating document first to get submission ID...');
      
      let docRef;
      try {
        // iOS-specific: Use firestoreService for better compatibility
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          console.log('📱 iOS: Using firestoreService for document creation');
          const { default: firestoreService } = await import('./firestoreService');
          await firestoreService.initialize();
          
          const result = await firestoreService.addDoc(
            `projects/${submissionData.projectId}/requestSubmissions`, 
            submissionDoc
          );
          // firestoreService.addDoc returns { id, documentId }
          const submissionId = result?.id || result?.documentId || result
          docRef = { id: submissionId }
          console.log('📱 iOS: Document created with ID:', submissionId);
        } else {
          console.log('🌐 Web: Using firestoreService for document creation (DynamoDB)');
          const { default: firestoreService } = await import('./firestoreService');
          await firestoreService.initialize();
          
          const result = await firestoreService.addDoc(
            `projects/${submissionData.projectId}/requestSubmissions`, 
            submissionDoc
          );
          // firestoreService.addDoc returns { id, documentId }
          const submissionId = result?.id || result?.documentId || result
          docRef = { id: submissionId }
          console.log('🌐 Web: Document created with ID:', submissionId);
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
                updatedAt: Date.now() // Use timestamp for DynamoDB GSI compatibility
              }
            );
            console.log('📱 iOS: Document updated with media files via firestoreService');
          } else {
            console.log('🌐 Web: Using firestoreService for document update (DynamoDB)');
            const { default: firestoreService } = await import('./firestoreService');
            await firestoreService.initialize();
            
            await firestoreService.updateDoc(
              `projects/${submissionData.projectId}/requestSubmissions/${submissionId}`,
              {
                mediaFiles: uploadedFiles,
                updatedAt: Date.now() // Use timestamp for DynamoDB GSI compatibility
              }
            );
            console.log('🌐 Web: Document updated with media files via firestoreService');
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

      // Send notification to user in the background (don't await to prevent blocking)
      createRequestNotification(
        submissionData.userId,
        submissionData.projectId,
        'Request Submitted',
        `Your ${submissionData.categoryName || 'request'} has been submitted and will be reviewed by management.`,
        `/request-chat/${submissionId}`
      ).then(() => {
        console.log('✅ Request submission notification sent');
      }).catch((notifError) => {
        console.error('⚠️ Failed to send request submission notification:', notifError);
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
    // Use DynamoDB service first
    try {
      const { getUserSubmissions: getDynamoDBUserSubmissions } = await import('./dynamoDBRequestSubmissionsService')
      const submissions = await getDynamoDBUserSubmissions(projectId, userId, { limit: 100 })
      console.log('✅ RequestSubmissionService: Retrieved user submissions from DynamoDB:', submissions.length)
      return submissions
    } catch (dynamoError) {
      console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
      
      // Fallback to Firestore
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

          console.log('✅ RequestSubmissionService: Retrieved user submissions via firestoreService (fallback)', {
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

          console.log('✅ RequestSubmissionService: Retrieved user submissions via Web SDK (fallback)', {
            count: submissions.length
          });

          return submissions;
        }
      } catch (error) {
        console.error('❌ RequestSubmissionService: Error getting user submissions:', error);
        throw new Error(`Failed to get user submissions: ${error.message}`);
      }
    }
  }

  /**
   * Get request submissions for a category
   * @param {string} projectId - The project ID
   * @param {string} categoryId - The category ID
   * @returns {Promise<Array>} Array of category request submissions
   */
  async getCategorySubmissions(projectId, categoryId) {
    // Use DynamoDB service first
    try {
      const { getCategorySubmissions: getDynamoDBCategorySubmissions } = await import('./dynamoDBRequestSubmissionsService')
      const submissions = await getDynamoDBCategorySubmissions(projectId, categoryId, { limit: 100 })
      console.log('✅ RequestSubmissionService: Retrieved category submissions from DynamoDB:', submissions.length)
      return submissions
    } catch (dynamoError) {
      console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
      
      // Fallback to Firestore
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

          console.log('✅ RequestSubmissionService: Retrieved category submissions via firestoreService (fallback)', {
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

          console.log('✅ RequestSubmissionService: Retrieved category submissions via Web SDK (fallback)', {
            count: submissions.length
          });

          return submissions;
        }
      } catch (error) {
        console.error('❌ RequestSubmissionService: Error getting category submissions:', error);
        throw new Error(`Failed to get category submissions: ${error.message}`);
      }
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

  async getSubmissionById(projectId, submissionId) {
    try {
      const { default: firestoreService } = await import('./firestoreService');
      await firestoreService.initialize();
      const path = `projects/${projectId}/requestSubmissions/${submissionId}`;
      const docSnap = await firestoreService.getDoc(path);
      if (!docSnap?.exists) {
        throw new Error('Request submission not found');
      }
      return {
        id: docSnap.id || submissionId,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('❌ RequestSubmissionService: Error getting submission by id:', error);
      throw new Error(`Failed to load request submission: ${error.message}`);
    }
  }

  async updateSubmissionForUser(projectId, submissionId, userId, payload) {
    try {
      const { default: firestoreService } = await import('./firestoreService');
      await firestoreService.initialize();

      const requestPath = `projects/${projectId}/requestSubmissions/${submissionId}`;
      const requestSnap = await firestoreService.getDoc(requestPath);
      if (!requestSnap?.exists) {
        throw new Error('Request submission not found');
      }

      const current = requestSnap.data() || {};
      if (current.userId !== userId) {
        throw new Error('You are not allowed to edit this request.');
      }

      const status = String(current.status || '').trim().toLowerCase().replace(/\s+/g, '_');
      if (!['cancelled', 'rejected'].includes(status)) {
        throw new Error('Editing is only allowed for cancelled or rejected requests.');
      }

      const updateData = {
        formData: payload.formData || current.formData || {},
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      if (Array.isArray(payload.fieldMetadata)) {
        updateData.fieldMetadata = payload.fieldMetadata;
      }

      await firestoreService.updateDoc(requestPath, updateData);
      return true;
    } catch (error) {
      console.error('❌ RequestSubmissionService: Error updating submission for user:', error);
      throw new Error(`Failed to update request submission: ${error.message}`);
    }
  }

  async cancelSubmissionForUser(projectId, submissionId, userId, reason = 'Cancelled by user') {
    try {
      const { default: firestoreService } = await import('./firestoreService');
      await firestoreService.initialize();

      const requestPath = `projects/${projectId}/requestSubmissions/${submissionId}`;
      const requestSnap = await firestoreService.getDoc(requestPath);
      if (!requestSnap?.exists) {
        throw new Error('Request submission not found');
      }

      const current = requestSnap.data() || {};
      if (current.userId !== userId) {
        throw new Error('You are not allowed to cancel this request.');
      }

      const status = String(current.status || '').trim().toLowerCase().replace(/\s+/g, '_');
      if (['cancelled', 'completed', 'closed', 'resolved', 'rejected'].includes(status)) {
        throw new Error('This request cannot be cancelled.');
      }

      const now = new Date().toISOString();
      const cancelMessage = {
        id: Date.now().toString(),
        text: reason || 'Request cancelled by user.',
        senderType: 'system',
        timestamp: now,
        messageType: 'status_update'
      };

      await firestoreService.updateDoc(requestPath, {
        status: 'cancelled',
        statusReason: reason || 'Cancelled by user',
        updatedAt: now,
        lastMessageAt: now,
        messages: [...(current.messages || []), cancelMessage]
      });

      return true;
    } catch (error) {
      console.error('❌ RequestSubmissionService: Error cancelling submission for user:', error);
      throw new Error(`Failed to cancel request submission: ${error.message}`);
    }
  }

  /**
   * Add a message to a request submission
   * Messages are stored as an array in the request submission document (DynamoDB compatible)
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

      // Use firestoreService which routes to DynamoDB
      const { default: firestoreService } = await import('./firestoreService');
      await firestoreService.initialize();
      
      // Get current request submission to get existing messages
      const requestPath = `projects/${projectId}/requestSubmissions/${submissionId}`;
      const requestSnap = await firestoreService.getDoc(requestPath);
      
      if (!requestSnap.exists) {
        throw new Error('Request submission not found');
      }
      
      const requestData = requestSnap.data();
      if (this.isSubmissionMessagingClosed(requestData?.status)) {
        throw new Error('This request is closed. New messages are disabled.');
      }
      const existingMessages = Array.isArray(requestData.messages) ? requestData.messages : [];
      
      // Create new message object
      const messageId = Date.now().toString();
      const message = {
        id: messageId,
        ...messageData,
        createdAt: new Date().toISOString() // Use ISO string for compatibility
      };
      
      // Add message to messages array in the request submission document
      const updatedMessages = [...existingMessages, message];
      await firestoreService.updateDoc(requestPath, {
        messages: updatedMessages,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ RequestSubmissionService: Message added successfully', {
        messageId: messageId
      });

      // Send notification if admin is replying to user (in the background, don't await)
      if (messageData.senderType === 'admin') {
        // Get submission details and send notification in the background
        import('firebase/firestore')
          .then(({ doc, getDoc }) => {
            const submissionRef = doc(db, `projects/${projectId}/requestSubmissions/${submissionId}`);
            return getDoc(submissionRef);
          })
          .then((submissionSnap) => {
            if (submissionSnap.exists()) {
              const submission = submissionSnap.data();
              return createRequestNotification(
                submission.userId,
                projectId,
                'New Reply on Your Request',
                `Admin has replied to your ${submission.categoryName || 'request'}.`,
                `/request-chat/${submissionId}`
              );
            }
          })
          .then(() => {
            console.log('✅ Request reply notification sent');
          })
          .catch((notifError) => {
            console.error('⚠️ Failed to send request reply notification:', notifError);
          });
      }

      return messageId;

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
