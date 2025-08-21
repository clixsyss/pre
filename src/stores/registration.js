import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useRegistrationStore = defineStore('registration', () => {
  // Registration flow state
  const currentStep = ref('personal') // personal -> verify -> property -> details -> complete
  const isEmailVerified = ref(false)
  const tempUserId = ref(null)
  
  // Form data
  const personalData = reactive({
    email: ''
  })
  
  const propertyData = reactive({
    project: '',
    unit: '',
    role: ''
  })
  
  const userDetails = reactive({
    firstName: '',
    lastName: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'male',
    nationalId: '',
    password: ''
  })
  
  // Methods
  const setPersonalData = (data) => {
    Object.assign(personalData, data)
  }
  
  const setPropertyData = (data) => {
    Object.assign(propertyData, data)
  }
  
  const setUserDetails = (data) => {
    Object.assign(userDetails, data)
  }
  
  const setEmailVerified = (verified) => {
    isEmailVerified.value = verified
  }
  
  const setTempUserId = (uid) => {
    tempUserId.value = uid
  }
  
  const setCurrentStep = (step) => {
    currentStep.value = step
  }
  
  const resetRegistration = () => {
    currentStep.value = 'personal'
    isEmailVerified.value = false
    tempUserId.value = null
    Object.assign(personalData, { email: '' })
    Object.assign(propertyData, { project: '', unit: '', role: '' })
    Object.assign(userDetails, {
      firstName: '', lastName: '', mobile: '', dateOfBirth: '',
      gender: 'male', nationalId: '', password: ''
    })
  }
  
  const getRegistrationData = () => {
    return {
      personal: { ...personalData },
      property: { ...propertyData },
      userDetails: { ...userDetails }
    }
  }
  
  return {
    // State
    currentStep,
    isEmailVerified,
    tempUserId,
    personalData,
    propertyData,
    userDetails,
    
    // Methods
    setPersonalData,
    setPropertyData,
    setUserDetails,
    setEmailVerified,
    setTempUserId,
    setCurrentStep,
    resetRegistration,
    getRegistrationData
  }
})
