import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TrackingSession from 'App/Models/TrackingSession'
import { dummySession } from 'Database/seeders-constants'

export default class TrackingSessionSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const session = await TrackingSession.find(dummySession.id)

    if (session) return

    await TrackingSession.createMany([
      dummySession,
      {
        ...dummySession,
        id: undefined,
      },
      { ...dummySession, id: undefined },
    ])
  }
}
