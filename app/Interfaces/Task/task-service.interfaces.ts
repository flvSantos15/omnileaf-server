import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface RegisterTaskRequest {
  payload: {
    name: string
    body?: string
    projectId: string
    listId?: string
  }
  bouncer: ActionsAuthorizerContract<User>
  auth: AuthContract
}

export interface UpdateTaskRequest {
  id: string
  payload: {
    name?: string
    body?: string
    timeEstimated?: number
    listId?: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteTaskRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface AssignUserRequest {
  payload: { userId: string }
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface UnsignUserRequest {
  payload: { userId: string }
  id: string
  bouncer: ActionsAuthorizerContract<User>
}
