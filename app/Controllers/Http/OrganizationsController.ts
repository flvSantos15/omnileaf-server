import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateOrganizationValidator from 'App/Validators/Organization/CreateOrganizationValidator'
import UpdateOrganizationValidator from 'App/Validators/Organization/UpdateOrganizationValidator'
import RemoveOrganizationMemberValidator from 'App/Validators/Organization/RemoveOrganizationMemberValidator'
import OrganizationService from 'App/Services/Organization/OrganizationService'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class OrganizationsController {
  public async list({ response }: HttpContextContract) {
    const organizations = await OrganizationService.getAll()

    Logger.info('Organizations list retrieved succesfully')

    response.send(organizations)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const organization = await OrganizationService.getOne(id)

    Logger.info('Organization retrieved succesfully')

    response.send(organization)
  }

  public async create({ request, response, auth }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateOrganizationValidator)

    const organization = await OrganizationService.register({ user, payload })

    Logger.info('Organization created succesfully')

    response.status(201).json(organization)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(UpdateOrganizationValidator)

    const organization = await OrganizationService.update({ id, payload, bouncer })

    Logger.info('Organization updated succesfully')

    response.send(organization)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    await OrganizationService.delete({ id, bouncer })

    Logger.info('Organization deleted succesfully')

    response.status(204)
  }

  public async removeMember({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(RemoveOrganizationMemberValidator)

    await OrganizationService.removeMember({ id, payload, bouncer })

    Logger.info('Succesfully removed member from organziation')

    response.status(204)
  }
}
