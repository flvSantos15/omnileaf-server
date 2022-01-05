import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JiraApiService from 'App/Services/JiraIntegration/JiraApiService'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'

export default class TestsController {
  public async test({ request, response, auth, bouncer }: HttpContextContract) {
    const payload = request.only(['project', 'organizationId'])

    const user = auth.use('web').user!

    await JiraIntegrationService.importProject({ user, payload, bouncer })

    // const { id, cloudId, token } = request.only(['id', 'cloudId', 'token'])

    // const data = await JiraApiService._getProjectRolesLinks({ id, cloudId, token })

    response.send('w?')
  }
}
