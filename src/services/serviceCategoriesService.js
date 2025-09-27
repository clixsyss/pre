import fastCollectionService from './fastCollectionService';

class ServiceCategoriesService {
  /**
   * Fetch all service categories for a project
   * @param {string} projectId - Project ID
   * @param {boolean} availableOnly - Whether to fetch only available categories
   * @returns {Promise<Array>} Array of service categories
   */
  async getServiceCategories(projectId, availableOnly = true) {
    try {
      console.log('🚀 ServiceCategoriesService: Getting categories for project:', projectId);
      const categories = await fastCollectionService.getServiceCategories(projectId, availableOnly);
      console.log('🚀 ServiceCategoriesService: Retrieved categories:', categories.length);
      return categories;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  }

  /**
   * Fetch services for a specific category
   * @param {string} projectId - Project ID
   * @param {string} categoryId - Category ID
   * @param {boolean} availableOnly - Whether to fetch only available services
   * @returns {Promise<Array>} Array of services in the category
   */
  async getServicesByCategory(projectId, categoryId, availableOnly = true) {
    try {
      console.log('🚀 ServiceCategoriesService: Getting services for category:', categoryId);
      const services = await fastCollectionService.getServicesByCategory(projectId, categoryId, availableOnly);
      console.log('🚀 ServiceCategoriesService: Retrieved services:', services.length);
      return services;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }
}

const serviceCategoriesService = new ServiceCategoriesService();
export default serviceCategoriesService;
