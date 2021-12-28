import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GitlabIntegrationService from 'App/Services/GitlabIntegration/GitlabIntegrationService'
import ConnectOrganizationToGitlabValidator from 'App/Validators/GitlabIntegration/ConnectOrganizationToGitlabValidator'
import ImportGitlabProjectValidator from 'App/Validators/GitlabIntegration/ImportGitlabProjectValidator'
import ImportGitlabUserValidator from 'App/Validators/GitlabIntegration/ImportGitlabUserValidator'

export default class GitlabIntegrationsController {
  public async importOrganization({ request, response, bouncer }: HttpContextContract) {
    const payload = await request.validate(ConnectOrganizationToGitlabValidator)

    await GitlabIntegrationService.importOrganization({ payload, bouncer })

    response.status(200)
  }

  public async importProject({ request, response }: HttpContextContract) {
    const payload = await request.validate(ImportGitlabProjectValidator)
    const { project, organizationId } = payload

    await GitlabIntegrationService.importProject({ project, organizationId })

    response.status(200)
  }

  public async importUser({ request, response, auth, bouncer }: HttpContextContract) {
    const payload = await request.validate(ImportGitlabUserValidator)

    const user = auth.use('web').user

    await GitlabIntegrationService.importUser({ payload, user, bouncer })

    response.status(200)
  }

  public async updateUser({ auth, response }: HttpContextContract) {
    const user = auth.use('web').user

    await GitlabIntegrationService.updateUser(user)

    response.status(200)
  }
}
