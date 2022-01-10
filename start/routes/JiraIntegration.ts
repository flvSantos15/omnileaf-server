import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('jira/import-user', 'JiraIntegrationsController.importUser')

  Route.post('jira/import-organization/:id', 'JiraIntegrationsController.importOrganization')

  Route.post('jira/import-project/:id', 'JiraIntegrationsController.importProject')
}).middleware('auth')

Route.post('jira/webhook/issue', 'JiraIntegrationsController.handleWebhook')
