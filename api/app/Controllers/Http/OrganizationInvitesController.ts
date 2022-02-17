import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrganizationInviteService from 'App/Services/Organization/OrganizationInviteService'
import UuidValidator from 'App/Validators/Global/UuidValidator'
import InviteAnswerValidator from 'App/Validators/Organization/InviteAnswerValidator'
import InviteUserValidator from 'App/Validators/Organization/InviteUserValidator'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'

export default class OrganizationInvitesController {
  public async invite({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(InviteUserValidator)

    await OrganizationInviteService.inviteUser({ id, payload, bouncer })

    logger.info('Succesfully sended user invite')

    response.noContent()
  }

  public async userAnswer({ request, response, auth, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

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
}
