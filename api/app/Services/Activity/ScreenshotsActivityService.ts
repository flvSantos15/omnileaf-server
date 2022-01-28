import Database from '@ioc:Adonis/Lucid/Database'
import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import {
  AllScreenshotsRequest,
  EveryTenMinutesRequest,
  TimeAndActivityOnScreenshotsRequest,
} from 'App/Interfaces/Activity/screenshots-activity-service.interfaces'
import Screenshot from 'App/Models/Screenshot'
import TrackingSession from 'App/Models/TrackingSession'
import User from 'App/Models/User'
import { Exception } from '@adonisjs/core/build/standalone'

class ScreenshotsActivityService {
  public async timeAndActivity({ params }: TimeAndActivityOnScreenshotsRequest) {
    if (!params || !params.userId || !params.date) {
      throw new Exception('Invalid request. Params userId and date are required', 400)
    }

    const { userId, date } = params

    if (isNaN(Date.parse(date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const user = await User.find(userId)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const day = new Date(date)
    const dayAsDateTime = CustomHelpers.dateAsDateTime(day)
    const nextDayAsDateTime = dayAsDateTime.plus({ days: 1 })
    const lastDayAsDateTime = dayAsDateTime.minus({ days: 1 })

    const dayTrackingTime = await Database.from(TrackingSession.table)
      .where('user_id', user.id)
      .andWhereBetween('started_at', [dayAsDateTime.toSQLDate(), nextDayAsDateTime.toSQLDate()])
      .sum({ total: 'tracking_time' })
      .first()

    const lastDayTrackingTime = await Database.from(TrackingSession.table)
      .where('user_id', user.id)
      .andWhereBetween('started_at', [lastDayAsDateTime.toSQLDate(), dayAsDateTime.toSQLDate()])
      .sum({ total: 'tracking_time' })
      .first()

    const timeAndActivity = {
      time: {
        totalWorked: Number(dayTrackingTime.total),
        toPrevDay: Number(dayTrackingTime.total) - Number(lastDayTrackingTime.total),
      },
      activity: {
        average: 0,
        toPrevDay: 0,
        toOrgAverage: 0,
      },
    }

    return timeAndActivity
  }

  public async allScreenshots({ params }: AllScreenshotsRequest) {
    if (!params || !params.userId || !params.date) {
      throw new Exception('Invalid request. Params userId and date are required', 400)
    }

    const { userId, date } = params

    if (isNaN(Date.parse(date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const user = await User.find(userId)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const datetime = CustomHelpers.dateAsDateTime(params.date)
    const oneDayAfterDate = datetime.plus({ days: 1 })

    const queryScreenshots = Screenshot.query()
      .whereBetween('createdAt', [datetime.toSQLDate(), oneDayAfterDate.toSQLDate()])
      .andWhere('user_id', userId)
      .preload('project')
      .preload('task')

    const screenshots = await queryScreenshots

    return screenshots.map((screenshot) => screenshot.serialize())
  }

  public async everyTenMinutes({ params }: EveryTenMinutesRequest) {
    if (!params || !params.userId || !params.date) {
      throw new Exception('Invalid request. Params userId and date are required', 400)
    }

    const { userId, date } = params

    if (isNaN(Date.parse(date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const user = await User.find(userId)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const datetime = CustomHelpers.dateAsDateTime(date)
    const oneDayAfterDate = datetime.plus({ days: 1 })

    const queryTrackingSessions = TrackingSession.query()
      .whereBetween('createdAt', [datetime.toSQLDate(), oneDayAfterDate.toSQLDate()])
      .andWhere('user_id', userId)
      .preload('project')
      .preload('task')
      .preload('screenshots')

    const trackingSessions = await queryTrackingSessions

    return trackingSessions.map((session) => session.serialize())
  }
}

export default new ScreenshotsActivityService()
