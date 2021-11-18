import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ConnectOrganizationToGitlabService from 'App/Services/GitlabIntegrationServices/ConnectOrganizationToGitlabService'
import GetOrganizationTokenService from 'App/Services/GitlabIntegrationServices/GetOrganizationTokenService'
import ImportGitlabProjectService from 'App/Services/GitlabIntegrationServices/ImportGitlabProjectService'
import ConnectOrganizationToGitlabValidator from 'App/Validators/GitlabIntegration/ConnectOrganizationToGitlabValidator'
import ImportGitlabProjectValidator from 'App/Validators/GitlabIntegration/ImportGitlabProjectValidator'

export default class GitlabIntegrationsController {
  public async connectOrganizationToGitlab({ request, response, bouncer }: HttpContextContract) {
    const connectOrganizationToGitlabService = new ConnectOrganizationToGitlabService()

    const payload = await request.validate(ConnectOrganizationToGitlabValidator)

    await connectOrganizationToGitlabService.execute({ payload, bouncer })

    response.status(200)
  }

  public async importProject({ request, response }: HttpContextContract) {
    const importGitlabProject = new ImportGitlabProjectService()
    const getOrganizationToken = new GetOrganizationTokenService()

    const payload = await request.validate(ImportGitlabProjectValidator)
    const { project, organizationId } = payload

    const token = await getOrganizationToken.execute(organizationId)

    await importGitlabProject.execute({ project, organizationId, token })

    response.status(201)
  }
}
