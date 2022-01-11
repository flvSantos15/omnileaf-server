import Env from '@ioc:Adonis/Core/Env'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import {
  DeleteWebhookRequest,
  GitlabApiRequest,
} from 'App/Interfaces/Gitlab/gitlab-api-service.interfaces'
import { GitlabIssue } from 'App/Interfaces/Gitlab/gitlab-issue.interface'
import { RefreshToken } from 'App/Interfaces/Gitlab/refresh-token.interface'
import { Exception } from '@adonisjs/core/build/standalone'
import { GitlabWebhook } from 'App/Interfaces/Gitlab/gitlab-webhook.interface'

class GitlabApiServce {
  protected client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: 'https://gitlab.com/api/v4' })
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
          'Gitlab integration token is not valid anymore. Try to integrate again',
          400
        )
      }
    }

    client.interceptors.response.use(onReponse, onReponseError)
  }

  public async refreshToken(refreshToken: string): Promise<RefreshToken> {
    const { data }: { data: RefreshToken } = await axios({
      method: 'POST',
      url: 'https://gitlab.com/oauth/token',
      params: {
        client_id: `${Env.get('GITLAB_APP_ID')}`,
        client_secret: `${Env.get('GITLAB_APP_SECRET')}`,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        redirect_uri: 'http://localhost:3333',
        code_verifier: `${Env.get('GITLAB_CODE_VERIFIER')}`,
      },
    })
    return data
  }

  public async getProjectIssues({ id, token }: GitlabApiRequest): Promise<GitlabIssue[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects/${id}/issues`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async registerProjectWebhook({ id, token }: GitlabApiRequest) {
    const endpoint = `projects/${id}/hooks`
    //TO-DO: Change webhook to dev-backend url
    const url =
      Env.get('NODE_ENV') === 'production'
        ? 'https://backend.omnileaf.ml/gitlab/webhook/issue'
        : 'https://webhook.omnileaf.ml/gitlab/webhook/issue'
    const body = {
      push_events: false,
      issues_events: true,
      url,
    }

    try {
      const response = await this.client.post<GitlabWebhook>(endpoint, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response?.status !== 201) {
        throw new Exception('Failed to register project Webhook', 400)
      }

      return response.data
    } catch (err) {
      throw new Exception(`Failed to register webhook: ${err.message}`, 400)
    }
  }

  public async deleteWebhook({ projectId, hookId, token }: DeleteWebhookRequest) {
    const endpoint = `/projects/${projectId}/hooks/${hookId}`

    try {
      await this.client.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      throw new Exception(`Failed to delete webhook: ${err.message}`, 400)
    }
  }
}

export default new GitlabApiServce()
