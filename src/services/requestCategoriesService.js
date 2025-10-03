import fastCollectionService from './fastCollectionService';

class RequestCategoriesService {
  /**
   * Fetch all request categories for a project
   * @param {string} projectId - Project ID
   * @param {boolean} availableOnly - Whether to fetch only available categories
   * @returns {Promise<Array>} Array of request categories
   */
  async getRequestCategories(projectId, availableOnly = true) {
    try {
      console.log('🚀 RequestCategoriesService: Getting categories for project:', projectId);
      const categories = await fastCollectionService.getRequestCategories(projectId, availableOnly);
      console.log('🚀 RequestCategoriesService: Retrieved categories:', categories.length);
      return categories;
    } catch (error) {
      console.error('Error fetching request categories:', error);
      throw error;
    }
  }

  /**
   * Fetch request categories for a specific category
   * @param {string} projectId - Project ID
   * @param {string} categoryId - Category ID
   * @param {boolean} availableOnly - Whether to fetch only available request categories
   * @returns {Promise<Array>} Array of request categories in the category
   */
  async getRequestCategoriesByCategory(projectId, categoryId, availableOnly = true) {
    try {
      console.log('🚀 RequestCategoriesService: Getting request categories for category:', categoryId);
      const requestCategories = await fastCollectionService.getRequestCategoriesByCategory(projectId, categoryId, availableOnly);
      console.log('🚀 RequestCategoriesService: Retrieved request categories:', requestCategories.length);
      return requestCategories;
    } catch (error) {
      console.error('Error fetching request categories by category:', error);
      throw error;
    }
  }
}

const requestCategoriesService = new RequestCategoriesService();
export default requestCategoriesService;
