import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { Exception } from '@poppinss/utils'
import { LogUpdated } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    name: string | undefined
    displayName: string | undefined
    email: string | undefined
    password: string | undefined
    avatar_url: string | undefined
    phone: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class UpdateUserService {
  private async treatExceptions({ user, email }: { user: User | null; email: string | undefined }) {
    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    if (email) {
      const emailExists = await User.query().where('email', email).andWhereNot('id', user.id)
      if (emailExists.length) {
        throw new Exception('Email is already registered for another user.', 409)
      }
    }
  }

  public async execute({ id, payload, bouncer }: Irequest): Promise<ModelObject> {
    const { email } = payload
    const user = await User.find(id)

    await this.treatExceptions({ user, email })

    await bouncer.authorize('OwnUser', id)

    await user!.merge(payload).save()

    LogUpdated(user)

    return user!.serialize()
  }
}
