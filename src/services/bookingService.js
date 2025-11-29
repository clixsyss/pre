import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import { createBookingNotification } from './notificationCenterService'

export class BookingService {
    constructor() {
        // No need for db reference - using firestoreService
    }

    // Generate available time slots for a given day
    generateTimeSlots(startHour = 6, endHour = 22, intervalMinutes = 60, selectedDate = null) {
        const slots = [];
        const dateToUse = selectedDate ? new Date(selectedDate) : new Date();
        const startTime = new Date(dateToUse);
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date(dateToUse);
        endTime.setHours(endHour, 0, 0, 0);

        // Get current date/time for filtering past slots
        const now = new Date();

        while (startTime < endTime) {
            // Skip past time slots if generating for today
            if (startTime > now) {
                slots.push({
                    time: startTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    }),
                    isReserved: false,
                    startTime: new Date(startTime)
                });
            }
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
                
                // Get court data including availability schedule
                let baseSlots = [];
                let courtData = null;
                
                try {
                    const courtDoc = await firestoreService.getDoc(`projects/${projectId}/courts/${courtId}`);
                    courtData = courtDoc?.snapshot?.data || courtDoc?.data?.() || courtDoc;
                    
                    if (!courtData) {
                        console.warn('⚠️ No court data found, using default time slots');
                        baseSlots = this.generateTimeSlots(8, 22, 60, date);
                    } else {
                        console.log('📋 Court data:', courtData);
                        
                        // Get the day of week for the selected date
                        const selectedDate = new Date(date);
                        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const dayOfWeek = dayNames[selectedDate.getDay()];
                        
                        console.log('📅 Selected date:', date, 'Day of week:', dayOfWeek);
                        
                        // Check if court has availability schedule
                        if (courtData.availability && courtData.availability[dayOfWeek]) {
                            const daySchedule = courtData.availability[dayOfWeek];
                            console.log(`📅 ${dayOfWeek} schedule:`, daySchedule);
                            
                            // Check if court is open on this day
                            if (!daySchedule.enabled) {
                                console.log(`🚫 Court is closed on ${dayOfWeek}`);
                                return []; // Return empty array - court closed on this day
                            }
                            
                            // Use the day's start and end times
                            const startTime = daySchedule.startTime || '08:00';
                            const endTime = daySchedule.endTime || '22:00';
                            
                            // Convert HH:MM format to hours
                            const startHour = parseInt(startTime.split(':')[0]);
                            const startMinute = parseInt(startTime.split(':')[1]);
                            const endHour = parseInt(endTime.split(':')[0]);
                            const endMinute = parseInt(endTime.split(':')[1]);
                            
                            // Use booking interval from court data
                            const intervalMinutes = courtData.bookingIntervalMinutes || 60;
                            
                            console.log(`⏰ Generating slots: ${startTime} to ${endTime}, ${intervalMinutes} min intervals`);
                            
                            // Generate time slots based on availability
                            const slots = [];
                            const currentTime = new Date(selectedDate);
                            currentTime.setHours(startHour, startMinute, 0, 0);
                            
                            const endDateTime = new Date(selectedDate);
                            endDateTime.setHours(endHour, endMinute, 0, 0);
                            
                            // Get current date/time for filtering past slots
                            const now = new Date();
                            
                            while (currentTime < endDateTime) {
                                // Skip past time slots if selected date is today
                                if (currentTime > now) {
                                    slots.push({
                                        time: currentTime.toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        }),
                                        isReserved: false,
                                        startTime: new Date(currentTime)
                                    });
                                }
                                currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
                            }
                            
                            baseSlots = slots;
                            console.log(`✅ Generated ${slots.length} slots for ${dayOfWeek}`);
                        } else if (courtData.timeSlotConfig) {
                            // Legacy support: Use old timeSlotConfig if exists
                            const { startHour, endHour, intervalMinutes } = courtData.timeSlotConfig;
                            console.log('🔍 Using legacy timeSlotConfig:', courtData.timeSlotConfig);
                            baseSlots = this.generateTimeSlots(startHour, endHour, intervalMinutes, date);
                        } else {
                            // No availability data - use default
                            console.log('🔍 No availability schedule found, using defaults (8 AM - 10 PM, 1 hour)');
                            baseSlots = this.generateTimeSlots(8, 22, 60, date);
                        }
                    }
                } catch (configError) {
                    console.warn('⚠️ Could not fetch court config, using default time slots:', configError);
                    baseSlots = this.generateTimeSlots(8, 22, 60, date);
                }
                
                // Check which slots are already booked
                const collectionPath = `projects/${projectId}/bookings`
                const filters = [
                    { field: 'courtId', operator: '==', value: courtId },
                    { field: 'date', operator: '==', value: date },
                    { field: 'status', operator: 'in', value: ["confirmed", "pending"] }
                ]
                
                console.log('🔍 Debug: Query filters:', filters);
                const result = await firestoreService.getDocs(collectionPath, { filters })
                const bookedSlots = [];
                
                result.docs.forEach((doc) => {
                    const booking = doc.data();
                    if (booking.timeSlots) {
                        // Normalize time format to match generated slots (add leading zeros)
                        const normalizedSlots = booking.timeSlots.map(time => {
                            // Convert "2:00 PM" to "02:00 PM", "7:00 AM" to "07:00 AM", etc.
                            if (time.match(/^\d:\d{2} [AP]M$/)) {
                                return '0' + time;
                            }
                            return time;
                        });
                        bookedSlots.push(...normalizedSlots);
                        console.log('🔍 Debug: Original slots:', booking.timeSlots, 'Normalized slots:', normalizedSlots);
                    }
                });
                
                console.log('🔍 Debug: Booked slots from database:', bookedSlots);
                console.log('🔍 Debug: Generated base slots:', baseSlots.map(s => s.time));
                console.log('🔍 Debug: Sample booking data:', result.docs.slice(0, 3).map(doc => ({
                    id: doc.id,
                    timeSlots: doc.data().timeSlots,
                    date: doc.data().date,
                    courtId: doc.data().courtId
                })));
                
                // Debug: Check if date filtering is working
                const datesInResults = [...new Set(result.docs.map(doc => doc.data().date))];
                console.log('🔍 Debug: Query date:', date);
                console.log('🔍 Debug: All dates in results:', datesInResults);
                console.log('🔍 Debug: Date filter working?', datesInResults.length === 1 && datesInResults[0] === date);
                
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
                return this.generateTimeSlots(8, 22, 60, date);
            }
        })
    }

    // OPTIMIZED VERSION: Get available time slots without re-fetching court data
    async getAvailableTimeSlotsOptimized(projectId, courtId, date, courtData) {
        return performanceService.timeOperation('getAvailableTimeSlotsOptimized', async () => {
            try {
                console.log('🚀 OPTIMIZED: Getting time slots (skipping court fetch)')
                
                // Step 1: Generate time slots from court data (NO FIRESTORE FETCH!)
                let baseSlots = [];
                
                if (!courtData) {
                    console.warn('⚠️ No court data provided, falling back to regular method');
                    return this.getAvailableTimeSlots(projectId, courtId, date);
                }
                
                console.log('📋 Using provided court data');
                
                // Get the day of week for the selected date
                const selectedDate = new Date(date);
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayOfWeek = dayNames[selectedDate.getDay()];
                
                console.log('📅 Day of week:', dayOfWeek);
                
                // Check if court has availability schedule
                if (courtData.availability && courtData.availability[dayOfWeek]) {
                    const daySchedule = courtData.availability[dayOfWeek];
                    
                    // Check if court is open on this day
                    if (!daySchedule.enabled) {
                        console.log(`🚫 Court is closed on ${dayOfWeek}`);
                        return []; // Return empty - court closed
                    }
                    
                    // Parse start and end times
                    const startTime = daySchedule.startTime || '08:00';
                    const endTime = daySchedule.endTime || '22:00';
                    const startHour = parseInt(startTime.split(':')[0]);
                    const startMinute = parseInt(startTime.split(':')[1]);
                    const endHour = parseInt(endTime.split(':')[0]);
                    const endMinute = parseInt(endTime.split(':')[1]);
                    const intervalMinutes = courtData.bookingIntervalMinutes || 60;
                    
                    console.log(`⏰ ${startTime} to ${endTime}, ${intervalMinutes} min intervals`);
                    
                    // Generate slots
                    const slots = [];
                    const currentTime = new Date(selectedDate);
                    currentTime.setHours(startHour, startMinute, 0, 0);
                    const endDateTime = new Date(selectedDate);
                    endDateTime.setHours(endHour, endMinute, 0, 0);
                    
                    // Get current date/time for filtering past slots
                    const now = new Date();
                    
                    while (currentTime < endDateTime) {
                        // Skip past time slots if selected date is today
                        if (currentTime > now) {
                            slots.push({
                                time: currentTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                }),
                                isReserved: false,
                                startTime: new Date(currentTime)
                            });
                        }
                        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
                    }
                    
                    baseSlots = slots;
                    console.log(`✅ Generated ${slots.length} slots`);
                } else {
                    // No availability data - use default
                    console.log('🔍 No availability schedule, using defaults');
                    baseSlots = this.generateTimeSlots(8, 22, 60, date);
                }
                
                // Step 2: Fetch bookings with OPTIMIZED query (simplified, faster)
                console.log('🔍 Fetching bookings for court:', courtId, 'on date:', date);
                
                const collectionPath = `projects/${projectId}/bookings`;
                
                // Simplified query - only filter by courtId and date, status filter in JS
                const filters = [
                    { field: 'courtId', operator: '==', value: courtId },
                    { field: 'date', operator: '==', value: date }
                ];
                
                console.log('🚀 Executing simplified Firestore query...');
                const startTime = Date.now();
                
                let result;
                try {
                    // Set a shorter timeout for the query
                    result = await firestoreService.getDocs(collectionPath, { 
                        filters,
                        timeoutMs: 3000 // 3 second timeout
                    });
                    console.log(`⏱️ Query took ${Date.now() - startTime}ms`);
                } catch (queryError) {
                    console.warn('⚠️ Bookings query failed, assuming no bookings:', queryError);
                    // If query fails, show all slots as available
                    return baseSlots.map(slot => ({ ...slot, isReserved: false }));
                }
                
                const bookedSlots = [];
                
                // Filter by status in JavaScript (faster than compound query)
                result.docs.forEach((doc) => {
                    const booking = doc.data();
                    const status = booking.status || 'pending';
                    
                    // Only consider confirmed and pending bookings
                    if (status === 'confirmed' || status === 'pending') {
                        if (booking.timeSlots) {
                            const normalizedSlots = booking.timeSlots.map(time => {
                                if (time.match(/^\d:\d{2} [AP]M$/)) {
                                    return '0' + time;
                                }
                                return time;
                            });
                            bookedSlots.push(...normalizedSlots);
                        }
                    }
                });
                
                console.log('📅 Booked slots after filtering:', bookedSlots);
                
                // Mark reserved slots
                const availableSlots = baseSlots.map(slot => ({
                    ...slot,
                    isReserved: bookedSlots.includes(slot.time)
                }));
                
                console.log('✅ Time slots ready:', { 
                    total: availableSlots.length, 
                    booked: bookedSlots.length 
                });
                
                return availableSlots;
            } catch (error) {
                console.error("❌ Error in optimized time slots:", error);
                return this.generateTimeSlots(8, 22, 60, date);
            }
        })
    }

    // Create a court booking in a specific project
    async createCourtBooking(projectId, bookingData) {
        return performanceService.timeOperation('createCourtBooking', async () => {
            try {
                console.log('🚀 Starting court booking creation...');
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
                    status: "pending", // Start as pending until admin confirms
                    type: "court"
                };

                console.log('🚀 Creating court booking:', newBooking);
                
                const collectionPath = `projects/${projectId}/bookings`
                
                console.log('🔍 Starting Firestore addDoc operation...');
                console.log('⏰ Start time:', new Date().toISOString());
                
                // Temporarily remove timeout to see if it eventually succeeds
                const result = await firestoreService.addDoc(collectionPath, newBooking);
                
                console.log('⏰ End time:', new Date().toISOString());
                
                console.log('🔍 Firestore addDoc result:', result);
                const bookingId = result.id || result.documentId || result;
                console.log('✅ Court booking created successfully:', { bookingId })
                
                // Check if the result has the expected structure
                if (!bookingId) {
                    console.error('❌ No booking ID returned from addDoc:', result);
                    throw new Error('Failed to create booking - no ID returned');
                }
                
                // Invalidate cache for bookings collection to force fresh fetch
                console.log('🗑️ Invalidating bookings cache...');
                const { default: cacheService } = await import('./cacheService');
                cacheService.invalidatePattern(`collection:projects/${projectId}/bookings`);
                
                // Send notification to user in the background (don't await to prevent blocking)
                const timeSlotText = bookingData.timeSlots.length === 1 
                    ? bookingData.timeSlots[0] 
                    : `${bookingData.timeSlots[0]} - ${bookingData.timeSlots[bookingData.timeSlots.length - 1]}`;
                
                createBookingNotification(
                    bookingData.userId,
                    projectId,
                    'Court Booking Received',
                    `Your booking for ${bookingData.courtName || 'court'} on ${bookingData.date} at ${timeSlotText} is pending confirmation.`,
                    '/my-bookings'
                ).then(() => {
                    console.log('✅ Booking notification sent');
                }).catch((notifError) => {
                    console.error('⚠️ Failed to send booking notification:', notifError);
                });
                
                console.log('🎉 Court booking completed successfully with ID:', bookingId);
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
                    status: "pending", // Start as pending until admin confirms
                    type: "academy"
                };

                console.log('🚀 Creating academy booking:', newBooking);
                
                const collectionPath = `projects/${projectId}/bookings`
                const result = await firestoreService.addDoc(collectionPath, newBooking)
                
                console.log('🔍 Firestore addDoc result:', result);
                const bookingId = result.id || result.documentId || result;
                console.log('✅ Academy booking created successfully:', { bookingId })
                
                // Send notification to user in the background (don't await to prevent blocking)
                createBookingNotification(
                    bookingData.userId,
                    projectId,
                    'Academy Program Registration',
                    `Your registration for ${bookingData.programName || 'program'} has been submitted and is pending confirmation.`,
                    '/academy-booking'
                ).then(() => {
                    console.log('✅ Academy booking notification sent');
                }).catch((notifError) => {
                    console.error('⚠️ Failed to send academy booking notification:', notifError);
                });
                
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
