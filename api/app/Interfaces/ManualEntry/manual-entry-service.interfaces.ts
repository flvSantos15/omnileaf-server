import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export interface RegisterManualEntryRequest {
  auth: AuthContract
  payload: {
    taskId: string
    startedDate: DateTime | string
    finishedDate: DateTime | string
    workedFrom: string
    workedTo: string
    reason: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ApprooveEntryRequest {
  entryId: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface DenyEntryRequest {
  entryId: string
  bouncer: ActionsAuthorizerContract<User>
}
