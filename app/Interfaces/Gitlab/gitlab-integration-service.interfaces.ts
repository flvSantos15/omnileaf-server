import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import { GitlabProject } from './gitlab-project.interface'

export interface ImportProjectRequest {
  project: GitlabProject
  organizationId: string
}

export interface ImportOrganizationRequest {
  payload: {
    organizationId: string
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportUserRequest {
  payload: {
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  user?: User
  bouncer: ActionsAuthorizerContract<User>
}
