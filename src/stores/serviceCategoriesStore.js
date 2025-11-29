import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import serviceCategoriesService from '../services/serviceCategoriesService';

export const useServiceCategoriesStore = defineStore('serviceCategories', () => {
  // State
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lastFetchedProjectId = ref(null);
  const lastFetchTime = ref(null);

  // Getters
  const getCategories = computed(() => categories.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  // Actions
  const fetchCategories = async (projectId, force = false) => {
    // Check cache - if data exists for this project and was fetched recently, skip
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (
      !force &&
      lastFetchedProjectId.value === projectId &&
      categories.value.length > 0 &&
      lastFetchTime.value &&
      (now - lastFetchTime.value) < CACHE_DURATION
    ) {
      console.log('✨ Service categories: Using cached data');
      return categories.value;
    }
    
    try {
      loading.value = true;
      error.value = null;
      
      console.log('📡 Fetching service categories from server...');
      // Only fetch available categories for mobile app
      const categoriesData = await serviceCategoriesService.getServiceCategories(projectId, true);
      categories.value = categoriesData;
      lastFetchedProjectId.value = projectId;
      lastFetchTime.value = now;
      
      console.log('✅ Service categories fetched successfully:', categoriesData.length);
      return categoriesData;
    } catch (err) {
      console.error('❌ Error fetching service categories:', err);
      error.value = err.message || 'Failed to fetch service categories';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getServicesByCategory = async (projectId, categoryId) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Only fetch available services for mobile app
      const services = await serviceCategoriesService.getServicesByCategory(projectId, categoryId, true);
      return services;
    } catch (err) {
      console.error('Error fetching services by category:', err);
      error.value = err.message || 'Failed to fetch services';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCategories = () => {
    categories.value = [];
    lastFetchedProjectId.value = null;
    lastFetchTime.value = null;
  };

  return {
    // State
    categories,
    loading,
    error,
    
    // Getters
    getCategories,
    isLoading,
    getError,
    
    // Actions
    fetchCategories,
    getServicesByCategory,
    clearError,
    clearCategories
  };
});
