import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import { doc, updateDoc, serverTimestamp, collection, query, where, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
// import { db, storage } from '../boot/firebase' // Not used in updated methods

class ComplaintService {
  constructor() {
    // No need for db and storage references - using services
  }

  // Create a new complaint
  async createComplaint(projectId, userId, complaintData) {
    return performanceService.timeOperation('createComplaint', async () => {
      try {
        console.log('🚀 Creating complaint:', { projectId, userId, complaintData })
        
        const now = new Date();
        const complaint = {
          userId,
          adminId: null,
          title: complaintData.title,
          category: complaintData.category,
          status: 'Open',
          priority: complaintData.priority || 'Medium',
          messages: [{
            id: Date.now().toString(),
            senderType: 'user',
            senderId: userId,
            text: complaintData.initialMessage,
            timestamp: now,
            imageUrl: complaintData.imageUrl || null,
            imageFileName: complaintData.imageFileName || null
          }],
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now
        };

        const collectionPath = `projects/${projectId}/complaints`
        const result = await firestoreService.addDoc(collectionPath, complaint)
        
        console.log('✅ Complaint created successfully:', { complaintId: result.id })
        return { id: result.id, ...complaint };
      } catch (error) {
        console.error('❌ Error creating complaint:', error);
        errorHandlingService.handleFirestoreError(error, 'createComplaint')
        throw error;
      }
    })
  }

  // Get all complaints for a project (with optional filters)
  async getComplaints(projectId, filters = {}) {
    return performanceService.timeOperation('getComplaints', async () => {
      try {
        console.log('🔍 Getting complaints:', { projectId, filters })
        
        const collectionPath = `projects/${projectId}/complaints`
        const queryFilters = {}
        const orderByClause = { field: 'lastMessageAt', direction: 'desc' }

        // Apply filters
        if (filters.status) {
          queryFilters.status = { operator: '==', value: filters.status }
        }
        if (filters.userId) {
          queryFilters.userId = { operator: '==', value: filters.userId }
        }
        if (filters.adminId) {
          queryFilters.adminId = { operator: '==', value: filters.adminId }
        }
        if (filters.category) {
          queryFilters.category = { operator: '==', value: filters.category }
        }

        const result = await firestoreService.getDocs(collectionPath, queryFilters, orderByClause)
        const complaints = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Apply limit if specified
        const finalComplaints = filters.limit ? complaints.slice(0, filters.limit) : complaints
        
        console.log('✅ Complaints retrieved:', { count: finalComplaints.length })
        return finalComplaints;
      } catch (error) {
        console.error('❌ Error fetching complaints:', error);
        errorHandlingService.handleFirestoreError(error, 'getComplaints')
        throw error;
      }
    })
  }

  // Get a specific complaint by ID
  async getComplaint(projectId, complaintId) {
    return performanceService.timeOperation('getComplaint', async () => {
      try {
        console.log('🔍 Getting complaint:', { projectId, complaintId });
        
        if (!projectId) {
          throw new Error('Project ID is required');
        }
        
        if (!complaintId) {
          throw new Error('Complaint ID is required');
        }
        
        const docPath = `projects/${projectId}/complaints/${complaintId}`
        const result = await firestoreService.getDoc(docPath)
        
        if (result.exists) {
          const data = result.data();
          console.log('✅ Complaint found:', { id: result.id, ...data });
          return { id: result.id, ...data };
        } else {
          console.log('Complaint not found in database');
          throw new Error('Complaint not found');
        }
      } catch (error) {
        console.error('❌ Error fetching complaint:', error);
        errorHandlingService.handleFirestoreError(error, 'getComplaint')
        throw error;
      }
    })
  }

  // Add a message to a complaint
  async addMessage(projectId, complaintId, messageData) {
    return performanceService.timeOperation('addMessage', async () => {
      try {
        console.log('🚀 Adding message to complaint:', { projectId, complaintId, messageData })
        
        const docPath = `projects/${projectId}/complaints/${complaintId}`
        
        const now = new Date();
        const message = {
          id: Date.now().toString(),
          senderType: messageData.senderType, // 'user' or 'admin'
          senderId: messageData.senderId,
          text: messageData.text,
          timestamp: now,
          imageUrl: messageData.imageUrl || null,
          imageFileName: messageData.imageFileName || null
        };

        // Get current complaint to add message to array
        const complaintResult = await firestoreService.getDoc(docPath);
        if (!complaintResult.exists) {
          throw new Error('Complaint not found');
        }

        const currentComplaint = complaintResult.data();
        const updatedMessages = [...currentComplaint.messages, message];

        await firestoreService.updateDoc(docPath, {
          messages: updatedMessages,
          updatedAt: now,
          lastMessageAt: now
        });

        console.log('✅ Message added successfully')
        return message;
      } catch (error) {
        console.error('❌ Error adding message:', error);
        errorHandlingService.handleFirestoreError(error, 'addMessage')
        throw error;
      }
    })
  }

  // Update complaint status
  async updateComplaintStatus(projectId, complaintId, status, adminId = null) {
    return performanceService.timeOperation('updateComplaintStatus', async () => {
      try {
        console.log('🚀 Updating complaint status:', { projectId, complaintId, status, adminId })
        
        const docPath = `projects/${projectId}/complaints/${complaintId}`
        const updateData = {
          status,
          updatedAt: new Date()
        };

        if (adminId) {
          updateData.adminId = adminId;
        }

        await firestoreService.updateDoc(docPath, updateData);
        
        console.log('✅ Complaint status updated successfully')
        return true;
      } catch (error) {
        console.error('❌ Error updating complaint status:', error);
        errorHandlingService.handleFirestoreError(error, 'updateComplaintStatus')
        throw error;
      }
    })
  }

  // Assign complaint to admin
  async assignComplaint(projectId, complaintId, adminId) {
    try {
      const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
      await updateDoc(complaintRef, {
        adminId,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error assigning complaint:', error);
      throw error;
    }
  }

  // Upload image for complaint message
  async uploadComplaintImage(file, complaintId = null) {
    try {
      const fileExtension = file.name.split('.').pop();
      const tempId = complaintId || 'temp';
      const fileName = `complaints/${tempId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const fileRef = storageRef(this.storage, fileName);
      
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      return {
        url: downloadURL,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error uploading complaint image:', error);
      throw error;
    }
  }

  // Delete complaint image
  async deleteComplaintImage(fileName) {
    try {
      const imageRef = storageRef(this.storage, fileName);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting complaint image:', error);
      throw error;
    }
  }

  // Listen to real-time updates for a specific complaint
  subscribeToComplaint(projectId, complaintId, callback) {
    const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
    return onSnapshot(complaintRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }

  // Listen to real-time updates for all complaints
  subscribeToComplaints(projectId, filters = {}, callback) {
    const complaintsRef = collection(this.db, `projects/${projectId}/complaints`);
    let q = query(complaintsRef, orderBy('lastMessageAt', 'desc'));

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.adminId) {
      q = query(q, where('adminId', '==', filters.adminId));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    return onSnapshot(q, (querySnapshot) => {
      const complaints = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(complaints);
    });
  }

  // Get complaint statistics
  async getComplaintStats(projectId) {
    try {
      const complaints = await this.getComplaints(projectId);
      
      const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status === 'Open').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        closed: complaints.filter(c => c.status === 'Closed').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting complaint stats:', error);
      throw error;
    }
  }

  // Delete a complaint
  async deleteComplaint(projectId, complaintId) {
    try {
      const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
      await deleteDoc(complaintRef);
      return true;
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  }
}

export default new ComplaintService();