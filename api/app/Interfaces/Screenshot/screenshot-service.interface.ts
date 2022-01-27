import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export interface RegisterScreenshotRequest {
  bouncer: ActionsAuthorizerContract<User>
  buffer: Buffer
  payload: {
    trackingSessionId: string
    createdAt?: DateTime
  }
}

export interface DeleteScreenshotRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}
