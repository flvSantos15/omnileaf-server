import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('gitlab/import-project', 'GitlabIntegrationsController.importProject')
}).middleware('auth')
