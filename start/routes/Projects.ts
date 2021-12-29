import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('projects', 'ProjectsController.list')

  Route.get('projects/:id', 'ProjectsController.show')

  Route.post('projects', 'ProjectsController.create')

  Route.post('projects/add/:id', 'ProjectsController.addParticipant')

  Route.put('projects/:id', 'ProjectsController.update')

  Route.delete('projects/:id', 'ProjectsController.delete')

  Route.delete('projects/remove/:id', 'ProjectsController.removeParticipant')
}).middleware('auth')
