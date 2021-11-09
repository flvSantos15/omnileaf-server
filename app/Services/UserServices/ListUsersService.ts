import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { LogList } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'

export default class ListUsersService {
  public async execute(): Promise<ModelObject[]> {
    const users = await User.all()

    LogList(users)

    const usersSerialized = users.map((user) => user.serialize())

    return usersSerialized
  }
}
