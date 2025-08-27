import { db } from "boot/firebase";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

export class BookingService {
    constructor() {
        this.db = db;
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
        try {
            const q = query(
                collection(this.db, `projects/${projectId}/bookings`),
                where("courtId", "==", courtId),
                where("date", "==", date),
                where("timeSlots", "array-contains", time),
                where("status", "in", ["confirmed", "pending"])
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error("Error checking slot availability:", error);
            return false;
        }
    }

    // Get available time slots for a specific court and date
    async getAvailableTimeSlots(projectId, courtId, date) {
        try {
            const baseSlots = this.generateTimeSlots();
            
            // Check which slots are already booked
            const q = query(
                collection(this.db, `projects/${projectId}/bookings`),
                where("courtId", "==", courtId),
                where("date", "==", date),
                where("status", "in", ["confirmed", "pending"])
            );
            
            const querySnapshot = await getDocs(q);
            const bookedSlots = [];
            
            querySnapshot.forEach((doc) => {
                const booking = doc.data();
                if (booking.timeSlots) {
                    bookedSlots.push(...booking.timeSlots);
                }
            });
            
            // Filter out booked slots
            return baseSlots.map(slot => ({
                ...slot,
                isReserved: bookedSlots.includes(slot.time)
            }));
        } catch (error) {
            console.error("Error getting available time slots:", error);
            return this.generateTimeSlots();
        }
    }

    // Create a court booking in a specific project
    async createCourtBooking(projectId, bookingData) {
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

            const bookingRef = doc(collection(this.db, `projects/${projectId}/bookings`));
            const newBooking = {
                id: bookingRef.id,
                ...bookingData,
                projectId: projectId,
                createdAt: serverTimestamp(),
                status: "confirmed",
                type: "court"
            };

            console.log('Creating court booking:', newBooking);
            await setDoc(bookingRef, newBooking);
            return { success: true, bookingId: bookingRef.id, booking: newBooking };
        } catch (error) {
            console.error("Error creating court booking:", error);
            throw error;
        }
    }

    // Create an academy program booking in a specific project
    async createAcademyBooking(projectId, bookingData) {
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

            const bookingRef = doc(collection(this.db, `projects/${projectId}/bookings`));
            const newBooking = {
                id: bookingRef.id,
                ...bookingData,
                projectId: projectId,
                createdAt: serverTimestamp(),
                status: "confirmed",
                type: "academy"
            };

            console.log('Creating academy booking:', newBooking);
            await setDoc(bookingRef, newBooking);
            return { success: true, bookingId: bookingRef.id, booking: newBooking };
        } catch (error) {
            console.error("Error creating academy booking:", error);
            throw error;
        }
    }

    // Get user's bookings from a specific project
    async getUserBookings(projectId, userId) {
        try {
            const q = query(
                collection(this.db, `projects/${projectId}/bookings`),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            const bookings = [];
            
            querySnapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return bookings;
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    }

    // Get all bookings for a specific project (admin view)
    async getProjectBookings(projectId) {
        try {
            const q = query(
                collection(this.db, `projects/${projectId}/bookings`),
                orderBy("createdAt", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            const bookings = [];
            
            querySnapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return bookings;
        } catch (error) {
            console.error("Error fetching project bookings:", error);
            throw error;
        }
    }

    // Update booking status
    async updateBookingStatus(projectId, bookingId, newStatus) {
        try {
            const bookingRef = doc(this.db, `projects/${projectId}/bookings`, bookingId);
            await updateDoc(bookingRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error("Error updating booking status:", error);
            throw error;
        }
    }

    // Cancel a booking
    async cancelBooking(projectId, bookingId) {
        try {
            const bookingRef = doc(this.db, `projects/${projectId}/bookings`, bookingId);
            await updateDoc(bookingRef, {
                status: "cancelled",
                updatedAt: serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
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
