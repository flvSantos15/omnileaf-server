import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogDeleted } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'

interface Irequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export default class DeleteUserService {
  public async execute({ id, bouncer }: Irequest): Promise<void> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    await bouncer.authorize('OwnUser', id)

    LogDeleted(user)

    await user.delete()
  }
}
