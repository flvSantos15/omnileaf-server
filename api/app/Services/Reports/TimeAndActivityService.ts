import { Exception } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'
import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import { TimeAndActivityReportRequest } from 'App/Interfaces/Reports/time-and-activity-service.interface'

class TimeAndActivityService {
  public async getGroupedReport({ params }: TimeAndActivityReportRequest) {
    if (isNaN(Date.parse(params.start)) || isNaN(Date.parse(params.end))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    if (!params.groupBy) {
      throw new Exception('Missing groupBy param', 400)
    }

    const startAsDateTime = CustomHelpers.dateAsDateTime(params.start)
    const endAsDateTimePlusOne = CustomHelpers.dateAsDateTime(params.end).plus({ days: 1 })

    const timeAndActivityQuery = await Database.from('tracking_sessions')
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .where('user_id', params.userId)
      .join('tasks', 'tracking_sessions.task_id', '=', 'tasks.id')
      .join('projects', 'tasks.project_id', '=', 'projects.id')
      .select(
        Database.raw(
          "to_char( started_at, 'MM-DD-YYYY') as started_date, sum(tracking_sessions.tracking_time) as tracking_time, tasks.name as task, projects.name as project"
        )
      )
      .groupByRaw('projects.name, tasks.name, started_date')
      .orderBy('started_date')

    return CustomHelpers.groupBy(timeAndActivityQuery, params.groupBy)
  }
}

export default new TimeAndActivityService()
