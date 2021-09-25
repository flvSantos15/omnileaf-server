import Route from '@ioc:Adonis/Core/Route'
import './routes/Users'

Route.get('/', async () => {
  return { hello: 'From Development Test' }
})
