import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserById } from '../services/dynamoDBUsersService'
import { getProjectById } from '../services/dynamoDBProjectsService'
// NO FIREBASE/FIRESTORE IMPORTS - DynamoDB only

export const useProjectStore = defineStore('project', () => {
  // State
  const userProjects = ref([]) // Array of project-unit combinations
  const selectedProject = ref(null)
  const selectedUnit = ref(null) // New: Track selected unit
  const availableProjects = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Cache management (Extended for cost optimization)
  const lastFetchTime = ref(0)
  const cacheDuration = 24 * 60 * 60 * 1000 // 24 hours

  // Getters
  const hasMultipleProjects = computed(() => userProjects.value.length > 1)
  const hasSelectedProject = computed(() => selectedProject.value !== null && selectedUnit.value !== null)
  
  // New: Get unique project-unit combinations grouped by project
  const projectsByGroup = computed(() => {
    const grouped = {}
    userProjects.value.forEach(proj => {
      if (!grouped[proj.id]) {
        grouped[proj.id] = {
          id: proj.id,
          name: proj.name,
          description: proj.description,
          location: proj.location,
          status: proj.status,
          type: proj.type,
          units: []
        }
      }
      grouped[proj.id].units.push({
        unit: proj.userUnit,
        role: proj.userRole,
        registrationStatus: proj.registrationStatus,
        registrationStep: proj.registrationStep,
        updatedAt: proj.updatedAt
      })
    })
    return Object.values(grouped)
  })
  
  // New: Check if user has multiple units across all projects
  const hasMultipleUnits = computed(() => userProjects.value.length > 1)
  
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
      console.log('ProjectStore: Fetching user document from DynamoDB...')
      let userData
      try {
        userData = await getUserById(userId)
        
        // If getUserById returns null and userId looks like an email, try to get Cognito sub ID
        if (!userData && userId && userId.includes('@')) {
          console.log('ProjectStore: User not found by email, trying to get Cognito sub ID...')
          // Import optimizedAuthService to get the actual Cognito sub ID
          const { default: optimizedAuthService } = await import('../services/optimizedAuthService')
          const currentUser = await optimizedAuthService.getCurrentUser()
          if (currentUser && currentUser.id) {
            console.log('ProjectStore: Found Cognito sub ID, trying again:', currentUser.id)
            userData = await getUserById(currentUser.id)
          } else if (currentUser && currentUser.userSub) {
            console.log('ProjectStore: Found Cognito userSub, trying again:', currentUser.userSub)
            userData = await getUserById(currentUser.userSub)
          }
        }
      } catch (userError) {
        console.error('ProjectStore: Error fetching user from DynamoDB:', userError)
        throw new Error(`Failed to fetch user: ${userError.message}`)
      }
      
      if (!userData) {
        console.warn('ProjectStore: User not found in DynamoDB')
        // Show user-friendly error message
        error.value = 'User document not found. Please contact support if this issue persists.'
        userProjects.value = []
        loading.value = false
        return
      }
      
      console.log('ProjectStore: User document data:', userData)
      
      // Check if user has projects in the projects array
      const userProjectsArray = userData.projects || []
      console.log(`ProjectStore: Found ${userProjectsArray.length} projects in user document`)
      
      if (userProjectsArray.length === 0) {
        console.warn('ProjectStore: User has no projects assigned')
        userProjects.value = []
        loading.value = false
        return
      }
      
      // Fetch all projects - iterate over userProjectsArray directly to handle duplicates
      const projectsData = []
      
      if (userProjectsArray.length > 0) {
        try {
          console.log('ProjectStore: Fetching project details from DynamoDB...')
          
          // Create a cache for fetched project data to avoid duplicate API calls
          const projectCache = new Map()
          
          // Iterate over each user project entry (including duplicates with different units)
          const projectPromises = userProjectsArray.map(async (userProject) => {
            const projectId = userProject.projectId || userProject.id
            if (!projectId) {
              console.warn('ProjectStore: User project entry missing projectId:', userProject)
              return null
            }
            
            try {
              // Check cache first
              let projectData
              if (projectCache.has(projectId)) {
                projectData = projectCache.get(projectId)
                console.log(`ProjectStore: Using cached project data for ${projectId}`)
              } else {
                // Use DynamoDB only
                console.log(`ProjectStore: Fetching project ${projectId} from DynamoDB...`)
                projectData = await getProjectById(projectId)
                if (projectData) {
                  projectCache.set(projectId, projectData)
                  console.log(`ProjectStore: ✅ Successfully fetched project ${projectId}: ${projectData.name}`)
                } else {
                  console.warn(`ProjectStore: ⚠️ Project ${projectId} not found in DynamoDB`)
                  return null
                }
              }
              
              return {
                id: projectId,
                name: projectData.name || 'Unnamed Project',
                description: projectData.description || 'No description available',
                location: projectData.location || 'Location not set',
                status: projectData.status || 'active',
                type: projectData.type || 'residential',
                // User-specific project data (unique per entry)
                userRole: userProject.role || 'member',
                userUnit: userProject.unit || 'N/A',
                registrationStatus: userProject.registrationStatus || 'unknown',
                registrationStep: userProject.registrationStep || 'unknown',
                approvalStatus: userProject.approvalStatus || 'approved', // Default to approved for existing projects
                updatedAt: userProject.updatedAt || null
              }
            } catch (err) {
              console.error(`ProjectStore: ❌ Failed to fetch project ${projectId}:`, err)
              // Return fallback project data with the specific user data
              return {
                id: projectId,
                name: `Project ${projectId.slice(-6)}`,
                description: 'Project details not available',
                location: 'Location not set',
                status: 'unknown',
                type: 'unknown',
                userRole: userProject.role || 'member',
                userUnit: userProject.unit || 'N/A',
                registrationStatus: userProject.registrationStatus || 'unknown',
                registrationStep: userProject.registrationStep || 'unknown',
                approvalStatus: userProject.approvalStatus || 'approved', // Default to approved for existing projects
                updatedAt: userProject.updatedAt || null
              }
            }
          })
          
          // Wait for all projects to be fetched and filter out nulls
          const projectResults = await Promise.all(projectPromises)
          const validProjects = projectResults.filter(Boolean)
          projectsData.push(...validProjects)
          console.log(`ProjectStore: Successfully loaded ${validProjects.length} projects out of ${userProjectsArray.length} entries`)
        } catch (err) {
          console.error('ProjectStore: ❌ Error fetching projects in batch:', err)
          throw err
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
      
      console.log('ProjectStore: Fetching available projects from DynamoDB...')
      
      // Use DynamoDB only
      const { fetchProjects } = await import('../services/dynamoDBProjectsService')
      const projects = await fetchProjects({ limit: 50 })
      
      availableProjects.value = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        location: project.location,
        status: project.status,
        type: project.type,
        // Include all other fields
        ...project
      }))
      
      console.log(`✅ ProjectStore: Fetched ${availableProjects.value.length} projects from DynamoDB`)
      
    } catch (err) {
      console.error('Error fetching available projects:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Removed unused fetchProjectsByIds method

  const selectProject = (projectWithUnit) => {
    // projectWithUnit should have both project data and unit info
    selectedProject.value = {
      id: projectWithUnit.id,
      name: projectWithUnit.name,
      description: projectWithUnit.description,
      location: projectWithUnit.location,
      status: projectWithUnit.status,
      type: projectWithUnit.type
    }
    selectedUnit.value = projectWithUnit.userUnit
    
    // Store selection in localStorage for persistence (project + unit)
    localStorage.setItem('selectedProjectId', projectWithUnit.id)
    localStorage.setItem('selectedUnit', projectWithUnit.userUnit)
    localStorage.setItem('selectedProjectTimestamp', Date.now().toString())
    console.log('Project and unit selected:', projectWithUnit.name, '- Unit:', projectWithUnit.userUnit)
    
    // Trigger data refresh for the new project
    console.log('Project/Unit changed, triggering data refresh...')
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

  // Validate and fix selected project - ensure it's in user's available projects
  const validateAndFixSelectedProject = () => {
    if (!selectedProject.value) {
      // No project selected, try to auto-select if we have projects
      if (userProjects.value.length > 0) {
        console.log('ProjectStore: No project selected, auto-selecting first available project')
        selectProject(userProjects.value[0])
      }
      return
    }
    
    // Check if selected project is in user's available projects
    const hasAccess = userProjects.value.some(p => p.id === selectedProject.value.id)
    if (!hasAccess) {
      console.warn('ProjectStore: Selected project is not in user\'s available projects, clearing and selecting first available')
      clearSelectedProject()
      
      // Auto-select first available project
      if (userProjects.value.length > 0) {
        selectProject(userProjects.value[0])
        console.log('ProjectStore: Auto-selected first available project:', userProjects.value[0].name)
      }
    }
    // Removed excessive logging - only log when there's an issue
  }

  const loadSelectedProject = () => {
    const savedProjectId = localStorage.getItem('selectedProjectId')
    const savedUnit = localStorage.getItem('selectedUnit')
    const savedTimestamp = localStorage.getItem('selectedProjectTimestamp')
    
    console.log('ProjectStore: Attempting to load saved project and unit:', {
      savedProjectId,
      savedUnit,
      savedTimestamp,
      availableProjects: userProjects.value.map(p => `${p.id} - Unit ${p.userUnit}`)
    })
    
    if (savedProjectId && savedUnit && userProjects.value.length > 0) {
      // Check if the saved selection is not too old (24 hours)
      const now = Date.now()
      const savedTime = parseInt(savedTimestamp || '0')
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      
      if (now - savedTime > maxAge) {
        console.log('Saved project/unit selection is too old, clearing...')
        clearSelectedProject()
        return false
      }
      
      // Validate that user still has access to this project
      if (!validateSavedProject(savedProjectId)) {
        console.log('ProjectStore: User no longer has access to saved project:', savedProjectId)
        return false
      }
      
      // Find the exact project-unit combination
      const projectWithUnit = userProjects.value.find(
        p => p.id === savedProjectId && p.userUnit === savedUnit
      )
      
      if (projectWithUnit) {
        selectedProject.value = {
          id: projectWithUnit.id,
          name: projectWithUnit.name,
          description: projectWithUnit.description,
          location: projectWithUnit.location,
          status: projectWithUnit.status,
          type: projectWithUnit.type
        }
        selectedUnit.value = projectWithUnit.userUnit
        console.log('ProjectStore: Restored selected project and unit:', projectWithUnit.name, '- Unit:', savedUnit)
        return true
      } else {
        console.log('ProjectStore: Saved project-unit combination not found:', savedProjectId, savedUnit)
      }
    } else {
      console.log('ProjectStore: No saved project/unit or no projects available')
    }
    return false
  }

  const rehydrateStore = async (userId) => {
    try {
      console.log('ProjectStore: Starting rehydration for user:', userId)
      console.log('ProjectStore: Current projects count:', userProjects.value.length)
      console.log('ProjectStore: Last fetch time:', lastFetchTime.value ? new Date(lastFetchTime.value).toISOString() : 'never')
      
      // Check if we already have projects for this user and they're recent
      const now = Date.now()
      const hasRecentProjects = userProjects.value.length > 0 && (now - lastFetchTime.value) < cacheDuration
      
      if (hasRecentProjects) {
        console.log('ProjectStore: Using cached projects, attempting to restore selection')
        const restored = loadSelectedProject()
        if (restored) {
          console.log('ProjectStore: Successfully restored from cache')
          return true
        } else {
          console.log('ProjectStore: Could not restore from cache, but projects exist')
          return false
        }
      }
      
      // If no projects or cache expired, fetch projects
      console.log('ProjectStore: No cached projects or cache expired, fetching from DynamoDB...')
      console.log('ProjectStore: Calling fetchUserProjects for user:', userId)
      await fetchUserProjects(userId)
      
      console.log('ProjectStore: After fetchUserProjects, projects count:', userProjects.value.length)
      
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
    selectedUnit.value = null
    localStorage.removeItem('selectedProjectId')
    localStorage.removeItem('selectedUnit')
    localStorage.removeItem('selectedProjectTimestamp')
  }

  const resetStore = () => {
    userProjects.value = []
    selectedProject.value = null
    selectedUnit.value = null
    availableProjects.value = []
    loading.value = false
    error.value = null
    localStorage.removeItem('selectedProjectId')
    localStorage.removeItem('selectedUnit')
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
    selectedUnit, // New: Export selected unit
    // Actions
    validateAndFixSelectedProject,
    availableProjects,
    loading,
    error,
    
    // Getters
    hasMultipleProjects,
    hasMultipleUnits, // New: Export multiple units check
    hasSelectedProject,
    projectsByGroup, // New: Export grouped projects
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
