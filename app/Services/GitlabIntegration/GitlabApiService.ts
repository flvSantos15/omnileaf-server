import Env from '@ioc:Adonis/Core/Env'
import axios, { AxiosInstance } from 'axios'
import { GitlabApiRequest } from 'App/Interfaces/Gitlab/gitlab-api-service.interfaces'
import { GitlabTask } from 'App/Interfaces/Gitlab/gitlab-task.interface'
import { GitlabUser } from 'App/Interfaces/Gitlab/gitlab-user.interface'
import { RefreshToken } from 'App/Interfaces/Gitlab/refresh-token.interface'
import { GitlabProject } from 'App/Interfaces/Gitlab/gitlab-project.interface'
import { GitlabOrganization } from 'App/Interfaces/Gitlab/gitlab-organization.interface'

class GitlabApiServce {
  protected client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: 'https://gitlab.com/api/v4' })
  }

  public async getProjectUsers({ id, token }: GitlabApiRequest): Promise<GitlabUser[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects/${id}/members`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async getProjectTasks({ id, token }: GitlabApiRequest): Promise<GitlabTask[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects/${id}/issues`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async getUserOrganizations({ token }: GitlabApiRequest): Promise<GitlabOrganization[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/groups`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async getUserProjects({ token }: GitlabApiRequest): Promise<GitlabProject[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects`,
      headers: { Authorization: `Bearer ${token}` },
      params: {
        membership: true,
      },
    })
    return data
  }

  public async getUserTasks({ token }: GitlabApiRequest): Promise<GitlabTask[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects`,
      headers: { Authorization: `Bearer ${token}` },
      params: {
        membership: true,
      },
    })
    return data
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
}

export default new GitlabApiServce()
