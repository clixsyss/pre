import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'

class ServiceTimeSlotService {
  constructor() {
    // No need for db reference - using firestoreService
  }

  // Generate available time slots for a given day
  generateTimeSlots(startHour = 9, endHour = 17, intervalMinutes = 30) {
    const slots = [];
    const startTime = startHour * 60; // Convert to minutes
    const endTime = endHour * 60; // Convert to minutes
    
    for (let time = startTime; time < endTime; time += intervalMinutes) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      slots.push({
        time: timeString,
        displayTime: timeString,
        isReserved: false
      });
    }

    return slots;
  }

  // Get available time slots for a specific service and date
  async getAvailableTimeSlots(projectId, serviceId, categoryId, date) {
    return performanceService.timeOperation('getAvailableTimeSlots', async () => {
      try {
        console.log('🚀 Getting available time slots:', { projectId, serviceId, categoryId, date })
        
        // First, get the category details to get its time slot configuration
        const categoryDoc = await this.getCategoryDetails(projectId, categoryId);
        
        let baseSlots;
        if (categoryDoc && categoryDoc.timeSlotInterval) {
          // Use category-specific time slot configuration
          // Get the day of the week for the selected date
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const dayKey = dayOfWeek;
          
          const daySchedule = categoryDoc.availability?.[dayKey];
          
          if (daySchedule && daySchedule.available) {
            const startHour = parseInt(daySchedule.startTime.split(':')[0]);
            const endHour = parseInt(daySchedule.endTime.split(':')[0]);
            const intervalMinutes = categoryDoc.timeSlotInterval || 30;
            baseSlots = this.generateTimeSlots(startHour, endHour, intervalMinutes);
          } else {
            // Day not available, return empty slots
            console.log('🚀 ServiceTimeSlotService: Day not available for service')
            return [];
          }
        } else {
          // Fallback to default time slots
          baseSlots = this.generateTimeSlots();
        }
        
        // Check which slots are already booked for this service on this date
        const collectionPath = `projects/${projectId}/serviceBookings`
        const queryOptions = {
          filters: [
            { field: "serviceId", operator: "==", value: serviceId },
            { field: "selectedDate", operator: "==", value: date },
            { field: "status", operator: "in", value: ["open", "processing"] }
          ],
          timeoutMs: 6000
        };
        
        const queryResult = await firestoreService.getDocs(collectionPath, queryOptions);
        const bookedSlots = [];
        
        if (queryResult.docs && queryResult.docs.length > 0) {
          queryResult.docs.forEach((doc) => {
            const booking = doc.data;
            if (booking.selectedTime) {
              bookedSlots.push(booking.selectedTime);
            }
          });
        }
        
        // Filter out booked slots
        const availableSlots = baseSlots.map(slot => ({
          ...slot,
          isReserved: bookedSlots.includes(slot.time)
        }));
        
        console.log('🚀 ServiceTimeSlotService: Generated', availableSlots.length, 'time slots')
        return availableSlots;
      } catch (error) {
        console.error('❌ Error getting available time slots:', error);
        errorHandlingService.handleFirestoreError(error, 'getAvailableTimeSlots')
        return [];
      }
    })
  }

  // Get category details to retrieve time slot configuration
  async getCategoryDetails(projectId, categoryId) {
    return performanceService.timeOperation('getCategoryDetails', async () => {
      try {
        console.log('🚀 Getting category details:', { projectId, categoryId })
        
        const docPath = `projects/${projectId}/serviceCategories/${categoryId}`;
        const result = await firestoreService.getDoc(docPath);
        
        if (result.exists) {
          console.log('🚀 ServiceTimeSlotService: Retrieved category details')
          return result.data;
        } else {
          console.log('🚀 ServiceTimeSlotService: Category not found')
          return null;
        }
      } catch (error) {
        console.error('❌ Error getting category details:', error);
        errorHandlingService.handleFirestoreError(error, 'getCategoryDetails')
        return null;
      }
    })
  }

  // Check if a specific time slot is available
  async checkSlotAvailability(projectId, serviceId, date, time) {
    return performanceService.timeOperation('checkSlotAvailability', async () => {
      try {
        console.log('🚀 Checking slot availability:', { projectId, serviceId, date, time })
        
        const collectionPath = `projects/${projectId}/serviceBookings`
        const queryOptions = {
          filters: [
            { field: "serviceId", operator: "==", value: serviceId },
            { field: "selectedDate", operator: "==", value: date },
            { field: "selectedTime", operator: "==", value: time },
            { field: "status", operator: "in", value: ["open", "processing"] }
          ],
          timeoutMs: 6000
        };
        
        const queryResult = await firestoreService.getDocs(collectionPath, queryOptions);
        const isAvailable = !queryResult.docs || queryResult.docs.length === 0;
        
        console.log('🚀 ServiceTimeSlotService: Slot availability:', isAvailable ? 'available' : 'booked')
        return isAvailable;
      } catch (error) {
        console.error('❌ Error checking slot availability:', error);
        errorHandlingService.handleFirestoreError(error, 'checkSlotAvailability')
        return false;
      }
    })
  }
}

export default new ServiceTimeSlotService();