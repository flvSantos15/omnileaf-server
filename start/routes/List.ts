import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('lists', 'ListsController.lists')

  Route.get('lists/:id', 'ListsController.show')

  Route.post('lists', 'ListsController.create')

  Route.put('lists/:id', 'ListsController.update')

  Route.delete('lists/:id', 'ListsController.delete')
}).middleware('auth')
