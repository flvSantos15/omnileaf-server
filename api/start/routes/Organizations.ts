import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('organizations', 'OrganizationsController.list')

  Route.get('organizations/:id', 'OrganizationsController.show')

  Route.post('organizations', 'OrganizationsController.create')

  Route.put('organizations/:id', 'OrganizationsController.update')

  Route.delete('organizations/:id', 'OrganizationsController.delete')

  Route.delete('organizations/:id/member', 'OrganizationsController.removeMember')

  /**
   *
   * Organization invites
   *  */
  Route.post('organizations/:id/invite', 'OrganizationInvitesController.invite')

  Route.patch('organizations/:id/invite', 'OrganizationInvitesController.userAnswer')
}).middleware('auth')
