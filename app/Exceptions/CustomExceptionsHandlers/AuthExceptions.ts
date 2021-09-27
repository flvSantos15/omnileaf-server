import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default {
  validateCredentials: async (user: User, password: string) => {
    if (user && !(await Hash.verify(user.password, password))) {
      throw new Exception('Invalid credentials', 403)
    }
  },
}
