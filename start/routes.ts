import Route from '@ioc:Adonis/Core/Route'
import './routes/Users'
import './routes/Auth'
import './routes/Organizations'
import './routes/Projects'
import './routes/Board'

Route.get('/', async () => {
  return { hello: 'From Development' }
})
