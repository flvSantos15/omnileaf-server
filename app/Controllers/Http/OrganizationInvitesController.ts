import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrganizationInviteService from 'App/Services/Organization/OrganizationInviteService'
import UuidValidator from 'App/Validators/Global/UuidValidator'
import InviteAnswerValidator from 'App/Validators/Organization/InviteAnswerValidator'
import InviteUserValidator from 'App/Validators/Organization/InviteUserValidator'
import UpdateInviteValidator from 'App/Validators/Organization/UpdateInviteValidator'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'

export default class OrganizationInvitesController {
  public async invite({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(InviteUserValidator)

    const invite = await OrganizationInviteService.create({ id, payload, bouncer })

    logger.info('Succesfully created invite')

    response.created(invite)
  }

  public async update({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('inviteId'))

    const payload = await request.validate(UpdateInviteValidator)

    const invite = await OrganizationInviteService.update({ id, payload, bouncer })

    logger.info('Succesfully updated invite')

    response.send(invite)
  }

  public async userAnswer({ request, response, auth, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('inviteId'))

    const { status } = await request.validate(InviteAnswerValidator)

    switch (status) {
      case OrganizationInviteStatus.ACCEPTED:
        await OrganizationInviteService.accept({ id, auth })

        logger.info('Succesfully accepted organization invite')
        break

      case OrganizationInviteStatus.DENIED:
        await OrganizationInviteService.denie({ id, auth })

        logger.info('Succesfully denied organization invite')
        break
    }

    response.noContent()
  }

  public async listUserInvites({ response, auth, logger }: HttpContextContract) {
    const invites = await OrganizationInviteService.listUserInvites({ auth })

    logger.info('Succesfully retrieved user invites')

    response.send(invites)
  }

  public async listOrganizationInvites({
    request,
    response,
    bouncer,
    logger,
  }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const invites = await OrganizationInviteService.listOrganizationInvites({ id, bouncer })

    logger.info('Succesfully retrieved organization invites')

    response.send(invites)
  }
}
