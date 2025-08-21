import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Import pages
import Onboarding from '../pages/unauth/Onboarding.vue'
import SignIn from '../pages/unauth/SignIn.vue'
import Register from '../pages/unauth/Register.vue'
import VerifyEmail from '../pages/unauth/VerifyEmail.vue'
import PersonalDetails from '../pages/unauth/PersonalDetails.vue'
import Support from '../pages/unauth/Support.vue'
import Home from '../pages/auth/Home.vue'

const routes = [
  // Unauthorized user routes
  {
    path: '/',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: false }
  },
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      
      if (requiresAuth && !user) {
        // Route requires auth but user is not authenticated
        next('/onboarding')
        resolve()
      } else if (!requiresAuth && user && to.path === '/onboarding') {
        // User is authenticated but trying to access onboarding
        next('/home')
        resolve()
      } else {
        // Allow navigation
        next()
        resolve()
      }
    })
  })
})

export default router
