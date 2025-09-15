import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../boot/firebase';

const COLLECTION_NAME = 'projectGuidelines';

/**
 * Get all active guidelines for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of active guidelines
 */
export const getProjectGuidelines = async (projectId) => {
  try {
    const guidelinesRef = collection(db, 'projects', projectId, COLLECTION_NAME);
    const q = query(
      guidelinesRef, 
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching project guidelines:', error);
    throw error;
  }
};

/**
 * Get guidelines by category
 * @param {string} projectId - The project ID
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} Array of guidelines in the category
 */
export const getGuidelinesByCategory = async (projectId, category) => {
  try {
    const guidelinesRef = collection(db, 'projects', projectId, COLLECTION_NAME);
    const q = query(
      guidelinesRef, 
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching guidelines by category:', error);
    throw error;
  }
};

/**
 * Search guidelines by title or content
 * @param {string} projectId - The project ID
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching guidelines
 */
export const searchGuidelines = async (projectId, searchTerm) => {
  try {
    const guidelines = await getProjectGuidelines(projectId);
    const searchLower = searchTerm.toLowerCase();
    
    return guidelines.filter(guideline => 
      guideline.title.toLowerCase().includes(searchLower) ||
      guideline.content.toLowerCase().includes(searchLower) ||
      guideline.category.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching guidelines:', error);
    throw error;
  }
};
