import GitlabToken from 'App/Models/GitlabToken'
import Project from 'App/Models/Project'
import { GitlabTask } from './gitlab-task.interface'
import { GitlabUser } from './gitlab-user.interface'

export interface ApiRequest {
  id?: number
  token?: string
}

export interface UpdateTokenRequest {
  existingToken: GitlabToken
}

export interface ValidateTokenRequest {
  expiresIn: number
  createdAt: number
}

export interface RefreshProjectUsersRequest {
  project: Project
  users: GitlabUser[]
}

export interface RefreshProjectTasksRequest {
  project: Project
  tasks: GitlabTask[]
}
