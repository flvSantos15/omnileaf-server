import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ManualEntryService from 'App/Services/ManualEntry/ManualEntryService'
import CreateManualEntryValidator from 'App/Validators/ManualEntry/CreateManualEntryValidator'

export default class ManualEntriesController {
  public async register({ request, response, bouncer, auth, logger }: HttpContextContract) {
    const payload = await request.validate(CreateManualEntryValidator)

    const manualEntry = await ManualEntryService.register({ payload, bouncer, auth })

    logger.info('Succesfully created new Manual entry request')

    response.send(manualEntry)
  }
}
