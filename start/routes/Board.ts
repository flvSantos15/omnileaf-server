import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('board', 'BoardController.list')

  Route.get('board/:id', 'BoardController.show')

  Route.post('board', 'BoardController.create')

  Route.put('board/:id', 'BoardController.update')

  Route.delete('board/:id', 'BoardController.delete')
}).middleware('auth')
