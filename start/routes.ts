import Route from '@ioc:Adonis/Core/Route'
import './routes/Users'
import './routes/Auth'

Route.get('/', async () => {
  return { hello: 'From Development' }
})
