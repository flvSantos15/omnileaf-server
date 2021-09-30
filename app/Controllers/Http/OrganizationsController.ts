import Organization from 'App/Models/Organization'
import CreateOrganizationValidator from 'App/Validators/Organization/CreateOrganizationValidator'
import UpdateOrganizationValidator from 'App/Validators/Organization/UpdateOrganizationValidator'
import {
  ListOrganizationLoader,
  ShowOrganizationLoader,
} from 'App/Helpers/ControllerLoaders/OrganizationsLoaders'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogCreated, LogDeleted, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { OrganizationRoles } from 'Contracts/enums'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import OrganizationExceptions from 'App/Exceptions/CustomExceptionsHandlers/OrganizationExceptions'
import AddOrganizationMemberValidator from 'App/Validators/Organization/AddOrganizationMemberValidator'
import RemoveOrganizationMemberValidator from 'App/Validators/Organization/RemoveOrganizationMemberValidator'

export default class OrganizationsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateOrganizationValidator)

    const organization = await Organization.create({ ...payload, creatorId: user.id })

    await organization.related('members').attach({
      [user.id]: {
        member_type: OrganizationRoles.MANAGER,
      },
    })

    LogCreated(organization)

    response.status(201).json(organization)
  }

  public async list({ request, response }: HttpContextContract) {
    const organizations = await ListOrganizationLoader(request.qs())

    LogList(organizations)

    response.send(organizations)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')

    const organization = await ShowOrganizationLoader(id, request.qs())

    LogShow(organization)

    response.send(organization)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateOrganizationValidator)

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('editOrganizationOrAddAndRemoveMember', organization)

    await organization.merge(payload).save()

    LogUpdated(organization)

    response.send(organization)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('deleteOrganization', organization)

    LogDeleted(organization)

    await organization.delete()

    response.status(204)
  }

  public async addMember({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))
    const { userId, memberType } = await request.validate(AddOrganizationMemberValidator)

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('editOrganizationOrAddAndRemoveMember', organization)

    organization.related('members').attach({
      [userId]: {
        member_type: memberType,
      },
    })

    response.status(204)
  }

  public async removeMember({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const { userId } = await request.validate(RemoveOrganizationMemberValidator)

    const organization = await Organization.findOrFail(id)

    OrganizationExceptions.checkIfUserIsNotCreator(organization.creatorId, userId)

    await bouncer.authorize('editOrganizationOrAddAndRemoveMember', organization)

    await organization.related('members').detach([userId])

    response.status(204)
  }
}
