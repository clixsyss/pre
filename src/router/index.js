import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from '../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { validateProfileCompletion, getNextProfileStep } from '../utils/profileValidation'

// Import pages
import Onboarding from '../pages/unauth/Onboarding.vue'
import SignIn from '../pages/unauth/SignIn.vue'
import Register from '../pages/unauth/Register.vue'
import VerifyEmail from '../pages/unauth/VerifyEmail.vue'
import PersonalDetails from '../pages/unauth/PersonalDetails.vue'
import Support from '../pages/unauth/Support.vue'
import Home from '../pages/auth/Home.vue'
import Profile from '../pages/auth/ProfilePage.vue'
import ProjectSelection from '../pages/auth/ProjectSelection.vue'

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

  {
    path: '/support',
    name: 'Support',
    component: Support,
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
  
  // Catch all route - redirect to onboarding
  {
    path: '/:pathMatch(.*)*',
    redirect: '/onboarding'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigation guard - to:', to.path, 'from:', from.path)
  const requiresAuth = to.meta.requiresAuth
  
  // Check authentication status with timeout
  return new Promise((resolve) => {
    let resolved = false
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('Auth check timeout, allowing navigation')
        resolved = true
        next()
        resolve()
      }
    }, 5000) // 5 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (resolved) return
      
      unsubscribe()
      clearTimeout(timeout)
      resolved = true
      
      console.log('Auth state changed - user:', user ? 'authenticated' : 'not authenticated')
      
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
                  // Check if profile is complete
          try {
            const userDocRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userDocRef)
            
            if (userDoc.exists()) {
              const userData = userDoc.data()
              console.log('User data from Firestore:', userData)
              
              const profileValidation = validateProfileCompletion(userData)
              console.log('Profile validation result:', profileValidation)
              
              if (!profileValidation.isComplete) {
                // Profile incomplete - redirect to appropriate completion step
                const nextStep = getNextProfileStep(userData)
                console.log('Next step for profile completion:', nextStep)
                
                switch (nextStep) {
                  case 'email_verification':
                    console.log('Redirecting to email verification')
                    next('/register/verify-email')
                    break
                  case 'property_details':
                    console.log('Redirecting to property details')
                    next('/register')
                    break
                  case 'personal_details':
                    console.log('Redirecting to personal details')
                    next('/register/personal-details')
                    break
                  default:
                    console.log('Redirecting to register (default)')
                    next('/register')
                }
                resolve()
                return
              } else {
                console.log('Profile is complete, allowing access to:', to.path)
              }
              
              // Check if user has selected a project (except for project-selection page)
              if (to.path !== '/project-selection') {
                // Check localStorage for selected project
                const selectedProjectId = localStorage.getItem('selectedProjectId')
                
                if (!selectedProjectId) {
                  console.log('No project selected, redirecting to project selection')
                  next('/project-selection')
                  resolve()
                  return
                }
              }
            } else {
              console.log('No user document found in Firestore')
            }
            
            // Profile complete or no profile data - allow access
            next()
            resolve()
          } catch (error) {
            console.error('Error checking profile completion:', error)
            // On error, allow access but log the issue
            next()
            resolve()
          }
      } else {
        // Allow navigation for non-protected routes
        next()
        resolve()
      }
    })
  })
})

export default router
