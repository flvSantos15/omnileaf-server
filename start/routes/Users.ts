import Route from '@ioc:Adonis/Core/Route'

Route.post('users', 'UsersController.create')

Route.post('users/forgot-password', 'UsersController.forgotPassword')

Route.patch('users/reset-password/:tokenId', 'UsersController.resetPassword')

Route.group(() => {
  Route.get('users', 'UsersController.list')

  Route.get('users/:id', 'UsersController.show')

  Route.put('users/:id', 'UsersController.update')

  Route.delete('users/:id', 'UsersController.delete')
}).middleware('auth')
