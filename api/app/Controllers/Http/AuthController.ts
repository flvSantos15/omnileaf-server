import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/Auth/AuthService'
import LoginValidator from 'App/Validators/Auth/LoginValidator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)

    await AuthService.login({ payload, auth })

    response.redirect('/')
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/login')
  }
}
