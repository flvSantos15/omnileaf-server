import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('gitlab/import-user', 'GitlabIntegrationsController.importUser')

  Route.post('gitlab/import-organization/:id', 'GitlabIntegrationsController.importOrganization')

  Route.post('gitlab/import-project/:id', 'GitlabIntegrationsController.importProject')
}).middleware('auth')

Route.post('gitlab/webhook/issue', 'GitlabIntegrationsController.handleWebhook')
