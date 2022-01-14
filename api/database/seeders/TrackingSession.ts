import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Screenshot from 'App/Models/Screenshot'
import TrackingSession from 'App/Models/TrackingSession'
import { defaultId, dummySession } from 'Database/seeders-constants'

export default class TrackingSessionSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const session = await TrackingSession.find(dummySession.id)

    if (session) return

    const sessions = await TrackingSession.createMany([
      dummySession,
      {
        ...dummySession,
        id: undefined,
      },
      { ...dummySession, id: undefined },
    ])

    sessions.forEach(async (session) => {
      await Screenshot.create({
        trackingSessionId: session.id,
        taskId: defaultId,
        userId: defaultId,
      })
    })
  }
}
