import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('boards', 'BoardsController.list')

  Route.get('boards/:id', 'BoardsController.show')

  Route.post('boards', 'BoardsController.create')

  Route.put('boards/:id', 'BoardsController.update')

  Route.delete('boards/:id', 'BoardsController.delete')
}).middleware('auth')
