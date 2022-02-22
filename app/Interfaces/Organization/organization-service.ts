import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface CreateOrganizationRequest {
  user: User
  payload: {
    name: string
    avatar_url: string | undefined
    description: string | undefined
  }
}

export interface UpdateOrganizationRequest {
  id: string
  payload: {
    name: string | undefined
    avatar_url: string | undefined
    description: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteOrganizationRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface RemoveMemberRequest {
  id: string
  payload: {
    userId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}
