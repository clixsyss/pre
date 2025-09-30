import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import firestoreService from '../services/firestoreService'

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
      console.log('ProjectStore: Fetching user document from Firestore...')
      const userDoc = await firestoreService.getDoc(`users/${userId}`)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      
      const userData = userDoc.data()
      console.log('ProjectStore: User document data:', userData)
      
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
            console.log('ProjectStore: Fetching projects using REST API...')
            
            // Fetch projects one by one using the unified firestoreService
            const projectPromises = projectIds.map(async (projectId) => {
              try {
                const projectDoc = await firestoreService.getDoc(`projects/${projectId}`)
                if (projectDoc.exists()) {
                  const projectData = projectDoc.data()
                  const userProject = userProjectsArray.find(up => (up.projectId || up.id) === projectId)
                  
                  return {
                    id: projectId,
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
                }
                return null
              } catch (err) {
                console.error(`Failed to fetch project ${projectId}:`, err)
                // Return fallback project data
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
              }
            })
            
            // Wait for all projects to be fetched and filter out nulls
            const projectResults = await Promise.all(projectPromises)
            projectsData.push(...projectResults.filter(Boolean))
          }
        } catch (err) {
          console.error('Error fetching projects in batch:', err)
        }
      }
      
      // Set the projects in the store
      userProjects.value = projectsData
      lastFetchTime.value = Date.now()
      console.log('ProjectStore: Successfully set projects in store:', projectsData.length, 'projects')
      
      // If user has only one project, auto-select it
      if (projectsData.length === 1) {
        selectedProject.value = projectsData[0]
        console.log('ProjectStore: Auto-selected single project:', projectsData[0].name)
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
      
      const snapshot = await firestoreService.getDocs('projects')
      
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
    localStorage.setItem('selectedProjectTimestamp', Date.now().toString())
    console.log('Project selected and saved to localStorage:', project.name)
    
    // Trigger data refresh for the new project
    console.log('Project changed, triggering data refresh...')
  }

  const validateSavedProject = (savedProjectId) => {
    if (!savedProjectId || userProjects.value.length === 0) {
      return false
    }
    
    // Check if the saved project ID exists in user's current projects
    const hasAccess = userProjects.value.some(p => p.id === savedProjectId)
    if (!hasAccess) {
      console.log('User no longer has access to saved project, clearing...')
      clearSelectedProject()
      return false
    }
    
    return true
  }

  const loadSelectedProject = () => {
    const savedProjectId = localStorage.getItem('selectedProjectId')
    const savedTimestamp = localStorage.getItem('selectedProjectTimestamp')
    
    console.log('ProjectStore: Attempting to load saved project:', {
      savedProjectId,
      savedTimestamp,
      availableProjects: userProjects.value.map(p => p.id),
      availableProjectNames: userProjects.value.map(p => p.name)
    })
    
    if (savedProjectId && userProjects.value.length > 0) {
      // Check if the saved selection is not too old (24 hours)
      const now = Date.now()
      const savedTime = parseInt(savedTimestamp || '0')
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      
      if (now - savedTime > maxAge) {
        console.log('Saved project selection is too old, clearing...')
        clearSelectedProject()
        return false
      }
      
      // Validate that user still has access to this project
      if (!validateSavedProject(savedProjectId)) {
        console.log('ProjectStore: User no longer has access to saved project:', savedProjectId)
        return false
      }
      
      const project = userProjects.value.find(p => p.id === savedProjectId)
      if (project) {
        selectedProject.value = project
        console.log('ProjectStore: Restored selected project from localStorage:', project.name)
        return true
      } else {
        console.log('ProjectStore: Saved project not found in available projects:', savedProjectId)
      }
    } else {
      console.log('ProjectStore: No saved project ID or no projects available')
    }
    return false
  }

  const rehydrateStore = async (userId) => {
    try {
      console.log('ProjectStore: Starting rehydration for user:', userId)
      
      // Check if we already have projects for this user and they're recent
      const now = Date.now()
      if (userProjects.value.length > 0 && (now - lastFetchTime.value) < cacheDuration) {
        console.log('ProjectStore: Using cached projects, attempting to restore selection')
        const restored = loadSelectedProject()
        if (restored) {
          console.log('ProjectStore: Successfully restored from cache')
          return true
        }
      }
      
      // If no projects or couldn't restore, fetch projects
      console.log('ProjectStore: No cached projects, fetching from Firestore...')
      await fetchUserProjects(userId)
      
      // Try to restore again after fetching
      const restored = loadSelectedProject()
      if (restored) {
        console.log('ProjectStore: Successfully restored after fetch')
        return true
      }
      
      // If still no project selected and user has only one project, auto-select it
      if (userProjects.value.length === 1) {
        selectProject(userProjects.value[0])
        console.log('ProjectStore: Auto-selected single project:', userProjects.value[0].name)
        return true
      }
      
      // If user has multiple projects and no saved selection, auto-select the first one
      if (userProjects.value.length > 1) {
        selectProject(userProjects.value[0])
        console.log('ProjectStore: Auto-selected first project for user with multiple projects:', userProjects.value[0].name)
        return true
      }
      
      console.log('ProjectStore: Rehydration completed, projects available:', userProjects.value.length)
      return false
    } catch (error) {
      console.error('Error rehydrating project store:', error)
      return false
    }
  }

  const clearSelectedProject = () => {
    selectedProject.value = null
    localStorage.removeItem('selectedProjectId')
    localStorage.removeItem('selectedProjectTimestamp')
  }

  const resetStore = () => {
    userProjects.value = []
    selectedProject.value = null
    availableProjects.value = []
    loading.value = false
    error.value = null
    localStorage.removeItem('selectedProjectId')
    localStorage.removeItem('selectedProjectTimestamp')
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const debugState = () => {
    console.log('=== PROJECT STORE DEBUG ===')
    console.log('User Projects Count:', userProjects.value.length)
    console.log('Selected Project:', selectedProject.value?.name || 'None')
    console.log('LocalStorage Project ID:', localStorage.getItem('selectedProjectId'))
    console.log('LocalStorage Timestamp:', localStorage.getItem('selectedProjectTimestamp'))
    console.log('Has Selected Project:', hasSelectedProject.value)
    console.log('Loading:', loading.value)
    console.log('Error:', error.value)
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
    rehydrateStore,
    validateSavedProject,
    clearSelectedProject,
    resetStore,
    setLoading,
    debugState
  }
})
