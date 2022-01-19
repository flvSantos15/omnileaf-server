import Route from '@ioc:Adonis/Core/Route'

Route.post('users', 'UsersController.create')

Route.post('users/forgot-password', 'UsersController.forgotPassword')

Route.patch('users/reset-password/:tokenId', 'UsersController.resetPassword')

Route.group(() => {
  Route.get('users', 'UsersController.list')

  Route.get('users/:id', 'UsersController.show')

  Route.get('users/:id/organizations', 'UsersController.showUserOrganizations')

  Route.get('users/:id/projects', 'UsersController.showUserProjects')

  Route.get('users/:id/projects-daily', 'UsersController.showProjectsWithDailyTrack')

  Route.get('users/:id/tasks', 'UsersController.showUserTasks')

  Route.put('users/:id', 'UsersController.update')

  Route.patch('users/:id/gitlabId', 'UsersController.editGitlabId')

  Route.delete('users/:id', 'UsersController.delete')
}).middleware('auth')
