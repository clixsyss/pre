import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import serviceBookingService from '../services/serviceBookingService';
import firestoreService from '../services/firestoreService';

export const useServiceBookingStore = defineStore('serviceBooking', () => {
  // State
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lastFetchedKey = ref(null); // userId-projectId
  const lastFetchTime = ref(null);

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

  const fetchUserBookings = async (projectId, userId, force = false) => {
    // Check cache - if data exists for this user+project and was fetched recently, skip
    const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (bookings change more frequently)
    const now = Date.now();
    const cacheKey = `${projectId}-${userId}`;
    
    if (
      !force &&
      lastFetchedKey.value === cacheKey &&
      bookings.value.length > 0 &&
      lastFetchTime.value &&
      (now - lastFetchTime.value) < CACHE_DURATION
    ) {
      console.log('✨ Service bookings: Using cached data');
      return bookings.value;
    }
    
    try {
      loading.value = true;
      error.value = null;
      
      console.log('📡 Fetching service bookings from server...');
      const bookingsData = await serviceBookingService.getUserServiceBookings(projectId, userId);
      bookings.value = bookingsData;
      lastFetchedKey.value = cacheKey;
      lastFetchTime.value = now;
      
      console.log('✅ Service bookings fetched successfully:', bookingsData.length);
      return bookingsData;
    } catch (err) {
      console.error('❌ Error fetching service bookings:', err);
      error.value = err.message || 'Failed to fetch bookings';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearBookings = () => {
    bookings.value = [];
    lastFetchedKey.value = null;
    lastFetchTime.value = null;
  };

  const completeBooking = async (projectId, bookingId, reason = '') => {
    try {
      loading.value = true;
      error.value = null;
      
      await serviceBookingService.completeBooking(projectId, bookingId, reason);
      
      // Update local state
      const bookingIndex = bookings.value.findIndex(booking => booking.id === bookingId);
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex].status = 'closed';
        bookings.value[bookingIndex].updatedAt = new Date();
      }
      
      console.log('Service booking completed successfully');
    } catch (err) {
      console.error('Error completing service booking:', err);
      error.value = err.message || 'Failed to complete booking';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Subscribe to real-time updates for user bookings
  const subscribeToUserBookings = (projectId, userId, callback) => {
    if (!projectId || !userId) {
      console.warn('⚠️ Cannot subscribe to bookings - missing projectId or userId');
      return () => {};
    }

    console.log('🔔 Setting up real-time listener for service bookings:', { projectId, userId });

    try {
      const unsubscribe = firestoreService.subscribeToQuery(
        `projects/${projectId}/serviceBookings`,
        {
          filters: [{ field: 'userId', operator: '==', value: userId }],
          orderByField: 'createdAt',
          orderDirection: 'desc'
        },
        (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('📊 Real-time update: Service bookings changed:', bookingsData.length);
          bookings.value = bookingsData;
          
          // Update cache
          const cacheKey = `${projectId}-${userId}`;
          lastFetchedKey.value = cacheKey;
          lastFetchTime.value = Date.now();
          
          // Call the callback if provided
          if (callback) {
            callback(bookingsData);
          }
        },
        (err) => {
          console.error('❌ Real-time listener error:', err);
          error.value = err.message || 'Real-time update failed';
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('❌ Error setting up real-time listener:', err);
      return () => {};
    }
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
    clearBookings,
    completeBooking,
    subscribeToUserBookings
  };
});
