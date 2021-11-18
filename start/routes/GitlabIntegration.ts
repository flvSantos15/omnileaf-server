import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('gitlab/import-project', 'GitlabIntegrationsController.importProject')

  Route.post(
    'gitlab/connect-organization',
    'GitlabIntegrationsController.connectOrganizationToGitlab'
  )
}).middleware('auth')
