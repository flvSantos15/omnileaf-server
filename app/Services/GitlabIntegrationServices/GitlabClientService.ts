import { IgitlabTask } from 'App/Interfaces/IGitlabTask'
import { IgitlabUser } from 'App/Interfaces/IGitlabUser'
import axios from 'axios'

export default class GitlabClientService {
  private baseUrl: string = 'https://gitlab.com/api/v4'

  private _gitlabClient = axios.create({ baseURL: this.baseUrl })

  public async getProjectUsers(id: number, token: string): Promise<IgitlabUser[]> {
    const { data } = await this._gitlabClient({
      method: 'GET',
      url: `/projects/${id}/members`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  public async getProjectTasks(id: number, token: string): Promise<IgitlabTask[]> {
    const { data } = await this._gitlabClient({
      method: 'GET',
      url: `/projects/${id}/issues`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }
}
