import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ManualEntryService from 'App/Services/ManualEntry/ManualEntryService'
import UuidValidator from 'App/Validators/Global/UuidValidator'
import CreateManualEntryValidator from 'App/Validators/ManualEntry/CreateManualEntryValidator'

export default class ManualEntriesController {
  public async create({ request, response, bouncer, auth, logger }: HttpContextContract) {
    const payload = await request.validate(CreateManualEntryValidator)

    const entry = await ManualEntryService.register({ payload, bouncer, auth })

    logger.info('Succesfully created new manual entry request')

    response.send(entry)
  }

  public async approove({ request, response, bouncer, logger }: HttpContextContract) {
    const entryId = UuidValidator.v4(request.param('id'))

    await ManualEntryService.approove({ entryId, bouncer })

    logger.info('Succesfully approoved manual entry request')

    response.status(204)
  }

  public async deny({ request, response, bouncer, logger }: HttpContextContract) {
    const entryId = UuidValidator.v4(request.param('id'))

    await ManualEntryService.deny({ entryId, bouncer })

    logger.info('Succesfully denied manual entry request')

    response.status(204)
  }
}
