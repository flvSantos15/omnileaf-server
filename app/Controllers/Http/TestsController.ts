import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestsController {
  public async test({ response }: HttpContextContract) {
    // const payload = request.only(['projectId', 'jiraId'])

    // await JiraIntegrationService.importProject({ payload, bouncer })

    // const { id, cloudId, token } = request.only(['id', 'cloudId', 'token'])

    // const data = await JiraApiService._getProjectRolesLinks({ id, cloudId, token })

    response.send('w?')
  }
}
