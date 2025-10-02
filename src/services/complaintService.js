import firestoreService from './firestoreService'
import fileUploadService from './fileUploadService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'

class ComplaintService {
  constructor() {
    // Using services instead of direct Firebase references
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
          console.log('🔍 Applied userId filter:', filters.userId)
        }
        if (filters.adminId) {
          queryFilters.adminId = { operator: '==', value: filters.adminId }
        }
        if (filters.category) {
          queryFilters.category = { operator: '==', value: filters.category }
        }

        console.log('🔍 Final query filters:', queryFilters)

        // Convert queryFilters to the format expected by firestoreService.getDocs
        const queryOptions = {
          filters: Object.entries(queryFilters).map(([field, filter]) => ({
            field,
            operator: filter.operator,
            value: filter.value
          })),
          orderBy: orderByClause
        }

        console.log('🔍 Calling firestoreService.getDocs with:', { collectionPath, queryOptions })
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        console.log('🔍 FirestoreService result:', { docsCount: result.docs?.length, empty: result.empty, size: result.size })
        
        const complaints = result.docs.map(doc => ({
          id: doc.id,
          ...(typeof doc.data === 'function' ? doc.data() : doc.data)
        }));

        console.log('🔍 Raw complaints from Firestore:', complaints.map(c => ({ id: c.id, userId: c.userId })))

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
        
        // Verify authentication
        const user = await optimizedAuthService.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
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
    return performanceService.timeOperation('assignComplaint', async () => {
      try {
        console.log('🚀 Assigning complaint to admin:', { projectId, complaintId, adminId });
        
        const docPath = `projects/${projectId}/complaints/${complaintId}`;
        
        await firestoreService.updateDoc(docPath, {
          adminId,
          updatedAt: new Date()
        });
        
        console.log('✅ Complaint assigned successfully');
        return true;
      } catch (error) {
        console.error('❌ Error assigning complaint:', error);
        errorHandlingService.handleFirestoreError(error, 'assignComplaint');
        throw error;
      }
    });
  }

  // Upload image for complaint message
  async uploadComplaintImage(file, complaintId = null) {
    return performanceService.timeOperation('uploadComplaintImage', async () => {
      try {
        console.log('🚀 Uploading complaint image:', { fileName: file.name, complaintId });
        
        const tempId = complaintId || 'temp';
        const folderPath = `complaints/${tempId}`;
        
        const result = await fileUploadService.uploadFile(file, folderPath);
        
        console.log('✅ Complaint image uploaded successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Error uploading complaint image:', error);
        errorHandlingService.handleFirestoreError(error, 'uploadComplaintImage');
        throw error;
      }
    });
  }

  // Delete complaint image
  async deleteComplaintImage(fileName) {
    return performanceService.timeOperation('deleteComplaintImage', async () => {
      try {
        console.log('🚀 Deleting complaint image:', fileName);
        
        await fileUploadService.deleteFile(fileName);
        
        console.log('✅ Complaint image deleted successfully');
        return true;
      } catch (error) {
        console.error('❌ Error deleting complaint image:', error);
        errorHandlingService.handleFirestoreError(error, 'deleteComplaintImage');
        throw error;
      }
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
    return performanceService.timeOperation('deleteComplaint', async () => {
      try {
        console.log('🚀 Deleting complaint:', { projectId, complaintId });
        
        const docPath = `projects/${projectId}/complaints/${complaintId}`;
        
        await firestoreService.deleteDoc(docPath);
        
        console.log('✅ Complaint deleted successfully');
        return true;
      } catch (error) {
        console.error('❌ Error deleting complaint:', error);
        errorHandlingService.handleFirestoreError(error, 'deleteComplaint');
        throw error;
      }
    });
  }

  // Subscribe to real-time updates for a specific complaint
  subscribeToComplaint(projectId, complaintId, callback) {
    try {
      console.log('🔔 Setting up real-time subscription for complaint:', { projectId, complaintId });
      
      const docPath = `projects/${projectId}/complaints/${complaintId}`;
      
      return firestoreService.onSnapshot(docPath, (docSnapshot) => {
        if (docSnapshot && docSnapshot.exists()) {
          const data = docSnapshot.data();
          const complaint = {
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            lastMessageAt: data.lastMessageAt?.toDate?.() || data.lastMessageAt
          };
          console.log('📨 Real-time complaint update received:', complaint);
          callback(complaint);
        } else {
          console.log('📭 Complaint document does not exist');
          callback(null);
        }
      });
    } catch (error) {
      console.error('❌ Error setting up complaint subscription:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates for all complaints
  subscribeToComplaints(projectId, filters, callback) {
    try {
      console.log('🔔 Setting up real-time subscription for complaints:', { projectId, filters });
      
      const collectionPath = `projects/${projectId}/complaints`;
      
      // Build query options
      const queryOptions = {};
      if (filters.status) {
        queryOptions.filters = [{ field: 'status', operator: '==', value: filters.status }];
      }
      if (filters.userId) {
        queryOptions.filters = queryOptions.filters || [];
        queryOptions.filters.push({ field: 'userId', operator: '==', value: filters.userId });
      }
      
      return firestoreService.onSnapshot(collectionPath, queryOptions, (snapshot) => {
        const complaints = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          complaints.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            lastMessageAt: data.lastMessageAt?.toDate?.() || data.lastMessageAt
          });
        });
        console.log('📨 Real-time complaints update received:', complaints.length, 'complaints');
        callback(complaints);
      });
    } catch (error) {
      console.error('❌ Error setting up complaints subscription:', error);
      throw error;
    }
  }
}

export default new ComplaintService();