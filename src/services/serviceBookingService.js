import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../boot/firebase';
import { getAuth } from 'firebase/auth';

class ServiceBookingService {
  /**
   * Create a service booking
   * @param {string} projectId - Project ID
   * @param {Object} bookingData - Booking data
   * @returns {Promise<string>} Booking ID
   */
  async createServiceBooking(projectId, bookingData) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!bookingData.serviceId) {
        throw new Error('Service ID is required');
      }
      if (!bookingData.categoryId) {
        throw new Error('Category ID is required');
      }
      if (!bookingData.selectedDate) {
        throw new Error('Selected date is required');
      }

      const booking = {
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        projectId: projectId,
        serviceId: bookingData.serviceId,
        categoryId: bookingData.categoryId,
        serviceName: bookingData.serviceName,
        categoryName: bookingData.categoryName,
        servicePrice: bookingData.servicePrice,
        selectedDate: bookingData.selectedDate,
        selectedTime: bookingData.selectedTime || null,
        status: 'open', // open, processing, closed
        paymentStatus: 'pending', // pending, paid, refunded
        notes: bookingData.notes || '',
        messages: [], // Chat messages array
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(
        collection(db, `projects/${projectId}/serviceBookings`), 
        booking
      );

      console.log('Service booking created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating service booking:', error);
      throw error;
    }
  }

  /**
   * Get user's service bookings
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of user's bookings
   */
  async getUserServiceBookings(projectId, userId) {
    try {
      const q = query(
        collection(db, `projects/${projectId}/serviceBookings`),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return bookings;
    } catch (error) {
      console.error('Error fetching user service bookings:', error);
      throw error;
    }
  }

  /**
   * Get all service bookings for admin
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of all bookings
   */
  async getAllServiceBookings(projectId) {
    try {
      const q = query(
        collection(db, `projects/${projectId}/serviceBookings`),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return bookings;
    } catch (error) {
      console.error('Error fetching all service bookings:', error);
      throw error;
    }
  }

  /**
   * Get user's service bookings by status
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} status - Booking status (open, processing, closed)
   * @returns {Promise<Array>} Array of user's bookings with specified status
   */
  async getServiceBookingsByStatus(projectId, userId, status) {
    try {
      const q = query(
        collection(db, `projects/${projectId}/serviceBookings`),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('lastMessageAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return bookings;
    } catch (error) {
      console.error(`Error fetching ${status} service bookings:`, error);
      throw error;
    }
  }

  /**
   * Get a single service booking
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking data
   */
  async getServiceBooking(projectId, bookingId) {
    try {
      const docRef = doc(db, `projects/${projectId}/serviceBookings`, bookingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Service booking not found');
      }
    } catch (error) {
      console.error('Error fetching service booking:', error);
      throw error;
    }
  }

  /**
   * Update service booking status
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @returns {Promise<void>}
   */
  async updateBookingStatus(projectId, bookingId, status, reason = '') {
    try {
      const docRef = doc(db, `projects/${projectId}/serviceBookings`, bookingId);
      
      // Add system message for status change
      const now = new Date();
      const systemMessage = {
        id: Date.now().toString(),
        text: `Booking status updated to "${status.toUpperCase()}"${reason ? `. Reason: ${reason}` : ''}`,
        senderType: 'system',
        timestamp: now,
        messageType: 'status_update'
      };

      const currentBooking = await this.getServiceBooking(projectId, bookingId);
      await updateDoc(docRef, {
        status: status,
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        messages: [...(currentBooking.messages || []), systemMessage]
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Update service booking details (price, date, etc.)
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {Object} updates - Updates to apply
   * @param {string} reason - Reason for update
   * @returns {Promise<void>}
   */
  async updateBookingDetails(projectId, bookingId, updates, reason = '') {
    try {
      const docRef = doc(db, `projects/${projectId}/serviceBookings`, bookingId);
      const booking = await this.getServiceBooking(projectId, bookingId);
      
      // Create system message for the update
      let updateMessage = 'Booking details updated:';
      const changes = [];
      
      if (updates.servicePrice && updates.servicePrice !== booking.servicePrice) {
        changes.push(`Price: EGP ${booking.servicePrice} → EGP ${updates.servicePrice}`);
      }
      if (updates.selectedDate && updates.selectedDate !== booking.selectedDate) {
        changes.push(`Date: ${booking.selectedDate} → ${updates.selectedDate}`);
      }
      if (updates.selectedTime && updates.selectedTime !== booking.selectedTime) {
        changes.push(`Time: ${booking.selectedTime || 'Not set'} → ${updates.selectedTime}`);
      }
      
      if (changes.length > 0) {
        updateMessage += '\n' + changes.join('\n');
        if (reason) {
          updateMessage += `\nReason: ${reason}`;
        }
      }

      const now = new Date();
      const systemMessage = {
        id: Date.now().toString(),
        text: updateMessage,
        senderType: 'system',
        timestamp: now,
        messageType: 'details_update'
      };

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        messages: [...booking.messages || [], systemMessage]
      });
    } catch (error) {
      console.error('Error updating booking details:', error);
      throw error;
    }
  }

  /**
   * Add message to service booking chat
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {Object} messageData - Message data
   * @returns {Promise<void>}
   */
  async addMessage(projectId, bookingId, messageData) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(db, `projects/${projectId}/serviceBookings`, bookingId);
      const booking = await this.getServiceBooking(projectId, bookingId);
      
      const now = new Date();
      const message = {
        id: Date.now().toString(),
        text: messageData.text,
        senderType: messageData.senderType || 'user',
        senderId: user.uid,
        senderName: user.displayName || 'User',
        timestamp: now,
        messageType: 'chat'
      };

      await updateDoc(docRef, {
        messages: [...booking.messages || [], message],
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Listen to service booking changes
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onServiceBookingChange(projectId, bookingId, callback) {
    const docRef = doc(db, `projects/${projectId}/serviceBookings`, bookingId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }
}

const serviceBookingService = new ServiceBookingService();
export default serviceBookingService;
