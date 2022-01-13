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

const enviroment = Env.get('NODE_ENV')
const helloMessage =
  enviroment === 'production' ? 'Hello from Production' : 'Hello from Development'

Route.get('/', async () => {
  return helloMessage
})

Route.post('/test', 'TestsController.test').middleware('auth')
Route.get('/showUsers', 'TestsController.showUsers')
