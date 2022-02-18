import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'

export interface InviteUserRequest {
  id: string
  payload: {
    email: string
    labelIds: string[]
    projectIds?: string[]
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface AnswerInviteRequest {
  id: string
  auth: AuthContract
}

export type AddMemberLabelsProps = {
  user: User
  labelIds: string[]
}

export type AttachMemberToProjectsProps = {
  user: User
  projectIds: string[]
  labelIds: string[]
}

export interface ListUserInvitesRequest {
  auth: AuthContract
}
