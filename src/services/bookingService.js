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

    // Check if a time slot is available
    async checkSlotAvailability(courtId, date, time) {
        try {
            const q = query(
                collection(this.db, "bookings"),
                where("courtId", "==", courtId),
                where("date", "==", date),
                where("time", "==", time),
                where("status", "in", ["confirmed", "pending"])
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error("Error checking slot availability:", error);
            return false;
        }
    }

    // Create a court booking
    async createCourtBooking(bookingData) {
        try {
            const bookingRef = doc(collection(this.db, "bookings"));
            const newBooking = {
                id: bookingRef.id,
                ...bookingData,
                createdAt: serverTimestamp(),
                status: "confirmed",
                type: "court"
            };

            await setDoc(bookingRef, newBooking);
            return { success: true, bookingId: bookingRef.id, booking: newBooking };
        } catch (error) {
            console.error("Error creating court booking:", error);
            throw error;
        }
    }

    // Create an academy program booking
    async createAcademyBooking(bookingData) {
        try {
            const bookingRef = doc(collection(this.db, "bookings"));
            const newBooking = {
                id: bookingRef.id,
                ...bookingData,
                createdAt: serverTimestamp(),
                status: "confirmed",
                type: "academy"
            };

            await setDoc(bookingRef, newBooking);
            return { success: true, bookingId: bookingRef.id, booking: newBooking };
        } catch (error) {
            console.error("Error creating academy booking:", error);
            throw error;
        }
    }

    // Get user's bookings
    async getUserBookings(userId, type = null) {
        try {
            let q;
            if (type) {
                q = query(
                    collection(this.db, "bookings"),
                    where("userId", "==", userId),
                    where("type", "==", type),
                    orderBy("createdAt", "desc")
                );
            } else {
                q = query(
                    collection(this.db, "bookings"),
                    where("userId", "==", userId),
                    orderBy("createdAt", "desc")
                );
            }
            
            const querySnapshot = await getDocs(q);
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            
            return bookings;
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    }

    // Cancel a booking
    async cancelBooking(bookingId) {
        try {
            const bookingRef = doc(this.db, "bookings", bookingId);
            await updateDoc(bookingRef, {
                status: "cancelled",
                cancelledAt: serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    }

    // Get available courts for a sport
    async getAvailableCourts(sport, date) {
        try {
            const q = query(
                collection(this.db, "courts"),
                where("sport", "==", sport),
                where("isActive", "==", true)
            );
            
            const querySnapshot = await getDocs(q);
            const courts = [];
            
            querySnapshot.forEach((doc) => {
                courts.push({ id: doc.id, ...doc.data() });
            });
            
            // Filter out courts that are fully booked for the given date
            const availableCourts = [];
            for (const court of courts) {
                const isAvailable = await this.checkCourtAvailability(court.id, date);
                if (isAvailable) {
                    availableCourts.push(court);
                }
            }
            
            return availableCourts;
        } catch (error) {
            console.error("Error fetching available courts:", error);
            throw error;
        }
    }

    // Check if a court has any available slots for a given date
    async checkCourtAvailability(courtId, date) {
        try {
            const q = query(
                collection(this.db, "bookings"),
                where("courtId", "==", courtId),
                where("date", "==", date),
                where("status", "in", ["confirmed", "pending"])
            );
            
            const querySnapshot = await getDocs(q);
            const bookedSlots = querySnapshot.size;
            
            // Assuming each court has 16 time slots (6 AM to 10 PM)
            const totalSlots = 16;
            return bookedSlots < totalSlots;
        } catch (error) {
            console.error("Error checking court availability:", error);
            return false;
        }
    }

    // Calculate booking price
    calculatePrice(courtPrice, selectedSlots) {
        return courtPrice * selectedSlots.length;
    }

    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time for display
    formatTime(time) {
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

export default new BookingService();
