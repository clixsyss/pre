import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

class ServiceCategoriesService {
  /**
   * Fetch all service categories for a project
   * @param {string} projectId - Project ID
   * @param {boolean} availableOnly - Whether to fetch only available categories
   * @returns {Promise<Array>} Array of service categories
   */
  async getServiceCategories(projectId, availableOnly = true) {
    try {
      const q = query(
        collection(db, `projects/${projectId}/serviceCategories`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      let categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by status if availableOnly is true
      if (availableOnly) {
        console.log('Filtering categories by status. Total before filter:', categories.length);
        console.log('Categories statuses:', categories.map(c => ({ title: c.englishTitle, status: c.status })));
        
        categories = categories.filter(category => {
          // Only show categories that are explicitly set to 'available'
          // If status is undefined, treat as draft (don't show)
          return category.status === 'available';
        });
        
        console.log('Categories after filter:', categories.length);
      }
      
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
      const q = query(
        collection(db, `projects/${projectId}/serviceCategories/${categoryId}/services`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      let services = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by status if availableOnly is true
      if (availableOnly) {
        console.log('Filtering services by status. Total before filter:', services.length);
        console.log('Services statuses:', services.map(s => ({ title: s.englishTitle, status: s.status })));
        
        services = services.filter(service => {
          // Only show services that are explicitly set to 'available'
          // If status is undefined, treat as draft (don't show)
          return service.status === 'available';
        });
        
        console.log('Services after filter:', services.length);
      }
      
      return services;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }
}

const serviceCategoriesService = new ServiceCategoriesService();
export default serviceCategoriesService;
