import collectionQueryService from './collectionQueryService';

class ServiceCategoriesService {
  /**
   * Fetch all service categories for a project
   * @param {string} projectId - Project ID
   * @param {boolean} availableOnly - Whether to fetch only available categories
   * @returns {Promise<Array>} Array of service categories
   */
  async getServiceCategories(projectId, availableOnly = true) {
    try {
      const queryOptions = {
        orderBy: { field: 'createdAt', direction: 'desc' }
      };

      // If we want only available categories, add a where clause
      if (availableOnly) {
        queryOptions.where = [{ field: 'status', operator: '==', value: 'available' }];
      }

      const querySnapshot = await collectionQueryService.getDocsWithOptions(
        `projects/${projectId}/serviceCategories`,
        queryOptions
      );

      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Service categories fetched:', categories.length);
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
      const queryOptions = {
        orderBy: { field: 'createdAt', direction: 'desc' }
      };

      // If we want only available services, add a where clause
      if (availableOnly) {
        queryOptions.where = [{ field: 'status', operator: '==', value: 'available' }];
      }

      const querySnapshot = await collectionQueryService.getDocsWithOptions(
        `projects/${projectId}/serviceCategories/${categoryId}/services`,
        queryOptions
      );

      const services = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Services by category fetched:', services.length);
      return services;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }
}

const serviceCategoriesService = new ServiceCategoriesService();
export default serviceCategoriesService;
