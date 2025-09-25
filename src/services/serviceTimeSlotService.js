import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class ServiceTimeSlotService {
  constructor() {
    this.db = db;
  }

  // Generate available time slots for a given day
  generateTimeSlots(startHour = 9, endHour = 17, intervalMinutes = 30) {
    const slots = [];
    
    // Use a fixed date to avoid timezone issues
    const baseDate = new Date('2000-01-01T00:00:00');
    const startTime = new Date(baseDate);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(baseDate);
    endTime.setHours(endHour, 0, 0, 0);

    while (startTime < endTime) {
      slots.push({
        time: startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        isReserved: false,
        startTime: new Date(startTime),
        endTime: new Date(startTime.getTime() + (intervalMinutes * 60000))
      });
      startTime.setMinutes(startTime.getMinutes() + intervalMinutes);
    }
    
    return slots;
  }

  // Get available time slots for a specific service and date
  async getAvailableTimeSlots(projectId, serviceId, categoryId, date) {
    try {
      // First, get the category details to get its time slot configuration
      const categoryDoc = await this.getCategoryDetails(projectId, categoryId);
      
      let baseSlots;
      if (categoryDoc && categoryDoc.timeSlotInterval) {
        // Use category-specific time slot configuration
        // Get the day of the week for the selected date
        const dayOfWeek = new Date(date).toLocaleLowerCase().slice(0, 3);
        const dayKey = dayOfWeek === 'sun' ? 'sunday' : 
                     dayOfWeek === 'mon' ? 'monday' :
                     dayOfWeek === 'tue' ? 'tuesday' :
                     dayOfWeek === 'wed' ? 'wednesday' :
                     dayOfWeek === 'thu' ? 'thursday' :
                     dayOfWeek === 'fri' ? 'friday' : 'saturday';
        
        const daySchedule = categoryDoc.availability?.[dayKey];
        
        if (daySchedule && daySchedule.available) {
          const startHour = parseInt(daySchedule.startTime.split(':')[0]);
          const endHour = parseInt(daySchedule.endTime.split(':')[0]);
          const intervalMinutes = categoryDoc.timeSlotInterval || 30;
          baseSlots = this.generateTimeSlots(startHour, endHour, intervalMinutes);
        } else {
          // Day not available, return empty slots
          return [];
        }
      } else {
        // Fallback to default time slots
        baseSlots = this.generateTimeSlots();
      }
      
      // Check which slots are already booked for this service on this date
      const q = query(
        collection(this.db, `projects/${projectId}/serviceBookings`),
        where("serviceId", "==", serviceId),
        where("selectedDate", "==", date),
        where("status", "in", ["open", "processing"])
      );
      
      const querySnapshot = await getDocs(q);
      const bookedSlots = [];
      
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.selectedTime) {
          bookedSlots.push(booking.selectedTime);
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

  // Get category details to retrieve time slot configuration
  async getCategoryDetails(projectId, categoryId) {
    try {
      const categoryRef = doc(this.db, `projects/${projectId}/serviceCategories`, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        return { id: categorySnap.id, ...categorySnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting category details:", error);
      return null;
    }
  }

  // Check if a specific time slot is available
  async checkSlotAvailability(projectId, serviceId, date, time) {
    try {
      const q = query(
        collection(this.db, `projects/${projectId}/serviceBookings`),
        where("serviceId", "==", serviceId),
        where("selectedDate", "==", date),
        where("selectedTime", "==", time),
        where("status", "in", ["open", "processing"])
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }
}

export default new ServiceTimeSlotService();
