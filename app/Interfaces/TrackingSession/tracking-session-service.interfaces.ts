import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface RegisterTrackingSessionRequest {
  payload: {
    taskId: string
  }
  user: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface CloseTrackingSessionRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}
