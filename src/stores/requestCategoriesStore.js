import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import requestCategoriesService from '../services/requestCategoriesService';

export const useRequestCategoriesStore = defineStore('requestCategories', () => {
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
      const categoriesData = await requestCategoriesService.getRequestCategories(projectId, true);
      categories.value = categoriesData;
      
      console.log('Request categories fetched successfully:', categoriesData.length);
    } catch (err) {
      console.error('Error fetching request categories:', err);
      error.value = err.message || 'Failed to fetch request categories';
    } finally {
      loading.value = false;
    }
  };

  const getRequestCategoriesByCategory = async (projectId, categoryId) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Only fetch available request categories for mobile app
      const requestCategories = await requestCategoriesService.getRequestCategoriesByCategory(projectId, categoryId, true);
      return requestCategories;
    } catch (err) {
      console.error('Error fetching request categories by category:', err);
      error.value = err.message || 'Failed to fetch request categories';
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
    getRequestCategoriesByCategory,
    clearError,
    clearCategories
  };
});
