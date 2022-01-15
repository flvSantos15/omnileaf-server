import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Screenshot from 'App/Models/Screenshot'
import { dummySession } from 'Database/seeders-constants'

export default class ScreenshotSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const session = await Screenshot.find(dummySession.id)

    if (session) return

    await Screenshot.createMany([
      dummySession,
      {
        ...dummySession,
        id: undefined,
      },
      { ...dummySession, id: undefined },
    ])
  }
}
