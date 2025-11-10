import { defineBoot } from '#q-app/wrappers'
import { Amplify, Auth } from 'aws-amplify'
import awsExports from '../aws-exports'

const configureAmplify = () => {
  Amplify.configure(awsExports)
}

export default defineBoot(({ app }) => {
  configureAmplify()

  app.config.globalProperties.$amplify = Amplify
  app.config.globalProperties.$amplifyAuth = Auth
})

export { Amplify, Auth }

