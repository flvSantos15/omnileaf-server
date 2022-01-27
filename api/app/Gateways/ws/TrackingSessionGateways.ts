import TrackingSession from 'App/Models/TrackingSession'
import TrackingSessionService from 'App/Services/TrackingSession/TrackingSessionService'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export const registerTrackingSessionsHandlers = (
  _,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  const startTracking = async ({ taskId, userId }) => {
    try {
      const session = (await TrackingSessionService.track({ taskId, userId })) as TrackingSession

      socket.emit('session:started', session.id)
    } catch (err) {
      socket.emit('session:error', { error: err })
    }
  }

  socket.on('session:start', startTracking)
}
