import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('organizations', 'OrganizationsController.list')

  Route.get('organizations/:id', 'OrganizationsController.show')

  Route.post('organizations', 'OrganizationsController.create')

  Route.post('organizations/add/:id', 'OrganizationsController.addMember')

  Route.put('organizations/:id', 'OrganizationsController.update')

  Route.delete('organizations/:id', 'OrganizationsController.delete')

  Route.delete('organizations/remove/:id', 'OrganizationsController.removeMember')
}).middleware('auth')
