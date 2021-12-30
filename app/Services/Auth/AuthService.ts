import { Exception } from '@adonisjs/core/build/standalone'
import { LoginRequest } from 'App/Interfaces/Auth/auth-service.interfaces'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

class AuthService {
  public async login({ payload, auth }: LoginRequest): Promise<void> {
    const { email, password } = payload

    const user = await User.findByOrFail('email', email)

    if (user && !(await Hash.verify(user.password, password))) {
      throw new Exception("Credentials doesn't match", 403)
    }

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)
  }
}

export default new AuthService()