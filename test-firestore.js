/**
 * Test Script for Firestore Integration
 * 
 * This script can be run in the browser console to test Firestore operations
 * Make sure you're authenticated before running these tests
 */

// Test user data
const testUserData = {
  personal: {
    email: 'test@example.com',
    emailVerified: false
  },
  property: {
    project: 'Test Project',
    unit: 'Test Unit',
    role: 'owner'
  },
  userDetails: {
    firstName: 'Test',
    lastName: 'User',
    mobile: '+1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationalId: '123456789'
  }
}

// Test functions
const testFirestore = {
  // Test creating a user document
  async testCreateUser() {
    try {
      console.log('🧪 Testing user creation...')
      
      // Get current user ID
      const userId = auth.currentUser?.uid
      if (!userId) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      // Create test user document
      const result = await createUserDocument(userId, testUserData)
      console.log('✅ Create user test passed:', result)
      return true
    } catch (error) {
      console.error('❌ Create user test failed:', error)
      return false
    }
  },

  // Test updating user document
  async testUpdateUser() {
    try {
      console.log('🧪 Testing user update...')
      
      const userId = auth.currentUser?.uid
      if (!userId) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      const updateData = {
        emailVerified: true,
        registrationStep: 'test_update'
      }
      
      const result = await updateUserDocument(userId, updateData)
      console.log('✅ Update user test passed:', result)
      return true
    } catch (error) {
      console.error('❌ Update user test failed:', error)
      return false
    }
  },

  // Test getting user document
  async testGetUser() {
    try {
      console.log('🧪 Testing user retrieval...')
      
      const userId = auth.currentUser?.uid
      if (!userId) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      const userDoc = await getUserDocument(userId)
      console.log('✅ Get user test passed:', userDoc)
      return true
    } catch (error) {
      console.error('❌ Get user test failed:', error)
      return false
    }
  },

  // Test registration progress
  async testRegistrationProgress() {
    try {
      console.log('🧪 Testing registration progress...')
      
      const userId = auth.currentUser?.uid
      if (!userId) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      const progress = await getRegistrationProgress(userId)
      console.log('✅ Registration progress test passed:', progress)
      return true
    } catch (error) {
      console.error('❌ Registration progress test failed:', error)
      return false
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Firestore integration tests...')
    console.log('=====================================')
    
    const results = {
      createUser: await this.testCreateUser(),
      updateUser: await this.testUpdateUser(),
      getUser: await this.testGetUser(),
      registrationProgress: await this.testRegistrationProgress()
    }
    
    console.log('=====================================')
    console.log('📊 Test Results:')
    console.log('Create User:', results.createUser ? '✅ PASS' : '❌ FAIL')
    console.log('Update User:', results.updateUser ? '✅ PASS' : '❌ FAIL')
    console.log('Get User:', results.getUser ? '✅ PASS' : '❌ FAIL')
    console.log('Registration Progress:', results.registrationProgress ? '✅ PASS' : '❌ FAIL')
    
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`)
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Firestore integration is working correctly.')
    } else {
      console.log('⚠️ Some tests failed. Check the console for details.')
    }
    
    return results
  }
}

// Make test functions available globally
window.testFirestore = testFirestore

console.log(`
🔧 Firestore Test Suite Loaded!

Available functions:
- testFirestore.testCreateUser()
- testFirestore.testUpdateUser()
- testFirestore.testGetUser()
- testFirestore.testRegistrationProgress()
- testFirestore.runAllTests()

Run 'testFirestore.runAllTests()' to execute all tests.
`)

// Auto-run tests if user is authenticated
if (auth.currentUser) {
  console.log('👤 User authenticated, ready to run tests')
} else {
  console.log('⚠️ No user authenticated. Please sign in before running tests.')
}
