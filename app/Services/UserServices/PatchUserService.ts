import { Exception } from '@adonisjs/core/build/standalone'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

interface IGitlabIdRequest {
  id: string
  payload: {
    gitlabId: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class PatchUserService {
  public async gitalbId({ id, payload, bouncer }: IGitlabIdRequest) {
    const { gitlabId } = payload
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found.', 404)
    }

    bouncer.authorize('OwnUser', user.id)

    user.gitlabId = gitlabId
    await user.save()

    return user
  }
}
