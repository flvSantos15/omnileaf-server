import TrackingSession from 'App/Models/TrackingSession'

export const LoadTrackingSessionRelations = async (id: string): Promise<TrackingSession> => {
  const trackingSession = await TrackingSession.findOrFail(id)

  await trackingSession.load('user')

  await trackingSession.load('task')

  return trackingSession
}
