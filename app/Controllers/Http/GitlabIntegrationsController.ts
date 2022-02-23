import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GitlabIssueWebhook } from 'App/Interfaces/Gitlab/gitlab-integration-service.interfaces'
import ImportGitlabOrganizationValidator from 'App/Validators/GitlabIntegration/ImportGitlabOrganizationValidator'
import ImportGitlabProjectValidator from 'App/Validators/GitlabIntegration/ImportGitlabProjectValidator'
import ImportGitlabUserValidator from 'App/Validators/GitlabIntegration/ImportGitlabUserValidator'
import GitlabIntegrationService from 'App/Services/GitlabIntegration/GitlabIntegrationService'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class GitlabIntegrationsController {
  public async importUser({ request, response, auth, bouncer, logger }: HttpContextContract) {
    const payload = await request.validate(ImportGitlabUserValidator)

    const user = auth.use('web').user

    await GitlabIntegrationService.importUser({ payload, user, bouncer })

    logger.info('Succesfully integrated user with Gitlab')

    response.status(200)
  }

  public async importOrganization({
    request,
    response,
    auth,
    bouncer,
    logger,
  }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(ImportGitlabOrganizationValidator)

    const user = auth.use('web').user!

    await GitlabIntegrationService.importOrganization({ id, payload, user, bouncer })

    logger.info('Succesfully integrated organization with Gitlab')

    response.status(200)
  }

  public async importProject({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(ImportGitlabProjectValidator)

    await GitlabIntegrationService.importProject({ id, payload, bouncer })

    logger.info('Succesfully integrated project with Gitlab')

    response.status(200)
  }

  public async handleWebhook({ request, response, logger }: HttpContextContract) {
    const { object_attributes } = request.only([
      'object_attributes',
    ]) as unknown as GitlabIssueWebhook

    await GitlabIntegrationService.createOrUpdateIssueByWebHook(object_attributes)

    logger.info('Succesfully updated tasks by webhook')

    response.status(200)
  }
}
