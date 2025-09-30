import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import optimizedAuthService from './optimizedAuthService'
// Note: Using Date.now() instead of serverTimestamp() for Capacitor Firebase compatibility

class ServiceBookingService {
  /**
   * Create a service booking
   * @param {string} projectId - Project ID
   * @param {Object} bookingData - Booking data
   * @returns {Promise<string>} Booking ID
   */
  async createServiceBooking(projectId, bookingData) {
    return performanceService.timeOperation('createServiceBooking', async () => {
      try {
        console.log('🚀 Creating service booking:', { projectId, bookingData })
        
        const user = await optimizedAuthService.getCurrentUser()
        console.log('🚀 ServiceBookingService: Current user:', user ? 'authenticated' : 'not authenticated', user ? user.uid : 'no user')
        
        if (!user) {
          console.error('❌ ServiceBookingService: User not authenticated - cannot create booking')
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

        const now = new Date()
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
          lastMessageAt: now,
          createdAt: now,
          updatedAt: now
        };

        const collectionPath = `projects/${projectId}/serviceBookings`
        const result = await firestoreService.addDoc(collectionPath, booking)

        console.log('✅ Service booking created successfully:', { bookingId: result.id });
        return result.id;
      } catch (error) {
        console.error('❌ Error creating service booking:', error);
        errorHandlingService.handleFirestoreError(error, 'createServiceBooking')
        throw error;
      }
    })
  }

  /**
   * Get user's service bookings
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of user's bookings
   */
  async getUserServiceBookings(projectId, userId) {
    return performanceService.timeOperation('getUserServiceBookings', async () => {
      try {
        console.log('🔍 Getting user service bookings:', { projectId, userId })
        
        const collectionPath = `projects/${projectId}/serviceBookings`
        const queryOptions = {
          filters: [
            { field: 'userId', operator: '==', value: userId }
          ],
          orderBy: [
            { field: 'createdAt', direction: 'desc' }
          ],
          timeoutMs: 6000
        }
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        const bookings = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ User service bookings retrieved:', { count: bookings.length })
        return bookings;
      } catch (error) {
        console.error('❌ Error fetching user service bookings:', error);
        errorHandlingService.handleFirestoreError(error, 'getUserServiceBookings')
        throw error;
      }
    })
  }

  /**
   * Get all service bookings for admin
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of all bookings
   */
  async getAllServiceBookings(projectId) {
    return performanceService.timeOperation('getAllServiceBookings', async () => {
      try {
        console.log('🔍 Getting all service bookings:', { projectId })
        
        const collectionPath = `projects/${projectId}/serviceBookings`
        const queryOptions = {
          orderBy: [
            { field: 'createdAt', direction: 'desc' }
          ],
          timeoutMs: 6000
        }
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        const bookings = result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ All service bookings retrieved:', { count: bookings.length })
        return bookings;
      } catch (error) {
        console.error('❌ Error fetching all service bookings:', error);
        errorHandlingService.handleFirestoreError(error, 'getAllServiceBookings')
        throw error;
      }
    })
  }

