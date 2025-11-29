/**
 * Google Sign-In Test Script
 * 
 * This script tests the Google sign-in functionality in your PRE app.
 * Run this in the browser console after setting up Google sign-in.
 */

console.log('🧪 Testing Google Sign-In Functionality...')

// Test 1: Check if Google provider is available
function testGoogleProvider() {
  console.log('✅ Test 1: Google Provider Availability')
  
  if (typeof window !== 'undefined' && window.$googleProvider) {
    console.log('✅ Google provider is available globally')
    return true
  } else {
    console.log('❌ Google provider not found globally')
    return false
  }
}

// Test 2: Check if Firebase Auth is available
function testFirebaseAuth() {
  console.log('✅ Test 2: Firebase Auth Availability')
  
  if (typeof window !== 'undefined' && window.$auth) {
    console.log('✅ Firebase Auth is available globally')
    return true
  } else {
    console.log('❌ Firebase Auth not found globally')
    return false
  }
}

// Test 3: Check if Firestore is available
function testFirestore() {
  console.log('✅ Test 3: Firestore Availability')
  
  if (typeof window !== 'undefined' && window.$db) {
    console.log('✅ Firestore is available globally')
    return true
  } else {
    console.log('❌ Firestore not found globally')
    return false
  }
}

// Test 4: Check Google sign-in button presence
function testGoogleButton() {
  console.log('✅ Test 4: Google Sign-In Button Presence')
  
  const googleButtons = document.querySelectorAll('.google-btn')
  if (googleButtons.length > 0) {
    console.log(`✅ Found ${googleButtons.length} Google sign-in button(s)`)
    return true
  } else {
    console.log('❌ No Google sign-in buttons found')
    return false
  }
}

// Test 5: Check Google sign-in button styling
function testGoogleButtonStyling() {
  console.log('✅ Test 5: Google Button Styling')
  
  const googleButton = document.querySelector('.google-btn')
  if (googleButton) {
    const styles = window.getComputedStyle(googleButton)
    const borderColor = styles.borderColor
    const color = styles.color
    
    console.log(`✅ Button border color: ${borderColor}`)
    console.log(`✅ Button text color: ${color}`)
    
    if (borderColor.includes('68') || borderColor.includes('133') || borderColor.includes('244')) {
      console.log('✅ Google blue color detected')
      return true
    } else {
      console.log('❌ Google blue color not detected')
      return false
    }
  } else {
    console.log('❌ Google button not found for styling test')
    return false
  }
}

// Test 6: Check divider presence
function testDivider() {
  console.log('✅ Test 6: Divider Presence')
  
  const dividers = document.querySelectorAll('.divider')
  if (dividers.length > 0) {
    console.log(`✅ Found ${dividers.length} divider(s)`)
    return true
  } else {
    console.log('❌ No dividers found')
    return false
  }
}

// Test 7: Check social sign-in container
function testSocialContainer() {
  console.log('✅ Test 7: Social Sign-In Container')
  
  const socialContainers = document.querySelectorAll('.social-signin')
  if (socialContainers.length > 0) {
    console.log(`✅ Found ${socialContainers.length} social sign-in container(s)`)
    return true
  } else {
    console.log('❌ No social sign-in containers found')
    return false
  }
}

// Test 8: Check Google SVG icon
function testGoogleIcon() {
  console.log('✅ Test 8: Google SVG Icon')
  
  const googleIcons = document.querySelectorAll('.google-btn svg')
  if (googleIcons.length > 0) {
    console.log(`✅ Found ${googleIcons.length} Google SVG icon(s)`)
    
    // Check if SVG has the correct paths
    const svg = googleIcons[0]
    const paths = svg.querySelectorAll('path')
    if (paths.length >= 4) {
      console.log('✅ SVG has correct number of paths for Google logo')
      return true
    } else {
      console.log('❌ SVG missing correct paths for Google logo')
      return false
    }
  } else {
    console.log('❌ No Google SVG icons found')
    return false
  }
}

// Test 9: Check responsive design
function testResponsiveDesign() {
  console.log('✅ Test 9: Responsive Design')
  
  const googleButton = document.querySelector('.google-btn')
  if (googleButton) {
    const styles = window.getComputedStyle(googleButton)
    const width = styles.width
    const padding = styles.padding
    
    console.log(`✅ Button width: ${width}`)
    console.log(`✅ Button padding: ${padding}`)
    
    if (width === '100%' || width.includes('100%')) {
      console.log('✅ Button is full width (responsive)')
      return true
    } else {
      console.log('❌ Button is not full width')
      return false
    }
  } else {
    console.log('❌ Google button not found for responsive test')
    return false
  }
}

// Test 10: Check hover effects
function testHoverEffects() {
  console.log('✅ Test 10: Hover Effects')
  
  const googleButton = document.querySelector('.google-btn')
  if (googleButton) {
    const styles = window.getComputedStyle(googleButton)
    const transition = styles.transition
    
    if (transition && transition !== 'none') {
      console.log('✅ Button has transition effects')
      return true
    } else {
      console.log('❌ Button missing transition effects')
      return false
    }
  } else {
    console.log('❌ Google button not found for hover test')
    return false
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all Google Sign-In tests...\n')
  
  const tests = [
    testGoogleProvider,
    testFirebaseAuth,
    testFirestore,
    testGoogleButton,
    testGoogleButtonStyling,
    testDivider,
    testSocialContainer,
    testGoogleIcon,
    testResponsiveDesign,
    testHoverEffects
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  tests.forEach((test, index) => {
    try {
      const result = test()
      if (result) passedTests++
    } catch (error) {
      console.log(`❌ Test ${index + 1} failed with error:`, error.message)
    }
    console.log('') // Add spacing between tests
  })
  
  // Summary
  console.log('📊 Test Results Summary')
  console.log(`✅ Passed: ${passedTests}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Google Sign-In is properly configured.')
  } else {
    console.log('⚠️  Some tests failed. Check the console for details.')
  }
  
  return { passed: passedTests, total: totalTests }
}

// Export functions for manual testing
window.testGoogleSignIn = {
  runAllTests,
  testGoogleProvider,
  testFirebaseAuth,
  testFirestore,
  testGoogleButton,
  testGoogleButtonStyling,
  testDivider,
  testSocialContainer,
  testGoogleIcon,
  testResponsiveDesign,
  testHoverEffects
}

console.log('🔧 Google Sign-In test functions loaded!')
console.log('💡 Run testGoogleSignIn.runAllTests() to test everything')
console.log('💡 Or run individual tests like testGoogleSignIn.testGoogleButton()')
