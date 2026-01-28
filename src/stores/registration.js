import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useRegistrationStore = defineStore('registration', () => {
  // Registration flow state
  const currentStep = ref('personal') // personal -> verify -> property -> details -> complete
  const isEmailVerified = ref(false)
  const tempUserId = ref(null)
  const firestoreUserId = ref(null)
  const verificationCode = ref('')

  const migrationChallenge = reactive({
    type: null,
    email: '',
    cognitoUser: null,
  })

  // Form data
  const personalData = reactive({
    email: '',
  })

  const propertyData = reactive({
    compound: '',
    unit: '',
    role: '',
    projects: [], // Array of project IDs the user has access to
  })

  const userDetails = reactive({
    firstName: '',
    lastName: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'male',
    nationalId: '',
    password: '',
    confirmPassword: '',
  })

  const faceEnrollmentCompleted = ref(false)
  const faceEnrollmentResults = ref([])

  // Methods
  const setFaceEnrollmentResults = (entries) => {
    faceEnrollmentResults.value = Array.isArray(entries) ? [...entries] : []
  }

  const setPersonalData = (data) => {
    Object.assign(personalData, data)
  }

  const setPropertyData = (data) => {
    Object.assign(propertyData, data)
  }

  const setUserDetails = (data) => {
    Object.assign(userDetails, data)
  }

  const setFaceEnrollmentCompleted = (value) => {
    faceEnrollmentCompleted.value = !!value
  }

  const setEmailVerified = (verified) => {
    isEmailVerified.value = verified
  }

  const setTempUserId = (uid) => {
    tempUserId.value = uid
  }

  const setFirestoreUserId = (uid) => {
    firestoreUserId.value = uid
  }

  const setVerificationCode = (code) => {
    verificationCode.value = code
  }

  const setCurrentStep = (step) => {
    currentStep.value = step
  }

  const setMigrationChallenge = ({ type, user, email }) => {
    migrationChallenge.type = type ?? null
    migrationChallenge.cognitoUser = user ?? null
    migrationChallenge.email = email ?? ''
  }

  const clearMigrationChallenge = () => {
    migrationChallenge.type = null
    migrationChallenge.cognitoUser = null
    migrationChallenge.email = ''
  }

  const resetRegistration = () => {
    currentStep.value = 'personal'
    isEmailVerified.value = false
    tempUserId.value = null
    firestoreUserId.value = null
    verificationCode.value = ''
    clearMigrationChallenge()
    Object.assign(personalData, { email: '' })
    Object.assign(propertyData, { compound: '', unit: '', role: '', projects: [] })
    Object.assign(userDetails, {
      firstName: '',
      lastName: '',
      mobile: '',
      dateOfBirth: '',
      gender: 'male',
      nationalId: '',
      password: '',
      confirmPassword: '',
    })
    faceEnrollmentCompleted.value = false
    faceEnrollmentResults.value = []
  }

  const getRegistrationData = () => {
    return {
      personal: { ...personalData },
      property: { ...propertyData },
      userDetails: { ...userDetails },
    }
  }

  return {
    // State
    currentStep,
    isEmailVerified,
    tempUserId,
    firestoreUserId,
    verificationCode,
    personalData,
    propertyData,
    userDetails,
    migrationChallenge,
    faceEnrollmentCompleted,
    faceEnrollmentResults,

    // Methods
    setFaceEnrollmentCompleted,
    setFaceEnrollmentResults,
    setPersonalData,
    setPropertyData,
    setUserDetails,
    setEmailVerified,
    setTempUserId,
    setFirestoreUserId,
    setVerificationCode,
    setCurrentStep,
    resetRegistration,
    getRegistrationData,
    setMigrationChallenge,
    clearMigrationChallenge,
  }
})
