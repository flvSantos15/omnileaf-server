import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface ImportJiraUserRequest {
  payload: {
    token: {
      token: string
      refresh_token: string
      expires_in: number
      scope: string
    }
  }
  user?: User
  bouncer: ActionsAuthorizerContract<User>
}
