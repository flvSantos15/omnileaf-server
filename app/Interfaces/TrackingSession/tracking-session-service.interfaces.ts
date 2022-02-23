import User from 'App/Models/User'
import { TrackingSessionStatus } from 'Contracts/enums'
import { DateTime } from 'luxon'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'

export interface RegisterTrackingSessionRequest {
  payload: {
    taskId: string
  }
  user: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface UpdateTaskTrackingTimeRequest {
  id: string
  payload: {
    trackingTime: number
    inactivityTime?: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface CloseTrackingSessionRequest {
  id: string
  payload: {
    trackingTime: number
    inactivityTime: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface TrackRequest {
  taskId: string
  userId: string
}

export interface CreateManySessionsRequest {
  payload: {
    sessions: SessionOnCreateManyView[]
  }
  bouncer: ActionsAuthorizerContract<User>
}

interface SessionOnCreateManyView {
  status?: TrackingSessionStatus
  trackingTime: number
  inactivityTime?: number
  userId: string
  taskId: string
  startedAt: DateTime
  stoppedAt?: DateTime
  screenshots?: ScreenshotOnCreateManyView[]
}

interface ScreenshotOnCreateManyView {
  createdAt: DateTime
  base64: string
  isDeleted?: boolean
}
