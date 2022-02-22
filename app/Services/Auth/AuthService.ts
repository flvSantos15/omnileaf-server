import { Exception } from '@adonisjs/core/build/standalone'
import { LoginRequest } from 'App/Interfaces/Auth/auth-service.interfaces'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

class AuthService {
  public async login({ payload, auth }: LoginRequest) {
    const { email, password } = payload

    const user = await User.findBy('email', email)

    if (!user) {
      throw new Exception('Email not found', 404)
    }

    if (user && !(await Hash.verify(user.password, password))) {
      throw new Exception("Credentials doesn't match", 403)
    }

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)

    return user.serialize({
      fields: {
        pick: ['id', 'name', 'email', 'avatarUrl', 'latestTrackingSessionId', 'gitlabId', 'jiraId'],
      },
    })
  }
}

export default new AuthService()
