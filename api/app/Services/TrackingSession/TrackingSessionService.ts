import { Exception } from '@adonisjs/core/build/standalone'
import {
  CloseTrackingSessionRequest,
  RegisterTrackingSessionRequest,
} from 'App/Interfaces/TrackingSession/tracking-session-service.interfaces'
import Task from 'App/Models/Task'
import TrackingSession from 'App/Models/TrackingSession'
import { TrackingSessionStatus } from 'Contracts/enums'

class TrackingSessionService {
  public async getAll() {
    const trackingSessions = await TrackingSession.all()

    return trackingSessions
  }

  public async getOne(id: string) {
    const trackingSession = await TrackingSession.find(id)

    if (!trackingSession) {
      throw new Exception('Tracking Session not found', 404)
    }

    return trackingSession
  }

  public async register({ payload, user, bouncer }: RegisterTrackingSessionRequest) {
    const { taskId } = payload

    const task = await Task.find(taskId)

    if (!task) {
      throw new Exception('Task not found')
    }

    await task.load('project')

    await bouncer.authorize('AssignedToProject', task.project)

    const trackingSession = await TrackingSession.create({ taskId: task.id, userId: user.id })

    return trackingSession
  }

  public async closeSession({ id, bouncer }: CloseTrackingSessionRequest) {
    const trackingSession = await TrackingSession.find(id)

    if (!trackingSession) {
      throw new Exception('Tracking Session not found', 404)
    }

    await bouncer.authorize('OwnUser', trackingSession.userId)

    await trackingSession.merge({ status: TrackingSessionStatus.FINISHED }).save()
  }
}

export default new TrackingSessionService()
