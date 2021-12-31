import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'
import ImportJiraUserValidator from 'App/Validators/JiraIntegration/ImportJiraUserValidator'
import ImportJiraOrganizationValidator from 'App/Validators/JiraIntegration/ImportOrganizationValidator'
import Logger from '@ioc:Adonis/Core/Logger'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'

export default class JiraIntegrationsController {
  public async importUser({ request, response, auth, bouncer }: HttpContextContract) {
    const payload = await request.validate(ImportJiraUserValidator)

    const user = auth.use('web').user

    await JiraIntegrationService.importUser({ payload, user, bouncer })

    Logger.info('Successfully integrated user with Jira')

    return response.status(204)
  }

  public async importOrganization({ request, response, auth, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(ImportJiraOrganizationValidator)

    const user = auth.use('web').user!

    await JiraIntegrationService.importOrganization({ id, user, payload, bouncer })

    Logger.info('Succesfully integrated Organization with Jira')

    response.status(204)
  }
}
