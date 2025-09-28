import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'

export class BookingService {
    constructor() {
        // No need for db reference - using firestoreService
    }

    // Generate available time slots for a given day
    generateTimeSlots(startHour = 6, endHour = 22, intervalMinutes = 60) {
        const slots = [];
        const startTime = new Date();
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date();
        endTime.setHours(endHour, 0, 0, 0);

        while (startTime < endTime) {
            slots.push({
                time: startTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                isReserved: false,
                startTime: new Date(startTime)
            });
            startTime.setMinutes(startTime.getMinutes() + intervalMinutes);
        }
        
        return slots;
    }

    // Generate available days (next 7 days)
    generateAvailableDays() {
        const days = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        
        return days;
    }

    // Check if a time slot is available for a specific court in a project
    async checkSlotAvailability(projectId, courtId, date, time) {
        return performanceService.timeOperation('checkSlotAvailability', async () => {
            try {
                console.log('🔍 Checking slot availability:', { projectId, courtId, date, time })
                
                const collectionPath = `projects/${projectId}/bookings`
                const filters = {
                    courtId: { operator: '==', value: courtId },
                    date: { operator: '==', value: date },
                    timeSlots: { operator: 'array-contains', value: time },
                    status: { operator: 'in', value: ["confirmed", "pending"] }
                }
                
                const result = await firestoreService.getDocs(collectionPath, filters)
                const isAvailable = result.docs.length === 0
                
                console.log('✅ Slot availability check result:', { isAvailable, bookingsFound: result.docs.length })
                return isAvailable
            } catch (error) {
                console.error("❌ Error checking slot availability:", error)
                errorHandlingService.handleFirestoreError(error, 'checkSlotAvailability')
                return false
            }
        })
    }

    // Get available time slots for a specific court and date
    async getAvailableTimeSlots(projectId, courtId, date) {
        return performanceService.timeOperation('getAvailableTimeSlots', async () => {
            try {
                console.log('🔍 Getting available time slots:', { projectId, courtId, date })
                
                const baseSlots = this.generateTimeSlots();
                
                // Check which slots are already booked
                const collectionPath = `projects/${projectId}/bookings`
                const filters = {
                    courtId: { operator: '==', value: courtId },
                    date: { operator: '==', value: date },
                    status: { operator: 'in', value: ["confirmed", "pending"] }
                }
                
                const result = await firestoreService.getDocs(collectionPath, filters)
                const bookedSlots = [];
                
                result.docs.forEach((doc) => {
                    const booking = doc.data();
                    if (booking.timeSlots) {
                        bookedSlots.push(...booking.timeSlots);
                    }
                });
                
                // Filter out booked slots
                const availableSlots = baseSlots.map(slot => ({
                    ...slot,
                    isReserved: bookedSlots.includes(slot.time)
                }));
                
                console.log('✅ Available time slots retrieved:', { 
                    totalSlots: availableSlots.length, 
                    bookedSlots: bookedSlots.length,
                    availableCount: availableSlots.filter(s => !s.isReserved).length
                })
                
                return availableSlots;
            } catch (error) {
                console.error("❌ Error getting available time slots:", error);
                errorHandlingService.handleFirestoreError(error, 'getAvailableTimeSlots')
                return this.generateTimeSlots();
            }
        })
    }

    // Create a court booking in a specific project
    async createCourtBooking(projectId, bookingData) {
        return performanceService.timeOperation('createCourtBooking', async () => {
            try {
                // Validate required fields
                if (!projectId) {
                    throw new Error('Project ID is required');
                }
                if (!bookingData.userId) {
                    throw new Error('User ID is required');
                }
                if (!bookingData.courtId) {
                    throw new Error('Court ID is required');
                }
                if (!bookingData.date) {
                    throw new Error('Date is required');
                }
                if (!bookingData.timeSlots || bookingData.timeSlots.length === 0) {
                    throw new Error('Time slots are required');
                }

                const newBooking = {
                    ...bookingData,
                    projectId: projectId,
                    createdAt: new Date(),
                    status: "confirmed",
                    type: "court"
                };

                console.log('🚀 Creating court booking:', newBooking);
                
                const collectionPath = `projects/${projectId}/bookings`
                const result = await firestoreService.addDoc(collectionPath, newBooking)
                
                console.log('🔍 Firestore addDoc result:', result);
                const bookingId = result.id || result.documentId || result;
                console.log('✅ Court booking created successfully:', { bookingId })
                
                // Check if the result has the expected structure
                if (!bookingId) {
                    console.error('❌ No booking ID returned from addDoc:', result);
                    throw new Error('Failed to create booking - no ID returned');
                }
                
                return { success: true, bookingId, booking: { ...newBooking, id: bookingId } };
            } catch (error) {
                console.error("❌ Error creating court booking:", error);
                errorHandlingService.handleFirestoreError(error, 'createCourtBooking')
                throw error;
            }
        })
    }

