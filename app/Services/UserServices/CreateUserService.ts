import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { Exception } from '@poppinss/utils'
import { LogCreated } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'

interface Irequest {
  payload: {
    name: string
    displayName: string
    email: string
    password: string
    avatar_url: string | undefined
    phone: string | undefined
  }
}

export default class CreateUserService {
  public async execute({ payload }: Irequest): Promise<ModelObject> {
    const { email } = payload

    if (await User.findBy('email', email)) {
      throw new Exception('Email is already registered.', 409)
    }

    const user = await User.create(payload)

    LogCreated(user)

    return user.serialize()
  }
}
