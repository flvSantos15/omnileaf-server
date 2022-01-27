import { Exception } from '@adonisjs/core/build/standalone'
import {
  CloseTrackingSessionRequest,
  CreateManySessionsRequest,
  RegisterTrackingSessionRequest,
  TrackRequest,
  UpdateTaskTrackingTimeRequest,
} from 'App/Interfaces/TrackingSession/tracking-session-service.interfaces'
import Task from 'App/Models/Task'
import TrackingSession from 'App/Models/TrackingSession'
import User from 'App/Models/User'
import { TrackingSessionStatus } from 'Contracts/enums'
import ScreenshotService from '../Screenshot/ScreenshotService'
import { types } from '@ioc:Adonis/Core/Helpers'

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

  public async updateTrackingTime({ id, payload, bouncer }: UpdateTaskTrackingTimeRequest) {
    const { trackingTime } = payload

    const session = await TrackingSession.find(id)

    if (!session) {
      throw new Exception('Tracking Session not found', 404)
    }

    if (session.status === TrackingSessionStatus.FINISHED) {
      throw new Exception('This session is already closed', 400)
    }

    await bouncer.authorize('SessionOwner', session)

    await session.merge({ trackingTime }).save()
  }

  public async closeSession({ id, payload, bouncer }: CloseTrackingSessionRequest) {
    const { trackingTime } = payload

    const session = await TrackingSession.find(id)

    if (!session) {
      throw new Exception('Tracking Session not found', 404)
    }

    if (session.status === TrackingSessionStatus.FINISHED) {
      throw new Exception('This session is already closed', 400)
    }

    await bouncer.authorize('OwnUser', session.userId)

    await session.merge({ trackingTime, status: TrackingSessionStatus.FINISHED }).save()
  }

  public async createMany({ payload, bouncer }: CreateManySessionsRequest) {
    const { sessions } = payload

    sessions.forEach(async (session) => {
      const { screenshots, ...newSessionPayload } = session

      const task = await Task.find(session.taskId)

      if (!task) {
        throw new Exception('Session Task not found', 404)
      }

      await task.load('project')

      bouncer.authorize('AssignedToProject', task.project)

      const newSession = await TrackingSession.create(newSessionPayload)

      if (types.isArray(screenshots)) {
        for await (const screenshot of screenshots) {
          const { base64, createdAt } = screenshot

          const payload = {
            trackingSessionId: newSession.id,
            createdAt,
          }

          const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

          await ScreenshotService.register({ payload, bouncer, buffer })
        }
      }
    })
  }

  public async track({ taskId, userId }: TrackRequest) {
    const task = await Task.findOrFail(taskId)

    const user = await User.findOrFail(userId)

    const trackingSession = await TrackingSession.create({ taskId: task.id, userId: user.id })

    return trackingSession
  }
}

export default new TrackingSessionService()