    // Create an academy program booking in a specific project
    async createAcademyBooking(projectId, bookingData) {
        return performanceService.timeOperation('createAcademyBooking', async () => {
            try {
                // Validate required fields
                if (!projectId) {
                    throw new Error('Project ID is required');
                }
                if (!bookingData.userId) {
                    throw new Error('User ID is required');
                }
                if (!bookingData.academyId) {
                    throw new Error('Academy ID is required');
                }
                if (!bookingData.programId) {
                    throw new Error('Program ID is required');
                }

                const newBooking = {
                    ...bookingData,
                    projectId: projectId,
                    createdAt: new Date(),
                    status: "confirmed",
                    type: "academy"
                };

                console.log('🚀 Creating academy booking:', newBooking);
                
                const collectionPath = `projects/${projectId}/bookings`
                const result = await firestoreService.addDoc(collectionPath, newBooking)
                
                console.log('🔍 Firestore addDoc result:', result);
                const bookingId = result.id || result.documentId || result;
                console.log('✅ Academy booking created successfully:', { bookingId })
                return { success: true, bookingId, booking: { ...newBooking, id: bookingId } };
            } catch (error) {
                console.error("❌ Error creating academy booking:", error);
                errorHandlingService.handleFirestoreError(error, 'createAcademyBooking')
                throw error;
            }
        })
    }

    // Get user's bookings from a specific project
    async getUserBookings(projectId, userId) {
        return performanceService.timeOperation('getUserBookings', async () => {
            try {
                console.log('🔍 Getting user bookings:', { projectId, userId })
                
                const collectionPath = `projects/${projectId}/bookings`
                const filters = {
                    userId: { operator: '==', value: userId }
                }
                const orderBy = { field: 'createdAt', direction: 'desc' }
                
                const result = await firestoreService.getDocs(collectionPath, filters, orderBy)
                const bookings = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log('✅ User bookings retrieved:', { count: bookings.length })
                return bookings;
            } catch (error) {
                console.error("❌ Error fetching user bookings:", error);
                errorHandlingService.handleFirestoreError(error, 'getUserBookings')
                throw error;
            }
        })
    }

    // Get all bookings for a specific project (admin view)
    async getProjectBookings(projectId) {
        return performanceService.timeOperation('getProjectBookings', async () => {
            try {
                console.log('🔍 Getting project bookings:', { projectId })
                
                const collectionPath = `projects/${projectId}/bookings`
                const orderBy = { field: 'createdAt', direction: 'desc' }
                
                const result = await firestoreService.getDocs(collectionPath, null, orderBy)
                const bookings = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log('✅ Project bookings retrieved:', { count: bookings.length })
                return bookings;
            } catch (error) {
                console.error("❌ Error fetching project bookings:", error);
                errorHandlingService.handleFirestoreError(error, 'getProjectBookings')
                throw error;
            }
        })
    }

    // Update booking status
    async updateBookingStatus(projectId, bookingId, newStatus) {
        return performanceService.timeOperation('updateBookingStatus', async () => {
            try {
                console.log('🔍 Updating booking status:', { projectId, bookingId, newStatus })
                
                const docPath = `projects/${projectId}/bookings/${bookingId}`
                const updateData = {
                    status: newStatus,
                    updatedAt: new Date()
                };
                
                await firestoreService.updateDoc(docPath, updateData)
                
                console.log('✅ Booking status updated successfully')
                return { success: true };
            } catch (error) {
                console.error("❌ Error updating booking status:", error);
                errorHandlingService.handleFirestoreError(error, 'updateBookingStatus')
                throw error;
            }
        })
    }

    // Cancel a booking
    async cancelBooking(projectId, bookingId) {
        return performanceService.timeOperation('cancelBooking', async () => {
            try {
                console.log('🔍 Cancelling booking:', { projectId, bookingId })
                
                const docPath = `projects/${projectId}/bookings/${bookingId}`
                const updateData = {
                    status: "cancelled",
                    updatedAt: new Date()
                };
                
                await firestoreService.updateDoc(docPath, updateData)
                
                console.log('✅ Booking cancelled successfully')
                return { success: true };
            } catch (error) {
                console.error("❌ Error cancelling booking:", error);
                errorHandlingService.handleFirestoreError(error, 'cancelBooking')
                throw error;
            }
        })
    }

    // Complete a booking
    async completeBooking(projectId, bookingId) {
        return performanceService.timeOperation('completeBooking', async () => {
            try {
                console.log('🔍 Completing booking:', { projectId, bookingId })
                
                const docPath = `projects/${projectId}/bookings/${bookingId}`
                const updateData = {
                    status: "completed",
                    updatedAt: new Date()
                };
                
                await firestoreService.updateDoc(docPath, updateData)
                
                console.log('✅ Booking completed successfully')
                return { success: true };
            } catch (error) {
                console.error("❌ Error completing booking:", error);
                errorHandlingService.handleFirestoreError(error, 'completeBooking')
                throw error;
            }
        })
    }

    // Calculate price for selected time slots
    calculatePrice(hourlyRate, timeSlots) {
        if (!hourlyRate || !timeSlots || timeSlots.length === 0) return 0;
        return hourlyRate * timeSlots.length;
    }

    // Format date for display
    formatDate(date) {
        if (!date) return '';
        
        const options = { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        };
        
        return date.toLocaleDateString('en-US', options);
    }
}

// Export a default instance
export default new BookingService();
