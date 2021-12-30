import { Exception } from '@adonisjs/core/build/standalone'
import { JiraApiRequest } from 'App/Interfaces/Jira/jira-api-service.interfaces'
import { JiraUser } from 'App/Interfaces/Jira/jira-user.interface'
import axios, { AxiosInstance } from 'axios'

class JiraApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: 'https://api.atlassian.com' })
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

  public async getUserSites({ token }: JiraApiRequest) {
    const endpoint = '/oauth/token/accessible-resources'

    return this.client.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export default new JiraApiService()
