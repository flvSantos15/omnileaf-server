import Route from '@ioc:Adonis/Core/Route'
import './routes/Users'
import './routes/Auth'
import './routes/Organizations'
import './routes/Projects'
import './routes/Board'
import './routes/List'
import './routes/Task'
import './routes/TrackingSession'
import './routes/Screenshots'
import './routes/GitlabIntegration'

Route.get('/', async () => {
  return { hello: 'From Development' }
})

Route.post('/test', 'TestsController.test').middleware('auth')
Route.get('/showUsers', 'TestsController.showUsers')
