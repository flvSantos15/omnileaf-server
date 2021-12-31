import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('jira/import-user', 'JiraIntegrationsController.importUser')

  Route.post('jira/import-organization/:id', 'JiraIntegrationsController.importOrganization')
}).middleware('auth')
