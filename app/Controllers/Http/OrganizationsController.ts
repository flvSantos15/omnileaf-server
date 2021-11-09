import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import CreateOrganizationValidator from 'App/Validators/Organization/CreateOrganizationValidator'
import UpdateOrganizationValidator from 'App/Validators/Organization/UpdateOrganizationValidator'
import AddOrganizationMemberValidator from 'App/Validators/Organization/AddOrganizationMemberValidator'
import ListOrganizationService from 'App/Services/OrganizationServices/ListOrganizationService'
import CreateOrganizationService from 'App/Services/OrganizationServices/CreateOrganizationService'
import ShowOrganizationService from 'App/Services/OrganizationServices/ShowOrganizationService'
import UpdateOrganizationService from 'App/Services/OrganizationServices/UpdateOrganizationService'
import DeleteOrganizationService from 'App/Services/OrganizationServices/DeleteOrganizationService'
import AddMemberService from 'App/Services/OrganizationServices/AddMemberService'
import RemoveMemberService from 'App/Services/OrganizationServices/RemoveMemberService'
import RemoveOrganizationMemberValidator from 'App/Validators/Organization/RemoveOrganizationMemberValidator'

export default class OrganizationsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const createOrganization = new CreateOrganizationService()
    const user = auth.use('web').user!

    const payload = await request.validate(CreateOrganizationValidator)

    const organization = await createOrganization.execute({ user, payload })

    response.status(201).json(organization)
  }

  public async list({ response }: HttpContextContract) {
    const listOrganizations = new ListOrganizationService()

    const organizations = await listOrganizations.execute()

    response.send(organizations)
  }

  public async show({ request, response }: HttpContextContract) {
    const showOrganization = new ShowOrganizationService()

    const id = validateIdParam(request.param('id'))

    const organization = await showOrganization.execute(id)

    response.send(organization)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const updateOrganization = new UpdateOrganizationService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateOrganizationValidator)

    const organization = await updateOrganization.execute({ id, payload, bouncer })

    response.send(organization)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const deleteOrganization = new DeleteOrganizationService()

    const id = validateIdParam(request.param('id'))

    await deleteOrganization.execute({ id, bouncer })

    response.status(204)
  }

  public async addMember({ request, response, bouncer }: HttpContextContract) {
    const addOrganizationMember = new AddMemberService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(AddOrganizationMemberValidator)

    await addOrganizationMember.execute({ id, payload, bouncer })

    response.status(204)
  }

  public async removeMember({ request, response, bouncer }: HttpContextContract) {
    const removeOrganizationMember = new RemoveMemberService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(RemoveOrganizationMemberValidator)

    await removeOrganizationMember.execute({ id, payload, bouncer })

    response.status(204)
  }
}
