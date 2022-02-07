import { Exception } from '@adonisjs/core/build/standalone'
import { RegisterManualEntryRequest } from 'App/Interfaces/ManualEntry/manual-entry-service.interfaces'
import ManualEntry from 'App/Models/ManualEntry'
import Task from 'App/Models/Task'

class ManualEntryService {
  public async register({ payload, bouncer, auth }: RegisterManualEntryRequest) {
    const user = auth.use('web').user!

    const { taskId } = payload

    const task = await Task.find(taskId)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('project')

    await bouncer.authorize('AssignedToProject', task.project)

    const manualEntry = await ManualEntry.create({ ...payload, userId: user.id })

    return manualEntry
  }
}

export default new ManualEntryService()
