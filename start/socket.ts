import { registerTaskHandlers } from 'App/Gateways/ws/Task'
import Ws from 'App/Services/Ws'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
Ws.boot()

const onConnection = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
  socket.emit('connected', { hello: 'From Omni Socket.' })

  registerTaskHandlers(Ws.io, socket)
}

Ws.io.on('connection', onConnection)
