import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface InviteUserRequest {
  id: string
  payload: {
    userId: string
    labelIds: string[]
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
