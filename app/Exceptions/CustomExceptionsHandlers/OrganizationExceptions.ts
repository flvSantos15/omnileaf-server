import { Exception } from '@poppinss/utils'

export default {
  checkIfUserIsNotCreator: (creatorId: string, userId: string) => {
    if (creatorId === userId) {
      throw new Exception("Organization creator can't be deleted", 401)
    }
  },
}
