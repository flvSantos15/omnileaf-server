import Ws from 'App/Services/Ws'
import { registerTrackingSessionsHandlers } from 'App/Gateways/ws/TrackingSessionGateways'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

Ws.boot()

const onConnection = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
  socket.emit('connected', { hello: 'From Omni Socket.' })
}

const onSessionsConnection = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  socket.emit('connected', { hello: 'From Omni Socket.' })

  registerTrackingSessionsHandlers(Ws.io, socket)
}

Ws.io.on('connection', onConnection)
Ws.io.of('/sessions').on('connection', onSessionsConnection)
