import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('gitlab/import-project', 'GitlabIntegrationsController.importProject')
}).middleware('auth')
