const routes = [
  {
    path: '/',
    redirect: '/onboarding'
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/onboarding'
  }
]

export default routes
