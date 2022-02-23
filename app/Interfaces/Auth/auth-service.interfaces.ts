import { AuthContract } from '@ioc:Adonis/Addons/Auth'

export interface LoginRequest {
  payload: {
    email: string
    password: string
  }
  auth: AuthContract
}
