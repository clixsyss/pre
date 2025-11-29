import { defineBoot } from '#q-app/wrappers'
import { Amplify, Auth } from 'aws-amplify'

// Configure Amplify with Cognito settings
const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_vuhaTK66l',
      userPoolWebClientId: 'abst7l599fa2fnp0aq6a87lud',
      authenticationFlowType: 'USER_PASSWORD_AUTH',
    },
    // Optional: Configure AWS region for other services (DynamoDB, S3, etc.)
    aws_project_region: 'us-east-1',
    // If using Cognito Identity Pool for AWS service access:
    // aws_cognito_identity_pool_id: 'us-east-1:xxxxx',
    // aws_cognito_region: 'us-east-1',
  })
  
  console.log('✅ Amplify configured with Cognito')
  console.log('📍 AWS Region: us-east-1')
}

export default defineBoot(({ app }) => {
  configureAmplify()

  app.config.globalProperties.$amplify = Amplify
  app.config.globalProperties.$amplifyAuth = Auth
})

export { Amplify, Auth }

