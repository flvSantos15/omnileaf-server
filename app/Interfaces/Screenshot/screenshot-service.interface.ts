import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import Screenshot from 'App/Models/Screenshot'
import User from 'App/Models/User'

export interface RegisterScreenshotRequest {
  payload: {
    trackingSessionId: string
    url: string
    blurredUrl: string
  }
  user: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteScreenshotRequest {
  screenshot: Screenshot | null
  bouncer: ActionsAuthorizerContract<User>
}
