import Route from '@ioc:Adonis/Core/Route'

Route.post('auth/login', 'AuthController.login')

Route.get('auth/logout', 'AuthController.logout')
