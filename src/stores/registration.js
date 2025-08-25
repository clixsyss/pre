import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useRegistrationStore = defineStore('registration', () => {
  // Registration flow state
  const currentStep = ref('personal') // personal -> verify -> property -> details -> complete
  const isEmailVerified = ref(false)
  const tempUserId = ref(null)
  const verificationCode = ref('')
  
  // Form data
  const personalData = reactive({
    email: ''
  })
  
  const propertyData = reactive({
    compound: '',
    unit: '',
    role: '',
    projects: [] // New field for multiple projects
  })
  
  const userDetails = reactive({
    firstName: '',
    lastName: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'male',
    nationalId: '',
    password: '',
    confirmPassword: ''
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
  
  const setVerificationCode = (code) => {
    verificationCode.value = code
  }
  
  const setCurrentStep = (step) => {
    currentStep.value = step
  }
  
  const resetRegistration = () => {
    currentStep.value = 'personal'
    isEmailVerified.value = false
    tempUserId.value = null
    verificationCode.value = ''
    Object.assign(personalData, { email: '' })
    Object.assign(propertyData, { compound: '', unit: '', role: '', projects: [] })
    Object.assign(userDetails, {
      firstName: '', lastName: '', mobile: '', dateOfBirth: '',
      gender: 'male', nationalId: '', password: '', confirmPassword: ''
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
    verificationCode,
    personalData,
    propertyData,
    userDetails,
    
    // Methods
    setPersonalData,
    setPropertyData,
    setUserDetails,
    setEmailVerified,
    setTempUserId,
    setVerificationCode,
    setCurrentStep,
    resetRegistration,
    getRegistrationData
  }
})
