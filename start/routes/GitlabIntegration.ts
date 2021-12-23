import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('gitlab/refresh-user', 'GitlabIntegrationsController.updateUser')

  Route.post('gitlab/import-project', 'GitlabIntegrationsController.importProject')

  Route.post('gitlab/connect-organization', 'GitlabIntegrationsController.importOrganization')
}).middleware('auth')
