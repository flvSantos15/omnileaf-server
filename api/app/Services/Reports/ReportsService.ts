import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import Screenshot from 'App/Models/Screenshot'
import { ReportRequest } from 'App/Interfaces/Reports/reports-service.interface'
import { Exception } from '@adonisjs/core/build/standalone'
import TrackingSession from 'App/Models/TrackingSession'

class ReportsService {
  public async screenshots({ params }: ReportRequest) {
    const { filters } = params

    if (isNaN(Date.parse(filters.date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const datetime = CustomHelpers.dateAsDateTime(filters.date)
    const oneDayAfterDate = datetime.plus({ days: 1 })

    const queryScreenshots = Screenshot.query()
      .whereBetween('createdAt', [datetime.toSQLDate(), oneDayAfterDate.toSQLDate()])
      .preload('project')
      .preload('task')

    if (filters.user) {
      queryScreenshots.andWhere('user_id', filters.user)
    }

    const screenshots = await queryScreenshots

    return screenshots.map((screenshot) => screenshot.serialize())
  }

  public async trackingSessions({ params }: ReportRequest) {
    const { filters } = params

    if (isNaN(Date.parse(filters.date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const datetime = CustomHelpers.dateAsDateTime(filters.date)
    const oneDayAfterDate = datetime.plus({ days: 1 })

    const queryTrackingSessions = TrackingSession.query()
      .whereBetween('createdAt', [datetime.toSQLDate(), oneDayAfterDate.toSQLDate()])
      .preload('project')
      .preload('task')
      .preload('screenshots')

    if (filters.user) {
      queryTrackingSessions.andWhere('user_id', filters.user)
    }

    const trackingSessions = await queryTrackingSessions

    return trackingSessions.map((session) => session.serialize())
  }
}

export default new ReportsService()
