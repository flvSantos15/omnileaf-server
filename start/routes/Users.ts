import Route from '@ioc:Adonis/Core/Route'

Route.post('users', 'UsersController.create')

Route.group(() => {
  Route.get('users', 'UsersController.list')

  Route.get('users/:id', 'UsersController.show')

  Route.put('users/:id', 'UsersController.update')

  Route.delete('users/:id', 'UsersController.delete')
}).middleware('auth')
