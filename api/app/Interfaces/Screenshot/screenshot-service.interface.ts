import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface RegisterScreenshotRequest {
  trackingSessionId: string
  user: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteScreenshotRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}
