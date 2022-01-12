import Env from '@ioc:Adonis/Core/Env'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  DeleteWebhookRequest,
  JiraApiRequest,
} from 'App/Interfaces/Jira/jira-api-service.interfaces'
import { JiraIssue, JiraPaginatedIssues } from 'App/Interfaces/Jira/jira-issue.interface'
import { JiraUser } from 'App/Interfaces/Jira/jira-user.interface'
import { JiraTokenView } from 'App/Interfaces/Jira/jira-token.interface'
import { WebhookCreatedView } from 'App/Interfaces/Jira/jira-webhook-created.interface'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

class JiraApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: 'https://api.atlassian.com' })
    this.addInterceptors(this.client)
  }

  private addInterceptors(client: AxiosInstance) {
    function onReponse(response: AxiosResponse) {
      return response
    }

    function onReponseError(error: AxiosError) {
      console.log(error.response)
      if (error.response?.status === 401) {
        throw new Exception(
          'Jira integration token is not valid anymore. Try to integrate again',
          400
        )
      }
    }

    client.interceptors.response.use(onReponse, onReponseError)
  }

  public async refreshToken(refreshToken: string) {
    const endpoint = 'https://auth.atlassian.com/oauth/token'

    const refreshObj = {
      grant_type: 'refresh_token',
      client_id: Env.get('JIRA_APP_ID'),
      client_secret: Env.get('JIRA_APP_SECRET'),
      refresh_token: refreshToken,
    }

    try {
      const { data } = await axios.post<JiraTokenView>(endpoint, refreshObj)
      return data
    } catch (err) {
      throw new Exception(`Failed to refresh Jira access token: ${err.message}`)
    }
  }

  public async getMe({ token }: JiraApiRequest) {
    const endpoint = '/me'

    try {
      const { data } = await this.client.get<JiraUser>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return data
    } catch (err) {
      throw new Exception(`Could not request user data on Jira API: ${err.message}`, 400)
    }
  }

  public async getProjectIssues({ id, cloudId, token }: JiraApiRequest) {
    const endpoint = `/ex/jira/${cloudId}/rest/api/3/search?jql=project%3D${id}`
    let currentResponse: JiraPaginatedIssues
    let issuesArray: JiraIssue[] = []

    try {
      let { data } = await this.client.get<JiraPaginatedIssues>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      issuesArray = issuesArray.concat(data.issues)
      currentResponse = data
      while (currentResponse.nextPage) {
        let { data } = await this.client.get<JiraPaginatedIssues>(currentResponse.nextPage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        issuesArray = issuesArray.concat(data.issues)
        currentResponse = data
      }
    } catch (err) {
      throw new Exception(`Failed to get paginated issues on Jira API: ${err.message}`, 400)
    }

    return issuesArray
  }

  public async registerProjectWebhook({ id, cloudId, token }: JiraApiRequest) {
    const endpoint = `ex/jira/${cloudId}/rest/api/3/webhook`

    const urlRoute = '/jira/webhook/issue'

    const url =
      Env.get('NODE_ENV') === 'production'
        ? Env.get('PROD_API_URL') + urlRoute
        : Env.get('DEV_API_URL') + urlRoute
    const body = {
      webhooks: [
        {
          jqlFilter: `project = ${id}`,
          events: ['jira:issue_created', 'jira:issue_updated', 'jira:issue_deleted'],
        },
      ],
      url,
    }

    try {
      const response = await this.client.post<WebhookCreatedView>(endpoint, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response?.status !== 200) {
        throw new Exception('Failed to register project Webhook', 400)
      }

      return response.data
    } catch (err) {
      throw new Exception(`Failed to register webhook: ${err.message}`, 400)
    }
  }

  public async deleteWebhook({ webhookIds, cloudId, token }: DeleteWebhookRequest) {
    const endpoint = `ex/jira/${cloudId}/rest/api/3/webhook`

    const data = { webhookIds }

    try {
      await this.client.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data,
      })
    } catch (err) {
      throw new Exception(`Failed to delete webhook: ${err.message}`, 400)
    }
  }
}

export default new JiraApiService()
