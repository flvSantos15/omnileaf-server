import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import IntegrateGitlabProjectService from 'App/Services/GitlabIntegrationServices/IntegrateGitlabProjectService'
import ImportGitlabProjectValidator from 'App/Validators/GitlabIntegration/ImportGitlabProjectValidator'

export default class GitlabIntegrationsController {
  private integrateGiltabProjectService: IntegrateGitlabProjectService

  constructor() {
    this.integrateGiltabProjectService = new IntegrateGitlabProjectService()
  }

  public async importProject({ request, response }: HttpContextContract) {
    const payload = await request.validate(ImportGitlabProjectValidator)

    await this.integrateGiltabProjectService.import(payload)

    response.status(201)
  }
}
