import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('list', 'ListController.list')

  Route.get('list/:id', 'ListController.show')

  Route.post('list', 'ListController.create')

  Route.put('list/:id', 'ListController.update')

  Route.delete('list/:id', 'ListController.delete')
}).middleware('auth')
