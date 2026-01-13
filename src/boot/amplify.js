import { defineBoot } from '#q-app/wrappers'
import { Amplify, Auth } from 'aws-amplify'
import logger from 'src/utils/logger'

// Configure Amplify with Cognito settings
// Using legacy format compatible with aws-amplify v5
const configureAmplify = () => {
  try {
    Amplify.configure({
      Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_vuhaTK66l',
        userPoolWebClientId: 'abst7l599fa2fnp0aq6a87lud',
        authenticationFlowType: 'USER_PASSWORD_AUTH',
        mandatorySignIn: false,
        // Ensure tokens are stored in localStorage for persistence
        // Amplify automatically handles token refresh using refresh tokens
        storage: window.localStorage
      }
    })
    
    logger.log('✅ Amplify configured with Cognito')
    logger.log('📍 User Pool ID: us-east-1_vuhaTK66l')
    logger.log('📍 Client ID: abst7l599fa2fnp0aq6a87lud')
    logger.log('📍 Region: us-east-1')
  } catch (error) {
    logger.error('❌ Error configuring Amplify:', error)
    throw error
  }
}

export default defineBoot(({ app }) => {
  configureAmplify()

  app.config.globalProperties.$amplify = Amplify
  app.config.globalProperties.$amplifyAuth = Auth
})

export { Amplify, Auth }

