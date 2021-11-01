import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('gitlab/refresh-project', 'GitlabIntegrationsController.refreshProject')
}).middleware('auth')
