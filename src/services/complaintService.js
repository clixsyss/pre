import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from 'boot/firebase';
import { storage } from 'boot/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class ComplaintService {
  constructor() {
    this.db = db;
    this.storage = storage;
  }

  // Create a new complaint
  async createComplaint(projectId, userId, complaintData) {
    try {
      const complaintRef = collection(this.db, `projects/${projectId}/complaints`);
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

      const docRef = await addDoc(complaintRef, complaint);
      return { id: docRef.id, ...complaint };
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  // Get all complaints for a project (with optional filters)
  async getComplaints(projectId, filters = {}) {
    try {
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
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  }

  // Get a specific complaint by ID
  async getComplaint(projectId, complaintId) {
    try {
      console.log('Fetching complaint:', { projectId, complaintId });
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      if (!complaintId) {
        throw new Error('Complaint ID is required');
      }
      
      const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
      const complaintSnap = await getDoc(complaintRef);
      
      if (complaintSnap.exists()) {
        const data = complaintSnap.data();
        console.log('Complaint found:', { id: complaintSnap.id, ...data });
        return { id: complaintSnap.id, ...data };
      } else {
        console.log('Complaint not found in database');
        throw new Error('Complaint not found');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  }

  // Add a message to a complaint
  async addMessage(projectId, complaintId, messageData) {
    try {
      const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
      
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
      const complaintSnap = await getDoc(complaintRef);
      if (!complaintSnap.exists()) {
        throw new Error('Complaint not found');
      }

      const currentComplaint = complaintSnap.data();
      const updatedMessages = [...currentComplaint.messages, message];

      await updateDoc(complaintRef, {
        messages: updatedMessages,
        updatedAt: now,
        lastMessageAt: now
      });

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Update complaint status
  async updateComplaintStatus(projectId, complaintId, status, adminId = null) {
    try {
      const complaintRef = doc(this.db, `projects/${projectId}/complaints`, complaintId);
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };

      if (adminId) {
        updateData.adminId = adminId;
      }

      await updateDoc(complaintRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
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