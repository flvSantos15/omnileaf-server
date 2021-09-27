import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'

export default {
  CheckIfEmailExists: async (email: string) => {
    if (await User.findBy('email', email)) {
      throw new Exception('Email is already registered.', 409)
    }
  },

  CheckIfUserExists: async (user: User | null): Promise<void> => {
    if (!user) throw new Exception('User not found.', 404)
  },

  CheckIfEmailIsDifferentOnUpdate: async (email: string, id: string): Promise<void> => {
    const user = await User.find(id)
    if (user?.email === email)
      throw new Exception('Email is the same registered for the User.', 409)
  },

  CheckIfEmailExistsOnUpdate: async (email: string, id: string): Promise<void> => {
    const user = await User.query().where('email', email).andWhereNot('id', id)
    if (user.length) throw new Exception('Email is already registered for another user.', 409)
  },
}
