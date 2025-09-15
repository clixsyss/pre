import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
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
        status: 'pending', // pending, confirmed, cancelled, completed
        paymentStatus: 'pending', // pending, paid, refunded
        notes: bookingData.notes || '',
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
}

const serviceBookingService = new ServiceBookingService();
export default serviceBookingService;
