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
  Route.get('organizations/:id/invites', 'OrganizationInvitesController.listOrganizationInvites')

  Route.post('organizations/:id/invites', 'OrganizationInvitesController.invite')

  Route.put('organizations/:id/invites/:inviteId', 'OrganizationInvitesController.update')

  Route.patch(
    'organizations/:id/invites/:inviteId/status',
    'OrganizationInvitesController.userAnswer'
  )
}).middleware('auth')
