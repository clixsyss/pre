import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import serviceCategoriesService from '../services/serviceCategoriesService';

export const useServiceCategoriesStore = defineStore('serviceCategories', () => {
  // State
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getCategories = computed(() => categories.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  // Actions
  const fetchCategories = async (projectId) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Only fetch available categories for mobile app
      const categoriesData = await serviceCategoriesService.getServiceCategories(projectId, true);
      categories.value = categoriesData;
      
      console.log('Service categories fetched successfully:', categoriesData.length);
    } catch (err) {
      console.error('Error fetching service categories:', err);
      error.value = err.message || 'Failed to fetch service categories';
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
