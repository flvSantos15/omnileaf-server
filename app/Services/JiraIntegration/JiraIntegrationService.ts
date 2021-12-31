import { Exception } from '@adonisjs/core/build/standalone'
import {
  ImportJiraOrganizationRequest,
  ImportJiraUserRequest,
} from 'App/Interfaces/Jira/jira-integration-service.interfaces'
import JiraToken from 'App/Models/JiraToken'
import Organization from 'App/Models/Organization'
import JiraApiService from './JiraApiService'

class JiraIntegrationService {
  public async importUser({ payload, user, bouncer }: ImportJiraUserRequest) {
    const { token } = payload

    if (!user) {
      throw new Exception('User not found', 404)
    }

    if (user.jiraId) {
      throw new Exception('User is already integrated with Jira', 400)
    }

    await bouncer.authorize('OwnUser', user.id)

    const jiraUser = await JiraApiService.getMe({ token: token.token })

    if (!jiraUser) {
      throw new Exception('Could not find user data on Jira API.', 400)
    }

    await JiraToken.create({ ...token, token: token.token, ownerId: user.id })

    await user.merge({ jiraId: jiraUser.account_id }).save()
  }

  public async importOrganization({ id, payload, user, bouncer }: ImportJiraOrganizationRequest) {
    const { jiraSiteId } = payload

    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    await user.load('jiraToken')

    if (!user.jiraId || !user.jiraToken) {
      throw new Exception('User is not integrated with Jira', 400)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.merge({ jiraId: jiraSiteId }).save()

    await user.jiraToken.merge({ organizationId: organization.id }).save()
  }
}

export default new JiraIntegrationService()
