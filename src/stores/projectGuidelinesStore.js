import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  getProjectGuidelines, 
  searchGuidelines,
  getPDFGuidelines,
  getLatestPDFGuideline
} from '../services/projectGuidelinesService';

export const useProjectGuidelinesStore = defineStore('projectGuidelines', () => {
  // State
  const guidelines = ref([]);
  const pdfGuidelines = ref([]);
  const latestPDFGuideline = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const searchTerm = ref('');
  const selectedCategory = ref('all');

  // Getters
  const getGuidelines = computed(() => guidelines.value);
  const pdfGuidelinesList = computed(() => pdfGuidelines.value);
  const latestPDFGuidelineData = computed(() => latestPDFGuideline.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  const getGuidelinesByCategory = computed(() => {
    if (selectedCategory.value === 'all') {
      return guidelines.value;
    }
    return guidelines.value.filter(guideline => guideline.category === selectedCategory.value);
  });

  const getFilteredGuidelines = computed(() => {
    let filtered = getGuidelinesByCategory.value;

    if (searchTerm.value) {
      const searchLower = searchTerm.value.toLowerCase();
      filtered = filtered.filter(guideline =>
        guideline.title.toLowerCase().includes(searchLower) ||
        guideline.content.toLowerCase().includes(searchLower) ||
        guideline.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  });

  const getCategories = computed(() => {
    const categories = [...new Set(guidelines.value.map(guideline => guideline.category))];
    return categories.map(category => ({
      value: category,
      label: formatCategoryLabel(category),
      color: getCategoryColor(category)
    }));
  });

  const getHighPriorityGuidelines = computed(() => {
    return guidelines.value.filter(guideline => guideline.priority === 'high');
  });

  const getGuidelinesByPriority = computed(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...guidelines.value].sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  });

  // Actions
  const fetchGuidelines = async (projectId) => {
    if (!projectId) {
      console.log('No project ID provided for fetching guidelines');
      return;
    }
    
    try {
      console.log('Store: Fetching guidelines for project:', projectId);
      loading.value = true;
      error.value = null;
      const data = await getProjectGuidelines(projectId);
      console.log('Store: Received guidelines data:', data);
      guidelines.value = data;
    } catch (err) {
      error.value = 'Failed to load project guidelines';
      console.error('Store: Error fetching guidelines:', err);
    } finally {
      loading.value = false;
    }
  };

  const searchGuidelinesAction = async (projectId, term) => {
    if (!projectId || !term) return;
    
    try {
      loading.value = true;
      error.value = null;
      const data = await searchGuidelines(projectId, term);
      guidelines.value = data;
    } catch (err) {
      error.value = 'Failed to search guidelines';
      console.error('Error searching guidelines:', err);
    } finally {
      loading.value = false;
    }
  };

  const setSearchTerm = (term) => {
    searchTerm.value = term;
  };

  const setSelectedCategory = (category) => {
    selectedCategory.value = category;
  };

  const clearError = () => {
    error.value = null;
  };

  const clearGuidelines = () => {
    guidelines.value = [];
    pdfGuidelines.value = [];
    latestPDFGuideline.value = null;
    searchTerm.value = '';
    selectedCategory.value = 'all';
  };

  // PDF Guidelines Actions
  const fetchPDFGuidelines = async (projectId) => {
    if (!projectId) {
      console.log('No project ID provided for fetching PDF guidelines');
      return;
    }
    
    try {
      console.log('Store: Fetching PDF guidelines for project:', projectId);
      loading.value = true;
      error.value = null;
      const data = await getPDFGuidelines(projectId);
      console.log('Store: Received PDF guidelines data:', data);
      pdfGuidelines.value = data;
    } catch (err) {
      error.value = 'Failed to load PDF guidelines';
      console.error('Store: Error fetching PDF guidelines:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchLatestPDFGuideline = async (projectId) => {
    if (!projectId) {
      console.log('No project ID provided for fetching latest PDF guideline');
      return;
    }
    
    try {
      console.log('Store: Fetching latest PDF guideline for project:', projectId);
      loading.value = true;
      error.value = null;
      const data = await getLatestPDFGuideline(projectId);
      console.log('Store: Received latest PDF guideline data:', data);
      latestPDFGuideline.value = data;
    } catch (err) {
      error.value = 'Failed to load latest PDF guideline';
      console.error('Store: Error fetching latest PDF guideline:', err);
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const formatCategoryLabel = (category) => {
    const categoryLabels = {
      general: 'General',
      safety: 'Safety',
      maintenance: 'Maintenance',
      rules: 'Rules & Regulations',
      procedures: 'Procedures',
      emergency: 'Emergency'
    };
    return categoryLabels[category] || category;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      general: '#6b7280',
      safety: '#dc2626',
      maintenance: '#2563eb',
      rules: '#d97706',
      procedures: '#16a34a',
      emergency: '#ea580c'
    };
    return categoryColors[category] || '#6b7280';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityInfo = (priority) => {
    const priorityInfo = {
      high: { label: 'High Priority', color: '#dc2626', bgColor: '#fee2e2' },
      medium: { label: 'Medium Priority', color: '#d97706', bgColor: '#fef3c7' },
      low: { label: 'Low Priority', color: '#16a34a', bgColor: '#d1fae5' }
    };
    return priorityInfo[priority] || priorityInfo.medium;
  };

  return {
    // State
    guidelines,
    pdfGuidelines,
    latestPDFGuideline,
    loading,
    error,
    searchTerm,
    selectedCategory,
    
    // Getters
    getGuidelines,
    pdfGuidelinesList,
    latestPDFGuidelineData,
    isLoading,
    getError,
    getGuidelinesByCategory,
    getFilteredGuidelines,
    getCategories,
    getHighPriorityGuidelines,
    getGuidelinesByPriority,
    
    // Actions
    fetchGuidelines,
    fetchPDFGuidelines,
    fetchLatestPDFGuideline,
    searchGuidelinesAction,
    setSearchTerm,
    setSelectedCategory,
    clearError,
    clearGuidelines,
    
    // Helper functions
    formatCategoryLabel,
    getCategoryColor,
    formatDate,
    getPriorityInfo
  };
});
