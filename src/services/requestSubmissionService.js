import { 
  collection, 
  addDoc, 
  serverTimestamp 
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

      // Upload media files to Firebase Storage if any
      let uploadedFiles = [];
      if (files && files.length > 0) {
        uploadedFiles = await this.uploadMediaFiles(submissionData.projectId, submissionData.userId, files);
      }

      // Prepare the submission document
      const submissionDoc = {
        ...submissionData,
        mediaFiles: uploadedFiles,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add the submission to Firestore
      const docRef = await addDoc(
        collection(db, `projects/${submissionData.projectId}/requestSubmissions`), 
        submissionDoc
      );

      console.log('✅ RequestSubmissionService: Request submitted successfully', {
        submissionId: docRef.id,
        categoryId: submissionData.categoryId
      });

      return docRef.id;

    } catch (error) {
      console.error('❌ RequestSubmissionService: Error submitting request:', error);
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
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `request_${timestamp}_${index}.${fileExtension}`;
        
        // Create storage reference
        const storagePath = `projects/${projectId}/request-submissions/${userId}/${fileName}`;
        const fileRef = storageRef(storage, storagePath);
        
        // Upload the file
        const snapshot = await uploadBytes(fileRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
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
        throw new Error(`Failed to upload file ${file.name}: ${error.message}`);
      }
    });

    return await Promise.all(uploadPromises);
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

      const { getDocs, query, where, orderBy } = await import('firebase/firestore');
      
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

      console.log('✅ RequestSubmissionService: Retrieved user submissions', {
        count: submissions.length
      });

      return submissions;

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

      const { getDocs, query, where, orderBy } = await import('firebase/firestore');
      
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

      console.log('✅ RequestSubmissionService: Retrieved category submissions', {
        count: submissions.length
      });

      return submissions;

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

      const { getDocs, query, orderBy } = await import('firebase/firestore');
      
      const q = query(
        collection(db, `projects/${projectId}/requestSubmissions`),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ RequestSubmissionService: Retrieved all submissions', {
        count: submissions.length
      });

      return submissions;

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
        updatedAt: serverTimestamp(),
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
        createdAt: serverTimestamp()
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
}

const requestSubmissionService = new RequestSubmissionService();
export default requestSubmissionService;
