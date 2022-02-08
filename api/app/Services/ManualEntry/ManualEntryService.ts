import { Exception } from '@adonisjs/core/build/standalone'
import ManualEntryExtensions from 'App/Extensions/ManualEntryExtensions'
import {
  ApprooveEntryRequest,
  DenyEntryRequest,
  RegisterManualEntryRequest,
} from 'App/Interfaces/ManualEntry/manual-entry-service.interfaces'
import ManualEntry from 'App/Models/ManualEntry'
import Task from 'App/Models/Task'
import TrackingSession from 'App/Models/TrackingSession'
import { ManualEntryStatus } from 'Contracts/enums/manual-entry-status'
import { DateTime } from 'luxon'

class ManualEntryService {
  public async register({ payload, bouncer, auth }: RegisterManualEntryRequest) {
    const user = auth.use('web').user!

    const { taskId } = payload

    const task = await Task.find(taskId)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    const [startedDateTime, finishedDateTime] = this._getPayloadValuesAsDateTime({ payload })

    const dateValuesAreInvalid =
      finishedDateTime.diff(startedDateTime, 'seconds').toObject().seconds! <= 0

    if (dateValuesAreInvalid) {
      throw new Exception('Finished time must be greater then started time', 400)
    }

    await task.load('project')

    await bouncer.authorize('AssignedToProject', task.project)

    const entry = await ManualEntry.create({ ...payload, userId: user.id })

    return entry
  }

  private _getPayloadValuesAsDateTime({ payload }: Pick<RegisterManualEntryRequest, 'payload'>) {
    const { startedDate, finishedDate, workedFrom, workedTo } = payload

    const startedDateTime = DateTime.fromISO(startedDate.toString())
    const finishedDateTime = DateTime.fromISO(finishedDate.toString())

    const [startedHours, startedMins] = workedFrom.split(':').map((value) => Number(value))
    const [finishedHours, finishedMins] = workedTo.split(':').map((value) => Number(value))

    return [
      startedDateTime.plus({ hours: startedHours, minutes: startedMins }),
      finishedDateTime.plus({ hours: finishedHours, minutes: finishedMins }),
    ]
  }

  public async approove({ entryId, bouncer }: ApprooveEntryRequest) {
    const entry = await ManualEntry.find(entryId)

    if (!entry) {
      throw new Exception('Manual Entry not found', 404)
    }

    if (entry.status !== ManualEntryStatus.IN_PROGRESS) {
      throw new Exception('This entry request has already been solved', 400)
    }

    await entry.load('task', (taskQuery) => {
      taskQuery.preload('project')
    })

    await bouncer.authorize('ProjectManager', entry.task.project)

    const sessionsPayload = ManualEntryExtensions.createSessionsPayload(entry)

    await TrackingSession.createMany(sessionsPayload)

    await entry.merge({ status: ManualEntryStatus.APPROVED }).save()
  }

  public async deny({ entryId, bouncer }: DenyEntryRequest) {
    const entry = await ManualEntry.find(entryId)

    if (!entry) {
      throw new Exception('Manual Entry not found', 404)
    }

    if (entry.status !== ManualEntryStatus.IN_PROGRESS) {
      throw new Exception('This entry request has already been solved', 400)
    }

    await entry.load('task', (taskQuery) => {
      taskQuery.preload('project')
    })

    await bouncer.authorize('ProjectManager', entry.task.project)

    await entry.merge({ status: ManualEntryStatus.DENIED }).save()
  }
}

export default new ManualEntryService()
