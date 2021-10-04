import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('tasks', 'TasksController.list')

  Route.get('tasks/:id', 'TasksController.show')

  Route.post('tasks', 'TasksController.create')

  Route.post('tasks/assign/:id', 'TasksController.assignUser')

  Route.put('tasks/:id', 'TasksController.update')

  Route.delete('tasks/:id', 'TasksController.delete')

  Route.delete('tasks/unssign/:id', 'TasksController.unssignUser')
}).middleware('auth')
