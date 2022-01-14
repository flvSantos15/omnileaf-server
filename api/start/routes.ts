import Route from '@ioc:Adonis/Core/Route'
import './routes/Users'
import './routes/Auth'
import './routes/Organizations'
import './routes/Projects'
import './routes/Task'
import './routes/TrackingSession'
import './routes/Screenshots'
import './routes/GitlabIntegration'
import './routes/JiraIntegration'

import Env from '@ioc:Adonis/Core/Env'

const helloMessage = Env.get('NODE_ENV') === 'production' ? 'From Production' : 'From Development'

Route.get('/', async () => {
  return { hello: helloMessage }
})

Route.post('/test', 'TestsController.test').middleware('auth')
