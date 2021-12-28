import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export interface RegisterUserResquest {
  payload: {
    name: string
    displayName: string
    email: string
    password: string
    avatar_url: string | undefined
    phone: string | undefined
  }
}

export interface ShowUserRequest {
  id: string
}

export interface UpdateUserRequest {
  id: string
  payload: {
    name: string | undefined
    displayName: string | undefined
    email: string | undefined
    password: string | undefined
    avatar_url: string | undefined
    phone: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteUserRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface EditGitlabIdRequest {
  id: string
  payload: {
    gitlabId: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ForgotPasswordRequest {
  payload: {
    email: string
  }
}

export interface ResetPasswordRequest {
  id: string
  payload: {
    password: string
    passwordConfirmation: string
  }
  auth: AuthContract
}
