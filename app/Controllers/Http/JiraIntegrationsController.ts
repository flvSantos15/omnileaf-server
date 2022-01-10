import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'
import ImportJiraUserValidator from 'App/Validators/JiraIntegration/ImportJiraUserValidator'
import ImportJiraOrganizationValidator from 'App/Validators/JiraIntegration/ImportOrganizationValidator'
import Logger from '@ioc:Adonis/Core/Logger'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import {
  JiraIssueWebhook,
  JiraIssueWebhookEvent,
} from 'App/Interfaces/Jira/jira-integration-service.interfaces'
import ImportJiraProjectValidator from 'App/Validators/JiraIntegration/ImportProjectValidator'

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

  public async importProject({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(ImportJiraProjectValidator)

    await JiraIntegrationService.importProject({ id, payload, bouncer })

    response.status(204)
  }

  public async handleWebhook({ request, response }: HttpContextContract) {
    const { webhookEvent, issue } = request.only([
      'webhookEvent',
      'issue',
    ]) as unknown as JiraIssueWebhook

    console.log(webhookEvent)

    console.log(issue)

    switch (webhookEvent) {
      case JiraIssueWebhookEvent.CREATED:
        await JiraIntegrationService.createOrUpdateIssueByWebHook(issue)
        break
      case JiraIssueWebhookEvent.UPDATED:
        await JiraIntegrationService.createOrUpdateIssueByWebHook(issue)
        break
      case JiraIssueWebhookEvent.DELETED:
        await JiraIntegrationService.deleteIssueByWebhook(issue.id)
        break
      default:
        Logger.info('Webhook event not recognized.')
    }

    response.status(200)
  }
}
