import { Exception } from '@adonisjs/core/build/standalone'
import {
  GetProjectRoleRequest,
  GetUsersFromGroupRequest,
  JiraApiRequest,
} from 'App/Interfaces/Jira/jira-api-service.interfaces'
import { JiraIssue, JiraPaginatedIssues } from 'App/Interfaces/Jira/jira-issue.interface'
import {
  JiraPaginatedProjects,
  JiraProject,
  JiraProjectRoles,
  ProjectRoleDetails,
} from 'App/Interfaces/Jira/jira-project.interface'
import {
  JiraUser,
  JiraUserFromGroup,
  PaginatedUsersFromGroup,
  ProjectMemberProps,
} from 'App/Interfaces/Jira/jira-user.interface'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { ProjectRoles } from 'Contracts/enums'
import Env from '@ioc:Adonis/Core/Env'
import { JiraTokenView } from 'App/Interfaces/Jira/jira-token.interface'
import { WebhookCreatedView } from 'App/Interfaces/Jira/webhook-created.interface'

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

  public async getPaginatedProjects({ cloudId, token }: JiraApiRequest) {
    const endpoint = `/ex/jira/${cloudId}/rest/api/3/project/search`
    let currentResponse: JiraPaginatedProjects
    let projectsArray: JiraProject[] = []
    try {
      let { data } = await this.client.get<JiraPaginatedProjects>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      projectsArray = projectsArray.concat(data.values)
      currentResponse = data
      while (currentResponse.nextPage) {
        let { data } = await this.client.get<JiraPaginatedProjects>(currentResponse.nextPage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        projectsArray = projectsArray.concat(data.values)
        currentResponse = data
      }
    } catch (err) {
      throw new Exception(`Failed to get paginated projects on Jira API: ${err.message}`, 400)
    }

    return projectsArray
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

  public async _getProjectRolesLinks({ id, cloudId, token }: JiraApiRequest) {
    const endpoint = `/ex/jira/${cloudId}/rest/api/3/project/${id}/role`

    try {
      const { data } = await this.client.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (err) {
      throw new Exception(`Failed to get Project Roles: ${err.message}`, 400)
    }
  }

  private async _getProjectRoleFromEndpoint({ endpoint, token }: GetProjectRoleRequest) {
    try {
      const { data } = await this.client.get<ProjectRoleDetails>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return data
    } catch (err) {
      throw new Exception(`Failed to get Project Role: ${err.message}`, 400)
    }
  }

  private async _getUserFromGroup({ name, cloudId, token }: GetUsersFromGroupRequest) {
    const endpoint = `/ex/jira/${cloudId}/rest/api/3/group/member`
    let currentResponse: PaginatedUsersFromGroup
    let usersArray: JiraUserFromGroup[] = []

    try {
      const { data } = await this.client.get<PaginatedUsersFromGroup>(endpoint, {
        params: {
          name,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      usersArray = usersArray.concat(data.values)
      currentResponse = data
      while (currentResponse.nextPage) {
        const { data } = await this.client.get<PaginatedUsersFromGroup>(endpoint, {
          params: {
            name,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        usersArray = usersArray.concat(data.values)
        currentResponse = data
      }
    } catch (err) {
      throw new Exception(
        `Failed to get paginated users from group ${name} on Jira API: ${err.message}`,
        400
      )
    }

    return usersArray
  }

  private _getProjectRoleValue(key: JiraProjectRoles): ProjectRoles {
    return JiraProjectRoles[key]
  }

  public async getProjectUsers({ id, cloudId, token }: JiraApiRequest) {
    const projectRolesLinks = await this._getProjectRolesLinks({ id, cloudId, token })
    let users: ProjectMemberProps[] = []

    for await (let k of Object.keys(projectRolesLinks)) {
      let role = this._getProjectRoleValue(k as JiraProjectRoles)
      let projectRoleDetails = await this._getProjectRoleFromEndpoint({
        endpoint: projectRolesLinks[k],
        token,
      })

      for await (let actor of projectRoleDetails.actors) {
        if (actor.actorUser) {
          users.push({ id: actor.actorUser.accountId, role })
        } else if (actor.actorGroup) {
          const usersFromGroup = await this._getUserFromGroup({
            name: actor.actorGroup.name,
            cloudId,
            token,
          })

          users = users.concat(
            usersFromGroup.map((user) => {
              return { id: user.accountId, role }
            })
          )
        }
      }
    }

    return users
  }

  public async registerProjectWebhook({ id, cloudId, token }: JiraApiRequest) {
    const endpoint = `ex/jira/${cloudId}/rest/api/3/webhook`
    const body = {
      webhooks: [
        {
          jqlFilter: `project = PT`,
          events: ['jira:issue_created', 'jira:issue_updated', 'jira:issue_deleted'],
        },
      ],
      url: 'https://dev-api.omnileaf.ml',
    }

    const response = await this.client.post<WebhookCreatedView>(endpoint, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(response.data.webhookRegistrationResult)

    if (response?.status !== 200) {
      throw new Exception('Failed to register project Webhook', 400)
    }

    return response.data
  }
}

export default new JiraApiService()
