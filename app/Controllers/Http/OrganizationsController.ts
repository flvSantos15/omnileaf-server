import Organization from 'App/Models/Organization'
import { OrganizationRoles } from 'Contracts/enums'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import CreateOrganizationValidator from 'App/Validators/Organization/CreateOrganizationValidator'
import UpdateOrganizationValidator from 'App/Validators/Organization/UpdateOrganizationValidator'
import { ValidateAddOrganizationMember } from 'App/Validators/Organization/AddOrganizationMemberValidator'
import { ValidateRemoveOrganizationMember } from 'App/Validators/Organization/RemoveOrganizationMemberValidator'
import { LogCreated, LogDeleted, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { LoadProjectRelations } from 'App/Helpers/RelationsLoaders/ProjectRelationsLoader'

export default class OrganizationsController {
  public async create({ request, response, auth }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateOrganizationValidator)

    const organization = await Organization.create({ ...payload, creatorId: user.id })

    await organization.related('members').attach({
      [user.id]: {
        member_role: OrganizationRoles.MANAGER,
      },
    })

    LogCreated(organization)

    response.status(201).json(organization)
  }

  public async list({ response }: HttpContextContract) {
    const organizations = await Organization.all()

    LogList(organizations)

    response.send(organizations)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const organization = await LoadProjectRelations(id, request.qs())

    LogShow(organization)

    response.send(organization)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateOrganizationValidator)

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('OrganizationManager', organization)

    await organization.merge(payload).save()

    LogUpdated(organization)

    response.send(organization)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('OrganizationCreator', organization)

    LogDeleted(organization)

    await organization.delete()

    response.status(204)
  }

  public async addMember({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const { userId, memberRole } = await ValidateAddOrganizationMember(id, request)

    const organization = await Organization.findOrFail(id)

    await bouncer.authorize('OrganizationManager', organization)

    organization.related('members').attach({
      [userId]: {
        member_role: memberRole,
      },
    })

    response.status(204)
  }

  public async removeMember({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const { userId, organization } = await ValidateRemoveOrganizationMember(id, request)

    await bouncer.authorize('OrganizationManager', organization)

    await organization.related('members').detach([userId])

    response.status(204)
  }
}
