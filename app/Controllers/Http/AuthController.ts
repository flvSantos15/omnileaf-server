import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ValidateLogin } from 'App/Validators/Auth/LoginValidator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const user = await ValidateLogin(request)

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)

    response.redirect('/')
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/login')
  }
}
