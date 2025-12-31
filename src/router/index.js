import { createRouter, createWebHashHistory } from 'vue-router'
import optimizedAuthService from '../services/optimizedAuthService'
import firestoreService from '../services/firestoreService'
import { canUserAccessRoute, checkUserSuspension } from '../services/suspensionService'


// Import pages
import Onboarding from '../pages/unauth/Onboarding.vue'
import SignIn from '../pages/unauth/SignIn.vue'
import Register from '../pages/unauth/Register.vue'
import VerifyEmail from '../pages/unauth/VerifyEmail.vue'
import PersonalDetails from '../pages/unauth/PersonalDetails.vue'
import MigrateAccount from '../pages/unauth/MigrateAccount.vue'
import Home from '../pages/auth/Home.vue'
import Profile from '../pages/auth/ProfilePage.vue'
import ProjectSelection from '../pages/auth/ProjectSelection.vue'
import AuthSupport from '../pages/auth/Support.vue'
import SupportChatPage from '../pages/auth/SupportChatPage.vue'

const routes = [
  // Root redirects based on auth state - handled in beforeEach guard
  {
    path: '/',
    name: 'Root',
    component: () => import('../pages/auth/Home.vue'), // Default component, will be redirected by guard
    meta: { requiresAuth: true },
  },

  // Unauthorized user routes
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: false },
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/register/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { requiresAuth: false },
  },
  {
    path: '/register/personal-details',
    name: 'PersonalDetails',
    component: PersonalDetails,
    meta: { requiresAuth: false },
  },
  {
    path: '/migrate-account',
    name: 'MigrateAccount',
    component: MigrateAccount,
    meta: { requiresAuth: false },
  },
  {
    path: '/guest-pass/:projectId/:passId',
    name: 'GuestPassView',
    component: () => import('../pages/unauth/GuestPassView.vue'),
    meta: { requiresAuth: false },
  },

  // Authorized user routes
  {
    path: '/project-selection',
    name: 'ProjectSelection',
    component: ProjectSelection,
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/access',
    name: 'Access',
    component: () => import('../pages/auth/Access.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../pages/auth/Services.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/service-category/:id',
    name: 'ServiceCategoryDetails',
    component: () => import('../pages/auth/ServiceCategoryDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/requests',
    name: 'Requests',
    component: () => import('../pages/auth/Requests.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/facilities',
    name: 'Facilities',
    component: () => import('../pages/auth/Facilities.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/request-category/:id',
    name: 'RequestCategoryDetails',
    component: () => import('../pages/auth/RequestCategoryDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/stores-shopping',
    name: 'StoresShopping',
    component: () => import('../pages/auth/StoresShopping.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/store/:storeId',
    name: 'StoreDetails',
    component: () => import('../pages/auth/StoreDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shopping-cart',
    name: 'ShoppingCart',
    component: () => import('../pages/auth/ShoppingCart.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/court-booking',
    name: 'CourtBooking',
    component: () => import('../pages/auth/CourtBooking.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/academy-booking',
    name: 'AcademyBooking',
    component: () => import('../pages/auth/AcademyBooking.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/academy-programs',
    name: 'AcademyPrograms',
    component: () => import('../pages/auth/AcademyPrograms.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/academy-details/:id',
    name: 'AcademyDetails',
    component: () => import('../pages/auth/AcademyDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/academy-registration/:academyId/:programId',
    name: 'AcademyRegistration',
    component: () => import('../pages/auth/AcademyRegistration.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: () => import('../pages/auth/MyBookings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../pages/auth/Calendar.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../pages/auth/Analytics.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../pages/auth/News.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/complaints',
    name: 'Complaints',
    component: () => import('../pages/auth/Complaints.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/complaints/:id',
    name: 'ComplaintChat',
    component: () => import('../components/ComplaintChat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/violations',
    name: 'Violations',
    component: () => import('../pages/auth/ViolationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/violation-chat/:id',
    name: 'ViolationChat',
    component: () => import('../components/ViolationChat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/service-booking-chat/:id',
    name: 'ServiceBookingChat',
    component: () => import('../components/ServiceBookingChat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/smart-devices',
    name: 'SmartDevices',
    component: () => import('../pages/auth/SmartDevices.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/gate-control',
    name: 'GateControl',
    component: () => import('../pages/auth/GateControlPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/support',
    name: 'AuthSupport',
    component: AuthSupport,
    meta: { requiresAuth: true },
  },
  {
    path: '/support-chat',
    name: 'SupportChat',
    component: SupportChatPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/support-chat/:id',
    name: 'SupportChatById',
    component: SupportChatPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/request-chat/:id',
    name: 'RequestChat',
    component: () => import('../components/RequestChat.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/request-category/:id',
    name: 'RequestCategoryDetails',
    component: () => import('../pages/auth/RequestCategoryDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/test-notifications',
    name: 'TestNotifications',
    component: () => import('../pages/auth/TestNotifications.vue'),
    meta: { requiresAuth: true },
  },
  // Catch all route - redirect to onboarding
  {
    path: '/:pathMatch(.*)*',
    redirect: '/onboarding',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when navigating between pages
    return { top: 0 }
  },
})

// Extract auth state processing logic
async function processAuthState(user, to, from, next, resolve, requiresAuth) {
  // Allow navigation to onboarding during registration process
  if (to.path === '/onboarding' && from.path && from.path.startsWith('/register')) {
    console.log('Allowing navigation to onboarding from registration')
    next()
    resolve()
    return
  }

  // Allow navigation from onboarding to registration/signin flow
  if ((to.path === '/register' || to.path === '/signin' || to.path.startsWith('/register/')) && from.path === '/onboarding') {
    console.log('Allowing navigation from onboarding to', to.path)
    next()
    resolve()
    return
  }

  if (requiresAuth && !user) {
    // Route requires auth but user is not authenticated
    // Store the intended route for later redirect
    if (to.path !== '/onboarding') {
      localStorage.setItem('intendedRoute', to.path)
      console.log('Storing intended route for later redirect:', to.path)
    }
    next('/onboarding')
    resolve()
  } else if (!requiresAuth && user && to.path === '/onboarding') {
    // User is authenticated but trying to access onboarding
    // Check if there's an intended route to redirect to
    const intendedRoute = localStorage.getItem('intendedRoute')
    if (intendedRoute) {
      console.log('Redirecting to intended route:', intendedRoute)
      localStorage.removeItem('intendedRoute')
      next(intendedRoute)
      resolve()
    } else if (!from.path || !from.path.startsWith('/register')) {
      next('/home')
      resolve()
    } else {
      next()
      resolve()
    }
  } else if (user && requiresAuth) {
    // User is authenticated and trying to access protected route
    // Use Cognito sub (which is the DynamoDB user ID) instead of uid which might be email
    const userId = user.attributes?.sub || user.cognitoAttributes?.sub || user.uid
    
    // Run profile and suspension checks in parallel for better performance
    try {
      const [userDocResult, suspensionResult] = await Promise.allSettled([
        firestoreService.getDoc(`users/${userId}`),
        canUserAccessRoute(userId, to.path),
      ])

      // Check profile completion
      if (userDocResult.status === 'fulfilled' && userDocResult.value.exists()) {
        const userData = userDocResult.value.data()
        const isProfileComplete = userData.isProfileComplete

        if (!isProfileComplete) {
          // Check if user actually has required fields but profile is marked incomplete
          const hasRequiredFields =
            userData.firstName && userData.lastName && userData.mobile && userData.email

          if (hasRequiredFields) {
            console.log('Profile has required fields but marked incomplete, fixing...')
            // Import and use markProfileComplete
            const { markProfileComplete } = await import('../utils/firestore')
            try {
              await markProfileComplete(user.uid)
              console.log('Profile marked as complete in navigation guard')
            } catch (error) {
              console.error('Error marking profile complete:', error)
            }
          } else {
            console.log('Profile incomplete and missing required fields, redirecting to onboarding')
            next('/onboarding')
            resolve()
            return
          }
        }
      }

      // Check suspension status
      if (suspensionResult.status === 'fulfilled' && !suspensionResult.value) {
        console.log('User is suspended and cannot access this route:', to.path)

        // Check suspension details to show proper message
        try {
          const suspensionStatus = await checkUserSuspension(userId)
          if (suspensionStatus.isSuspended) {
            // Emit event to show suspension message
            window.dispatchEvent(
              new CustomEvent('showSuspensionMessage', {
                detail: {
                  suspensionDetails: suspensionStatus.suspensionDetails,
                  attemptedRoute: to.path,
                },
              }),
            )
          }
        } catch (error) {
          console.error('Error checking suspension details:', error)
        }

        // Redirect to home page for suspended users
        next('/home')
        resolve()
        return
      }

      // All checks passed - allow access
      next()
      resolve()
    } catch (error) {
      console.error('Error in auth state processing:', error)
      // On error, allow access to prevent blocking
      next()
      resolve()
    }
  } else {
    // Allow navigation for non-protected routes
    next()
    resolve()
  }
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigation guard - to:', to.path, 'from:', from.path)
  
  // Check if running on web (not native app)
  const isWeb = !window.Capacitor || window.Capacitor.getPlatform() === 'web'
  
  // Allow web development mode (when running quasar dev)
  // Only block web in production builds, not during development
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  
  // In development mode, add timeout to prevent hanging
  let guardTimeout
  if (isDevelopment) {
    guardTimeout = setTimeout(() => {
      console.warn('⚠️ Navigation guard timeout - allowing navigation to prevent blank page')
      if (to.path === '/') {
        next('/onboarding')
      } else {
        next()
      }
    }, 5000) // 5 second timeout in development
  }
  
  // WEB PLATFORM: ONLY allow guest pass pages, block everything else (but allow in development)
  if (isWeb && !isDevelopment) {
    if (to.path.startsWith('/guest-pass/')) {
      console.log('Navigation guard: Guest pass page on WEB - allowing')
      next()
      return
    }
    
    // Block all other routes on web (production only)
    console.log('Navigation guard: Blocking non-guest-pass route on WEB')
    console.log('⛔ This app is only available on iOS/Android')
    next(false) // Cancel navigation
    return
  }
  
  // In development mode, allow all routes on web (continue to normal guard logic)
  if (isWeb && isDevelopment) {
    console.log('Navigation guard: Development mode - allowing web access, continuing with normal guard')
  }
  
  const requiresAuth = to.meta.requiresAuth

  // Guest pass pages should NEVER redirect - allow direct access (native app)
  if (to.path.startsWith('/guest-pass/')) {
    console.log('Navigation guard: Guest pass page - allowing direct access')
    next()
    return
  }

  // Handle root route specially
  if (to.path === '/') {
    console.log('Navigation guard: Handling root route')
    
    // In development, skip complex checks and redirect immediately
    if (isDevelopment && isWeb) {
      console.log('Navigation guard: Development mode - skipping auth checks, redirecting to onboarding')
      if (guardTimeout) clearTimeout(guardTimeout)
      next('/onboarding')
      return
    }
    
    try {
      // Detect iOS platform for longer wait time
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
      
      // On iOS, wait for auth state to be restored (can take several seconds)
      // On other platforms, use shorter wait
      let currentUser
      try {
        if (isIOS) {
          console.log('Navigation guard: iOS detected, waiting for auth state to restore...')
          currentUser = await optimizedAuthService.waitForAuthState()
          console.log(
            'Navigation guard: Current user check result (iOS):',
            currentUser ? 'authenticated' : 'not authenticated',
          )
        } else {
          // For non-iOS, use shorter wait
          await new Promise((resolve) => setTimeout(resolve, 300))
          currentUser = await optimizedAuthService.getCurrentUser()
          console.log(
            'Navigation guard: Current user check result:',
            currentUser ? 'authenticated' : 'not authenticated',
          )
        }
      } catch (authError) {
        console.warn('Navigation guard: Error checking auth state, redirecting to onboarding:', authError)
        if (guardTimeout) clearTimeout(guardTimeout)
        next('/onboarding')
        return
      }

      if (currentUser) {
        // Check Cognito email confirmation status
        // Note: Some users may have email_verified=false but can still sign in
        // Only enforce this if it's critical for your use case
        const emailVerified = currentUser?.cognitoAttributes?.emailVerified || 
                             currentUser?.attributes?.email_verified === 'true' ||
                             currentUser?.attributes?.email_verified === true
        
        console.log('[Router] 📧 Cognito email verification status:', emailVerified)

        // Don't sign out for unverified emails - user can still sign in, so allow them to proceed
        // Email verification can be handled elsewhere if needed
        if (!emailVerified) {
          console.log('[Router] ⚠️ User email is not confirmed in Cognito, but allowing access (user can sign in)')
        } else {
          console.log('[Router] ✅ User email is confirmed in Cognito')
        }

        // Check DynamoDB for user approval status
        try {
          const userEmail = currentUser?.attributes?.email || currentUser?.cognitoAttributes?.email
          if (!userEmail) {
            console.log('[Router] ❌ Could not get user email, signing out')
            await optimizedAuthService.signOut()
            next('/signin')
            return
          }

          const { getUserByEmail, getUserById } = await import('../services/dynamoDBUsersService')
          
          // Use Cognito sub (primary key) first - this is the most reliable lookup
          const cognitoSub = currentUser?.attributes?.sub || currentUser?.cognitoAttributes?.sub || currentUser?.uid
          let dynamoUser = null
          
          // First, try by ID (Cognito sub) - this is the primary key and most reliable
          if (cognitoSub) {
            console.log('[Router] 🔍 Checking DynamoDB users table by ID (Cognito sub):', cognitoSub)
            dynamoUser = await getUserById(cognitoSub)
            
            if (dynamoUser) {
              console.log('[Router] ✅ User found by ID (Cognito sub) in DynamoDB')
            }
          }
          
          // Fallback: If not found by ID, try by email
          if (!dynamoUser && userEmail) {
            console.log('[Router] ⚠️ User not found by ID, trying email lookup:', userEmail)
            dynamoUser = await getUserByEmail(userEmail)
            
            if (dynamoUser) {
              console.log('[Router] ✅ User found by email in DynamoDB')
            }
          }
          
          if (!dynamoUser) {
            console.log('[Router] ⚠️ User not found in DynamoDB users table (tried email and ID)')
            console.log('[Router] ⚠️ This might be a new user or data sync issue. Allowing access but user may need to complete registration.')
            // Don't sign out - allow user to proceed, they might need to complete registration
            // The app should handle missing user data gracefully
            next('/home')
            return
          }

          console.log('[Router] 📋 User found in DynamoDB, approvalStatus:', dynamoUser.approvalStatus)

          // Check if approvalStatus is "approved" (case-insensitive)
          const approvalStatus = String(dynamoUser.approvalStatus || '').trim().toLowerCase()
          const isApproved = approvalStatus === 'approved'
          
          console.log('[Router] Approval status check:')
          console.log('[Router]   - Raw:', dynamoUser.approvalStatus)
          console.log('[Router]   - Normalized:', approvalStatus)
          console.log('[Router]   - Is approved?:', isApproved)
          
          if (!isApproved) {
            console.log('[Router] ❌ User approval status is not approved, signing out')
            await optimizedAuthService.signOut()
            next('/signin')
            return
          }

          console.log('[Router] ✅ User approval status is approved in DynamoDB, allowing access')
          next('/home')
          return

        } catch (dynamoError) {
          console.error('[Router] ❌ Error checking DynamoDB users table:', dynamoError)
          
          // Check if this might be a notification-triggered navigation (app opening from notification)
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
          const mightBeNotificationNavigation = from.path === '/' || from.name === null || from.name === undefined
          
          // If this might be notification navigation on iOS, wait a bit more for auth to restore
          if (isIOS && mightBeNotificationNavigation) {
            console.log('[Router] ⚠️ Possible notification navigation on iOS - waiting for auth state...')
            try {
              // Wait up to 3 more seconds for auth state to restore
              const retryUser = await optimizedAuthService.waitForAuthState(3000)
              if (retryUser) {
                console.log('[Router] ✅ Auth state restored after wait, retrying DynamoDB check...')
                // Retry the DynamoDB check with the restored user
                const userEmail = retryUser?.attributes?.email || retryUser?.cognitoAttributes?.email
                if (userEmail) {
                  const { getUserByEmail, getUserById } = await import('../services/dynamoDBUsersService')
                  const cognitoSub = retryUser?.attributes?.sub || retryUser?.cognitoAttributes?.sub || retryUser?.uid
                  let dynamoUser = null
                  
                  if (cognitoSub) {
                    dynamoUser = await getUserById(cognitoSub)
                  }
                  if (!dynamoUser && userEmail) {
                    dynamoUser = await getUserByEmail(userEmail)
                  }
                  
                  if (dynamoUser) {
                    const approvalStatus = String(dynamoUser.approvalStatus || '').trim().toLowerCase()
                    if (approvalStatus === 'approved') {
                      console.log('[Router] ✅ User found and approved after retry, allowing access')
                      next('/home')
                      return
                    }
                  }
                }
              }
            } catch (retryError) {
              console.warn('[Router] ⚠️ Retry after wait also failed:', retryError)
            }
          }
          
          // In development, allow access even if DynamoDB check fails
          if (isDevelopment) {
            console.log('[Router] ⚠️ Development mode - allowing access despite DynamoDB error')
            next('/home')
            return
          }
          
          // On error, sign out to be safe (production only)
          // But only if we're sure this isn't a transient auth restoration issue
          console.log('[Router] ⚠️ DynamoDB check failed - signing out user')
          try {
            await optimizedAuthService.signOut()
          } catch (signOutError) {
            console.warn('Error signing out:', signOutError)
          }
          next('/signin')
          return
        }
      } else {
        console.log('Navigation guard: User not authenticated, redirecting to /onboarding')
        if (guardTimeout) clearTimeout(guardTimeout)
        next('/onboarding')
        return
      }
    } catch (error) {
      console.error('Navigation guard: Error checking auth state:', error)
      // In development, always allow navigation to onboarding
      console.log('Navigation guard: Development mode - redirecting to onboarding despite error')
      if (guardTimeout) clearTimeout(guardTimeout)
      next('/onboarding')
      return
    }
  }

  // For non-authenticated routes, allow immediate navigation
  if (!requiresAuth) {
    if (guardTimeout) clearTimeout(guardTimeout)
    next()
    return
  }

  // Check authentication status with optimized timeout
  return new Promise((resolve) => {
    let resolved = false

    // Detect if this might be notification navigation
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
    const mightBeNotificationNavigation = from.path === '/' || from.name === null || from.name === undefined
    
    // Wait longer for authentication state to be established, especially for iOS notification navigation
    // iOS cold starts from notifications can take 5-10 seconds to restore Cognito session
    const timeoutDuration = (isIOS && mightBeNotificationNavigation) ? 10000 : 5000
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log(`Auth check timeout after ${timeoutDuration}ms, allowing navigation`)
        resolved = true
        // Don't sign out on timeout - allow navigation and let app handle auth state
        next()
        resolve()
      }
    }, timeoutDuration)

    // Add a delay to allow authentication state to be established
    const checkAuth = async () => {
      try {
        // Detect iOS platform
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
        
        // Check if this is a notification-triggered navigation
        const isNotificationNavigation = from.path === '/' && to.path !== '/onboarding'
        
        let currentUser
        if (isIOS) {
          // On iOS, use waitForAuthState to ensure auth is restored
          console.log('Navigation guard: iOS detected, waiting for auth state...')
          currentUser = await optimizedAuthService.waitForAuthState()
        } else {
          // For non-iOS, use shorter wait
          const waitTime = isNotificationNavigation ? 1500 : 500
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          currentUser = await optimizedAuthService.getCurrentUser()
        }

        if (resolved) return

        console.log(
          'Current user from authService:',
          currentUser ? 'authenticated' : 'not authenticated',
          isNotificationNavigation ? '(notification-triggered)' : ''
        )

        // If this is notification-triggered and no user yet, wait a bit more
        if (isNotificationNavigation && !currentUser) {
          console.log('Notification navigation: waiting for auth state...')
          
          // On iOS, use waitForAuthState with longer timeout for cold starts
          // iOS cold starts from notifications can take 5-8 seconds to restore Cognito session
          const retryUser = isIOS 
            ? await optimizedAuthService.waitForAuthState(8000) // 8s max for iOS cold starts
            : await (async () => {
                await new Promise((resolve) => setTimeout(resolve, 2000)) // 2s for Android/web
                return await optimizedAuthService.getCurrentUser()
              })()
          
          if (retryUser) {
            console.log('Notification navigation: auth state ready on retry')
            clearTimeout(timeout)
            resolved = true
            processAuthState(retryUser, to, from, next, resolve, requiresAuth)
            return
          } else {
            console.warn('Notification navigation: auth state still not ready after wait - this might cause issues')
            // Don't sign out - allow navigation and let the app handle it
            // The user might still be authenticated, just not restored yet
          }
        }

        clearTimeout(timeout)
        if (guardTimeout) clearTimeout(guardTimeout)
        resolved = true

        // Process the auth state
        processAuthState(currentUser, to, from, next, resolve, requiresAuth)
      } catch (error) {
        if (resolved) return

        console.error('Error getting current user:', error)
        clearTimeout(timeout)
        if (guardTimeout) clearTimeout(guardTimeout)
        resolved = true

        // On error, allow navigation to prevent blocking
        // In development, always allow navigation
        if (isDevelopment) {
          console.log('Development mode - allowing navigation despite error')
        }
        next()
        resolve()
      }
    }

    checkAuth()
  })
})

export default router