  /**
   * Get user's service bookings by status
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} status - Booking status (open, processing, closed)
   * @returns {Promise<Array>} Array of user's bookings with specified status
   */
  async getServiceBookingsByStatus(projectId, userId, status) {
    return performanceService.timeOperation('getServiceBookingsByStatus', async () => {
      try {
        console.log('🔍 Getting service bookings by status:', { projectId, userId, status })
        
        const collectionPath = `projects/${projectId}/serviceBookings`
        const queryOptions = {
          filters: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: status }
          ],
          orderBy: [
            { field: 'lastMessageAt', direction: 'desc' }
          ],
          timeoutMs: 6000
        }
        
        const result = await firestoreService.getDocs(collectionPath, queryOptions)
        
        console.log('✅ Service bookings retrieved successfully:', result.docs.length)
        return result.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error(`❌ Error fetching ${status} service bookings:`, error);
        errorHandlingService.handleFirestoreError(error, 'getServiceBookingsByStatus')
        throw error;
      }
    })
  }

  /**
   * Get a single service booking
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking data
   */
  async getServiceBooking(projectId, bookingId) {
    return performanceService.timeOperation('getServiceBooking', async () => {
      try {
        console.log('🔍 Getting service booking:', { projectId, bookingId })
        
        const docPath = `projects/${projectId}/serviceBookings/${bookingId}`
        const result = await firestoreService.getDoc(docPath)
        
        if (result.exists) {
          const booking = {
            id: result.id,
            ...result.data()
          }
          console.log('✅ Service booking retrieved successfully')
          return booking;
        } else {
          throw new Error('Service booking not found');
        }
      } catch (error) {
        console.error('❌ Error fetching service booking:', error);
        errorHandlingService.handleFirestoreError(error, 'getServiceBooking')
        throw error;
      }
    })
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
      const docPath = `projects/${projectId}/serviceBookings/${bookingId}`;
      await firestoreService.updateDoc(docPath, {
        status: status,
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        messages: [...(currentBooking.messages || []), systemMessage]
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Complete a service booking
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Reason for completion
   * @returns {Promise<void>}
   */
  async completeBooking(projectId, bookingId, reason = '') {
    return performanceService.timeOperation('completeBooking', async () => {
      try {
        console.log('🔍 Completing service booking:', { projectId, bookingId, reason })
        
        // Add system message for completion
        const now = new Date();
        const systemMessage = {
          id: Date.now().toString(),
          text: `Booking completed${reason ? `. Reason: ${reason}` : ''}`,
          senderType: 'system',
          timestamp: now,
          messageType: 'completion'
        };

        const currentBooking = await this.getServiceBooking(projectId, bookingId);
        const docPath = `projects/${projectId}/serviceBookings/${bookingId}`;
        await firestoreService.updateDoc(docPath, {
          status: 'closed',
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          messages: [...(currentBooking.messages || []), systemMessage]
        });
        
        console.log('✅ Service booking completed successfully')
        return { success: true };
      } catch (error) {
        console.error('❌ Error completing service booking:', error);
        errorHandlingService.handleFirestoreError(error, 'completeBooking')
        throw error;
      }
    })
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

      const docPath = `projects/${projectId}/serviceBookings/${bookingId}`;
      await firestoreService.updateDoc(docPath, {
        ...updates,
        updatedAt: new Date(),
        lastMessageAt: new Date(),
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
    return performanceService.timeOperation('addMessage', async () => {
      try {
        console.log('🔍 Adding message to service booking:', { projectId, bookingId, messageData })
        
        const user = await optimizedAuthService.getCurrentUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const booking = await this.getServiceBooking(projectId, bookingId);
        console.log('📋 Current booking messages count:', booking.messages?.length || 0)
        
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

        console.log('💬 New message object:', message)

        const docPath = `projects/${projectId}/serviceBookings/${bookingId}`;
        const updateData = {
          messages: [...(booking.messages || []), message],
          lastMessageAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('📝 Update data:', { 
          messagesCount: updateData.messages.length,
          lastMessageAt: updateData.lastMessageAt,
          updatedAt: updateData.updatedAt
        })
        
        await firestoreService.updateDoc(docPath, updateData);
        console.log('✅ Message added successfully to service booking')
      } catch (error) {
        console.error('❌ Error adding message:', error);
        errorHandlingService.handleFirestoreError(error, 'addMessage')
        throw error;
      }
    })
  }

  /**
   * Listen to service booking changes
   * @param {string} projectId - Project ID
   * @param {string} bookingId - Booking ID
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onServiceBookingChange(projectId, bookingId, callback) {
    const docPath = `projects/${projectId}/serviceBookings/${bookingId}`;
    return firestoreService.onSnapshot(docPath, (doc) => {
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
