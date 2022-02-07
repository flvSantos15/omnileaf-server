import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface RegisterManualEntryRequest {
  auth: AuthContract
  payload: {
    taskId: string
    startedDate: string
    finishedDate: string
    workedFrom: string
    workedTo: string
    reason: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}
