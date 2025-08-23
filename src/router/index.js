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
    path: '/home',
    name: 'Home',
    component: Home,
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
  const requiresAuth = to.meta.requiresAuth
  
  // Check authentication status
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      
      if (requiresAuth && !user) {
        // Route requires auth but user is not authenticated
        next('/onboarding')
        resolve()
      } else if (!requiresAuth && user && to.path === '/onboarding') {
        // User is authenticated but trying to access onboarding
        next('/home')
        resolve()
      } else if (user && requiresAuth) {
        // User is authenticated and trying to access protected route
        // Check if profile is complete
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const profileValidation = validateProfileCompletion(userData)
            
            if (!profileValidation.isComplete) {
              // Profile incomplete - redirect to appropriate completion step
              const nextStep = getNextProfileStep(userData)
              
              switch (nextStep) {
                case 'email_verification':
                  next('/register/verify-email')
                  break
                case 'property_details':
                  next('/register')
                  break
                case 'personal_details':
                  next('/register/personal-details')
                  break
                default:
                  next('/register')
              }
              resolve()
              return
            }
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
