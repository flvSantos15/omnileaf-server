import Task from 'App/Models/Task'
import UuidValidator from 'App/Validators/Global/UuidValidator'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

type PayloadProps = {
  taskId: string
  listId: string
}

export const registerTaskHandlers = (
  _,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  const updateTaskList = async (payload: PayloadProps) => {
    const { taskId, listId } = payload

    try {
      UuidValidator.v4(taskId)
      UuidValidator.v4(listId)
      //Verify if list exists

      const task = await Task.find(taskId)
      if (!task) {
        socket.emit('task:updateListError', { message: 'Task not found.' })
        return
      }
    } catch {
      socket.emit('task:updateListError', { message: 'Failed to Update Task List' })
    }
  }

  socket.on('task:updateList', updateTaskList)
}
