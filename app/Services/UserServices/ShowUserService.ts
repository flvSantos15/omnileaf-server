import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { Exception } from '@poppinss/utils'
import { LogShow } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'

interface Irequest {
  id: string
}

export default class ShowUserService {
  public async execute({ id }: Irequest): Promise<ModelObject> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    LogShow(user)

    return user.serialize()
  }
}
