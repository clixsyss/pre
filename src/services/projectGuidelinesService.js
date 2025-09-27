import firestoreService from './firestoreService'
import performanceService from './performanceService'
import errorHandlingService from './errorHandlingService'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'

const COLLECTION_NAME = 'projectGuidelines';

/**
 * Get all active guidelines for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of active guidelines
 */
export const getProjectGuidelines = async (projectId) => {
  return performanceService.timeOperation('getProjectGuidelines', async () => {
    try {
      console.log('🔍 Fetching guidelines for project:', projectId);
      
      const collectionPath = `projects/${projectId}/${COLLECTION_NAME}`
      const filters = {
        isActive: { operator: '==', value: true }
      }
      
      const result = await firestoreService.getDocs(collectionPath, filters)
      const guidelines = result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in JavaScript to avoid composite index requirements
      const sortedGuidelines = guidelines.sort((a, b) => {
        // First by priority (high = 3, medium = 2, low = 1)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by creation date
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      
      console.log('✅ Project guidelines retrieved:', { count: sortedGuidelines.length })
      return sortedGuidelines;
    } catch (error) {
      console.error('❌ Error fetching project guidelines:', error);
      errorHandlingService.handleFirestoreError(error, 'getProjectGuidelines')
      throw error;
    }
  })
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
      (guideline.content && guideline.content.toLowerCase().includes(searchLower)) ||
      (guideline.category && guideline.category.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error searching guidelines:', error);
    throw error;
  }
};

/**
 * Get PDF guidelines for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of PDF guidelines
 */
export const getPDFGuidelines = async (projectId) => {
  try {
    console.log('Fetching PDF guidelines for project:', projectId);
    const guidelinesRef = collection(db, 'projects', projectId, COLLECTION_NAME);
    
    const q = query(
      guidelinesRef, 
      where('isActive', '==', true),
      where('type', '==', 'pdf')
    );
    const querySnapshot = await getDocs(q);
    
    const guidelines = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by priority and creation date
    return guidelines.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Error fetching PDF guidelines:', error);
    throw error;
  }
};

/**
 * Get the latest PDF guideline for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object|null>} Latest PDF guideline or null
 */
export const getLatestPDFGuideline = async (projectId) => {
  try {
    const pdfGuidelines = await getPDFGuidelines(projectId);
    return pdfGuidelines.length > 0 ? pdfGuidelines[0] : null;
  } catch (error) {
    console.error('Error fetching latest PDF guideline:', error);
    throw error;
  }
};
