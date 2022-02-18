import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import Label from 'App/Models/Label'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import { OrganizationLabels } from 'Contracts/enums'

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
  labels: Label[]
}

export type AttachMemberToProjectsProps = {
  user: User
  projects: Project[]
  labelTitles: OrganizationLabels[]
}

export interface ListUserInvitesRequest {
  auth: AuthContract
}
