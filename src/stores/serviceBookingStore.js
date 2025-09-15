import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import serviceBookingService from '../services/serviceBookingService';

export const useServiceBookingStore = defineStore('serviceBooking', () => {
  // State
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getBookings = computed(() => bookings.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  // Get upcoming bookings (next 30 days)
  const getUpcomingBookings = computed(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return bookings.value.filter(booking => {
      const bookingDate = new Date(booking.selectedDate);
      return bookingDate >= now && bookingDate <= thirtyDaysFromNow && booking.status !== 'cancelled';
    });
  });

  // Get bookings for calendar (next 90 days)
  const getCalendarBookings = computed(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    return bookings.value.filter(booking => {
      const bookingDate = new Date(booking.selectedDate);
      return bookingDate >= now && bookingDate <= ninetyDaysFromNow && booking.status !== 'cancelled';
    });
  });

  // Actions
  const createBooking = async (projectId, bookingData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const bookingId = await serviceBookingService.createServiceBooking(projectId, bookingData);
      
      // Add the new booking to the local state
      const newBooking = {
        id: bookingId,
        ...bookingData,
        projectId,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      bookings.value.unshift(newBooking);
      
      return bookingId;
    } catch (err) {
      console.error('Error creating service booking:', err);
      error.value = err.message || 'Failed to create booking';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserBookings = async (projectId, userId) => {
    try {
      loading.value = true;
      error.value = null;
      
      const bookingsData = await serviceBookingService.getUserServiceBookings(projectId, userId);
      bookings.value = bookingsData;
      
      console.log('Service bookings fetched successfully:', bookingsData.length);
    } catch (err) {
      console.error('Error fetching service bookings:', err);
      error.value = err.message || 'Failed to fetch bookings';
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearBookings = () => {
    bookings.value = [];
  };

  return {
    // State
    bookings,
    loading,
    error,
    
    // Getters
    getBookings,
    isLoading,
    getError,
    getUpcomingBookings,
    getCalendarBookings,
    
    // Actions
    createBooking,
    fetchUserBookings,
    clearError,
    clearBookings
  };
});
