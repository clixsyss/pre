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

  // Getters
  const hasMultipleProjects = computed(() => userProjects.value.length > 1)
  const hasSelectedProject = computed(() => selectedProject.value !== null)
  const currentProjectServices = computed(() => {
    if (!selectedProject.value) return []
    return selectedProject.value.services || []
  })

  // Actions
  const fetchUserProjects = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('Fetching projects for user:', userId)
      
      // Get user document to find their projects
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        console.log('User document does not exist')
        throw new Error('User not found')
      }
      
      const userData = userDoc.data()
      console.log('User data:', userData)
      
      // Check if user has projects in the projects array
      const userProjects = userData.projects || []
      console.log('User projects from data:', userProjects)
      console.log('User projects length:', userProjects.length)
      
      if (userProjects.length === 0) {
        console.log('No projects found for user')
        userProjects.value = []
        return
      }
      
      // Fetch project details from the projects collection for each project ID
      const projectsData = []
      console.log('Starting to fetch project details...')
      
      for (const userProject of userProjects) {
        try {
          console.log('Processing user project:', userProject)
          const projectId = userProject.projectId || userProject.id
          console.log('Project ID:', projectId)
          
          if (projectId) {
            const projectRef = doc(db, 'projects', projectId)
            console.log('Fetching project document for ID:', projectId)
            const projectDoc = await getDoc(projectRef)
            
            if (projectDoc.exists()) {
              const projectData = projectDoc.data()
              console.log('Project data found:', projectData)
              projectsData.push({
                id: projectId,
                name: projectData.name || 'Unnamed Project',
                description: projectData.description || 'No description available',
                location: projectData.location || 'Location not set',
                status: projectData.status || 'active',
                type: projectData.type || 'residential',
                // User-specific project data
                userRole: userProject.role || 'member',
                userUnit: userProject.unit || 'N/A',
                registrationStatus: userProject.registrationStatus || 'unknown',
                registrationStep: userProject.registrationStep || 'unknown',
                updatedAt: userProject.updatedAt || null
              })
            } else {
              console.log('Project document does not exist for ID:', projectId)
              // If project document doesn't exist, create a fallback entry
              projectsData.push({
                id: projectId,
                name: `Project ${projectId.slice(-6)}`,
                description: 'Project details not available',
                location: 'Location not set',
                status: 'unknown',
                type: 'unknown',
                // User-specific project data
                userRole: userProject.role || 'member',
                userUnit: userProject.unit || 'N/A',
                registrationStatus: userProject.registrationStatus || 'unknown',
                registrationStep: userProject.registrationStep || 'unknown',
                updatedAt: userProject.updatedAt || null
              })
            }
          } else {
            console.log('No project ID found in userProject:', userProject)
          }
        } catch (err) {
          console.error(`Failed to fetch project ${userProject.projectId}:`, err)
          // Add fallback entry for failed projects
          const projectId = userProject.projectId || userProject.id
          projectsData.push({
            id: projectId,
            name: `Project ${projectId?.slice(-6) || 'Unknown'}`,
            description: 'Project details not available',
            location: 'Location not set',
            status: 'error',
            type: 'unknown',
            userRole: userProject.role || 'member',
            userUnit: userProject.unit || 'N/A',
            registrationStatus: userProject.registrationStatus || 'unknown',
            registrationStep: userProject.registrationStep || 'unknown',
            updatedAt: userProject.updatedAt || null
          })
        }
      }
      
      console.log('Fetched projects data:', projectsData)
      userProjects.value = projectsData
      console.log('Store userProjects after setting:', userProjects.value)
      
      // If user has only one project, auto-select it
      if (projectsData.length === 1) {
        selectedProject.value = projectsData[0]
        console.log('Auto-selected project:', selectedProject.value)
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
