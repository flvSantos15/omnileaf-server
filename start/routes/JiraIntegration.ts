import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('jira/import-user', 'JiraIntegrationsController.importUser')
}).middleware('auth')
