import GitlabToken from 'App/Models/GitlabToken'
import Project from 'App/Models/Project'
import { GitlabIssue } from './gitlab-issue.interface'
import { GitlabUser } from './gitlab-user.interface'

export interface GitlabApiRequest {
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
  issues: GitlabIssue[]
}

export interface DeleteWebhookRequest {
  projectId: number
  hookId: number
  token: string
}
