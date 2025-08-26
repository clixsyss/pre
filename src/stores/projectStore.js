import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../boot/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export const useProjectStore = defineStore('project', () => {
  // State
  const userProjects = ref([])
  const selectedProject = ref(null)
  const availableProjects = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Cache management
  const lastFetchTime = ref(0)
  const cacheDuration = 5 * 60 * 1000 // 5 minutes

  // Getters
  const hasMultipleProjects = computed(() => userProjects.value.length > 1)
  const hasSelectedProject = computed(() => selectedProject.value !== null)
  const currentProjectServices = computed(() => {
    if (!selectedProject.value) return []
    return selectedProject.value.services || []
  })

  // Actions
  const fetchUserProjects = async (userId) => {
    // Check cache first
    const now = Date.now()
    if (userProjects.value.length > 0 && (now - lastFetchTime.value) < cacheDuration) {
      console.log('Using cached projects data')
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Get user document to find their projects
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      
      const userData = userDoc.data()
      
      // Check if user has projects in the projects array
      const userProjectsArray = userData.projects || []
      
      if (userProjectsArray.length === 0) {
        userProjects.value = []
        return
      }
      
      // Fetch all projects at once for better performance
      const projectsData = []
      
      if (userProjectsArray.length > 0) {
        try {
          // Get all project IDs
          const projectIds = userProjectsArray.map(up => up.projectId || up.id).filter(Boolean)
          
          if (projectIds.length > 0) {
            // Use getDocs with 'in' query for much faster batch fetching
            const { query, where, getDocs } = await import('firebase/firestore')
            
            // Split into chunks of 10 (Firestore 'in' query limit)
            const chunkSize = 10
            const projectChunks = []
            for (let i = 0; i < projectIds.length; i += chunkSize) {
              projectChunks.push(projectIds.slice(i, i + chunkSize))
            }
            
            // Fetch all chunks in parallel
            const chunkPromises = projectChunks.map(async (chunk) => {
              try {
                const projectsRef = collection(db, 'projects')
                const q = query(projectsRef, where('__name__', 'in', chunk))
                const snapshot = await getDocs(q)
                
                return snapshot.docs.map(doc => {
                  const projectData = doc.data()
                  const userProject = userProjectsArray.find(up => (up.projectId || up.id) === doc.id)
                  
                  return {
                    id: doc.id,
                    name: projectData.name || 'Unnamed Project',
                    description: projectData.description || 'No description available',
                    location: projectData.location || 'Location not set',
                    status: projectData.status || 'active',
                    type: projectData.type || 'residential',
                    // User-specific project data
                    userRole: userProject?.role || 'member',
                    userUnit: userProject?.unit || 'N/A',
                    registrationStatus: userProject?.registrationStatus || 'unknown',
                    registrationStep: userProject?.registrationStep || 'unknown',
                    updatedAt: userProject?.updatedAt || null
                  }
                })
              } catch (err) {
                console.error(`Failed to fetch project chunk:`, err)
                // Fallback to individual fetches for failed chunks
                return chunk.map(projectId => {
                  const userProject = userProjectsArray.find(up => (up.projectId || up.id) === projectId)
                  return {
                    id: projectId,
                    name: `Project ${projectId.slice(-6)}`,
                    description: 'Project details not available',
                    location: 'Location not set',
                    status: 'unknown',
                    type: 'unknown',
                    userRole: userProject?.role || 'member',
                    userUnit: userProject?.unit || 'N/A',
                    registrationStatus: userProject?.registrationStatus || 'unknown',
                    registrationStep: userProject?.registrationStep || 'unknown',
                    updatedAt: userProject?.updatedAt || null
                  }
                })
              }
            })
            
            // Wait for all chunks to be fetched and flatten results
            const chunkResults = await Promise.all(chunkPromises)
            projectsData.push(...chunkResults.flat())
          }
        } catch (err) {
          console.error('Error fetching projects in batch:', err)
        }
      }
      
      // Set the projects in the store
      userProjects.value = projectsData
      lastFetchTime.value = Date.now()
      
      // If user has only one project, auto-select it
      if (projectsData.length === 1) {
        selectedProject.value = projectsData[0]
      }
      
    } catch (err) {
      console.error('Error fetching user projects:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableProjects = async () => {
    try {
      loading.value = true
      error.value = null
      
      const projectsRef = collection(db, 'projects')
      const snapshot = await getDocs(projectsRef)
      
      availableProjects.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
    } catch (err) {
      console.error('Error fetching available projects:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Removed unused fetchProjectsByIds method

  const selectProject = (project) => {
    selectedProject.value = project
    // Store selection in localStorage for persistence
    localStorage.setItem('selectedProjectId', project.id)
  }

  const loadSelectedProject = () => {
    const savedProjectId = localStorage.getItem('selectedProjectId')
    if (savedProjectId && userProjects.value.length > 0) {
      const project = userProjects.value.find(p => p.id === savedProjectId)
      if (project) {
        selectedProject.value = project
      }
    }
  }

  const clearSelectedProject = () => {
    selectedProject.value = null
    localStorage.removeItem('selectedProjectId')
  }

  const resetStore = () => {
    userProjects.value = []
    selectedProject.value = null
    availableProjects.value = []
    loading.value = false
    error.value = null
    localStorage.removeItem('selectedProjectId')
  }

  return {
    // State
    userProjects,
    selectedProject,
    availableProjects,
    loading,
    error,
    
    // Getters
    hasMultipleProjects,
    hasSelectedProject,
    currentProjectServices,
    
    // Actions
    fetchUserProjects,
    fetchAvailableProjects,
    selectProject,
    loadSelectedProject,
    clearSelectedProject,
    resetStore
  }
})
