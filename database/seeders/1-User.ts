import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { dummyUser } from 'Database/seeders-constants'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const user = await User.find(dummyUser.id)
    if (user) return

    await User.create(dummyUser)
  }
}
