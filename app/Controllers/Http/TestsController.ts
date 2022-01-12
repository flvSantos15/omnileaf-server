import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GitlabApiService from 'App/Services/GitlabIntegration/GitlabApiService'

export default class TestsController {
  public async test({ request, response }: HttpContextContract) {
    const { id, token } = request.only(['id', 'token'])

    await GitlabApiService.registerProjectWebhook({ id, token })

    // const data = await JiraApiService._getProjectRolesLinks({ id, cloudId, token })

    response.send('w?')
  }
}
