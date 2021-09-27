import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthExceptions from 'App/Exceptions/CustomExceptionsHandlers/AuthExceptions'
import UsersExceptions from 'App/Exceptions/CustomExceptionsHandlers/UsersExceptions'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)

    const user = await User.findByOrFail('email', payload.email)

    UsersExceptions.CheckIfUserExists(user)

    AuthExceptions.validateCredentials(user, payload.password)

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)

    response.redirect('/')
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/login')
  }
}
