import { Exception } from '@poppinss/utils'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import User from 'App/Models/User'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'
import isAfter from 'date-fns/isAfter'

export default {
  CheckIfEmailExists: async (email: string) => {
    if (!(await User.findBy('email', email))) {
      throw new Exception("Email doesn't exists.", 404)
    }
  },
  CheckIfTokenIsExpired: (token: ResetPasswordToken) => {
    const tokenExpirationInDateTime = Date.parse(token.expiresIn)
    const currentDateTime = createDateAsUTC(new Date())
    if (isAfter(currentDateTime, tokenExpirationInDateTime)) {
      throw new Exception('Reset Password token is expired, please generate a new one.', 403)
    }
  },
  CheckIfPasswordIsCorrect: (password: string, passwordConfirmation: string) => {
    if (password !== passwordConfirmation) {
      throw new Exception("Confirmation password doesn't match.", 400)
    }
  },
}
