import { createRouter, createWebHistory } from 'vue-router'
import optimizedAuthService from '../services/optimizedAuthService'
import firestoreService from '../services/firestoreService'
import { canUserAccessRoute, checkUserSuspension } from '../services/suspensionService'

// Import pages
import Onboarding from '../pages/unauth/Onboarding.vue'
import SignIn from '../pages/unauth/SignIn.vue'
import Register from '../pages/unauth/Register.vue'
import VerifyEmail from '../pages/unauth/VerifyEmail.vue'
import PersonalDetails from '../pages/unauth/PersonalDetails.vue'
import Home from '../pages/auth/Home.vue'
import Profile from '../pages/auth/ProfilePage.vue'
import ProjectSelection from '../pages/auth/ProjectSelection.vue'
import AuthSupport from '../pages/auth/Support.vue'
import SupportChatPage from '../pages/auth/SupportChatPage.vue'

const routes = [
  // Root redirects to onboarding
  {
    path: '/',
    redirect: '/onboarding'
  },

  // Unauthorized user routes
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: false }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/register/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { requiresAuth: false }
  },
  {
    path: '/register/personal-details',
    name: 'PersonalDetails',
    component: PersonalDetails,
    meta: { requiresAuth: false }
  },


  // Authorized user routes
  {
    path: '/project-selection',
    name: 'ProjectSelection',
    component: ProjectSelection,
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/access',
    name: 'Access',
    component: () => import('../pages/auth/Access.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../pages/auth/Services.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service-category/:id',
    name: 'ServiceCategoryDetails',
    component: () => import('../pages/auth/ServiceCategoryDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/facilities',
    name: 'Facilities',
    component: () => import('../pages/auth/Facilities.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stores-shopping',
    name: 'StoresShopping',
    component: () => import('../pages/auth/StoresShopping.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/store/:storeId',
    name: 'StoreDetails',
    component: () => import('../pages/auth/StoreDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shopping-cart',
    name: 'ShoppingCart',
    component: () => import('../pages/auth/ShoppingCart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/court-booking',
    name: 'CourtBooking',
    component: () => import('../pages/auth/CourtBooking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academy-booking',
    name: 'AcademyBooking',
    component: () => import('../pages/auth/AcademyBooking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academy-programs',
    name: 'AcademyPrograms',
    component: () => import('../pages/auth/AcademyPrograms.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academy-details/:id',
    name: 'AcademyDetails',
    component: () => import('../pages/auth/AcademyDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academy-registration/:academyId/:programId',
    name: 'AcademyRegistration',
    component: () => import('../pages/auth/AcademyRegistration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: () => import('../pages/auth/MyBookings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../pages/auth/Calendar.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../pages/auth/Analytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../pages/auth/News.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/complaints',
    name: 'Complaints',
    component: () => import('../pages/auth/Complaints.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/complaints/:id',
    name: 'ComplaintChat',
    component: () => import('../components/ComplaintChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/violations',
    name: 'Violations',
    component: () => import('../pages/auth/ViolationsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/violation-chat/:id',
    name: 'ViolationChat',
    component: () => import('../components/ViolationChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service-booking-chat/:id',
    name: 'ServiceBookingChat',
    component: () => import('../components/ServiceBookingChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/violation-chat/:id',
    name: 'ViolationChat',
    component: () => import('../components/ViolationChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/smart-devices',
    name: 'SmartDevices',
    component: () => import('../pages/auth/SmartDevices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/support',
    name: 'AuthSupport',
    component: AuthSupport,
    meta: { requiresAuth: true }
  },
  {
    path: '/support-chat',
    name: 'SupportChat',
    component: SupportChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/support-chat/:id',
    name: 'SupportChatById',
    component: SupportChatPage,
    meta: { requiresAuth: true }
  },

  // Catch all route - redirect to onboarding
  {
    path: '/:pathMatch(.*)*',
    redirect: '/onboarding'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when navigating between pages
    return { top: 0 }
  }
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

  if (requiresAuth && !user) {
    // Route requires auth but user is not authenticated
    next('/onboarding')
    resolve()
  } else if (!requiresAuth && user && to.path === '/onboarding') {
    // User is authenticated but trying to access onboarding
    // Only redirect if they're not in the middle of registration
    if (!from.path || !from.path.startsWith('/register')) {
      next('/home')
      resolve()
    } else {
      next()
      resolve()
    }
  } else if (user && requiresAuth) {
    // User is authenticated and trying to access protected route
    // Run profile and suspension checks in parallel for better performance
    try {
      const [userDocResult, suspensionResult] = await Promise.allSettled([
        firestoreService.getDoc(`users/${user.uid}`),
        canUserAccessRoute(user.uid, to.path)
      ])
      
      // Check profile completion
      if (userDocResult.status === 'fulfilled' && userDocResult.value.exists()) {
        const userData = userDocResult.value.data()
        const isProfileComplete = userData.isProfileComplete
        
        if (!isProfileComplete) {
          console.log('Profile incomplete, redirecting to onboarding')
          next('/onboarding')
          resolve()
          return
        }
      }
      
      // Check suspension status
      if (suspensionResult.status === 'fulfilled' && !suspensionResult.value) {
        console.log('User is suspended and cannot access this route:', to.path)
        
        // Check suspension details to show proper message
        try {
          const suspensionStatus = await checkUserSuspension(user.uid)
          if (suspensionStatus.isSuspended) {
            // Emit event to show suspension message
            window.dispatchEvent(new CustomEvent('showSuspensionMessage', {
              detail: {
                suspensionDetails: suspensionStatus.suspensionDetails,
                attemptedRoute: to.path
              }
            }))
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
  const requiresAuth = to.meta.requiresAuth

  // For non-authenticated routes, allow immediate navigation
  if (!requiresAuth) {
    next()
    return
  }

  // Check authentication status with optimized timeout
  return new Promise((resolve) => {
    let resolved = false

    // Reduced timeout for better UX
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('Auth check timeout, allowing navigation')
        resolved = true
        next()
        resolve()
      }
    }, 2000) // Reduced from 5s to 2s

    // Get current user using optimized auth service
    optimizedAuthService.getCurrentUser().then(currentUser => {
      if (resolved) return
      
      console.log('Current user from authService:', currentUser ? 'authenticated' : 'not authenticated')
      
      clearTimeout(timeout)
      resolved = true
      
      // Process the auth state
      processAuthState(currentUser, to, from, next, resolve, requiresAuth)
    }).catch(error => {
      if (resolved) return
      
      console.error('Error getting current user:', error)
      clearTimeout(timeout)
      resolved = true
      
      // On error, allow navigation to prevent blocking
      next()
      resolve()
    })
  })
})

export default router

