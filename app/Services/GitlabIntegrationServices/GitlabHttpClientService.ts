import { IGitlabTask } from 'App/Interfaces/IGitlabTask'
import { IGitlabUser } from 'App/Interfaces/IGitlabUser'
import Env from '@ioc:Adonis/Core/Env'
import axios, { AxiosInstance } from 'axios'

interface IRefreshToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  created_at: number
}

export interface IApiRequest {
  id: number
  token: string
}

export default class GitlabHttpClientService {
  private baseUrl: string
  private _gitlabClient: AxiosInstance

  constructor() {
    this.baseUrl = 'https://gitlab.com/api/v4'
    this._gitlabClient = axios.create({ baseURL: this.baseUrl })
  }

  public async refreshAccessToken(refreshToken: string): Promise<IRefreshToken> {
    const { data }: { data: IRefreshToken } = await axios({
      method: 'POST',
      url: 'https://gitlab.com/oauth/authorize',
      params: {
        client_id: `client_id=${Env.get('GITLAB_APP_ID')}`,
        client_secret: `client_secret=${Env.get('GITLAB_APP_SECRET')}`,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        redirect_uri: 'http://localhost:3333',
        code_verifier: `${Env.get('GITLAB_CODE_VERIFIER')}`,
      },
    })

    return data
  }

  public async getProjectUsers({ id, token }: IApiRequest): Promise<IGitlabUser[]> {
    const { data } = await this._gitlabClient({
      method: 'GET',
      url: `/projects/${id}/members`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async getProjectTasks({ id, token }: IApiRequest): Promise<IGitlabTask[]> {
    const { data } = await this._gitlabClient({
      method: 'GET',
      url: `/projects/${id}/issues`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }
}
