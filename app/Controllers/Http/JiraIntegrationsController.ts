import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'
import ImportJiraUserValidator from 'App/Validators/JiraIntegration/ImportJiraUserValidator'

export default class JiraIntegrationsController {
  public async importUser({ request, response, auth, bouncer }: HttpContextContract) {
    const payload = await request.validate(ImportJiraUserValidator)

    const user = auth.use('web').user

    await JiraIntegrationService.importUser({ payload, user, bouncer })

    return response.status(204)
  }
}
