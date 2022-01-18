import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import Screenshot from 'App/Models/Screenshot'
import {
  ReportRequest,
  TimeAndActivityReportRequest,
} from 'App/Interfaces/Reports/reports-service.interface'
import { Exception } from '@adonisjs/core/build/standalone'
import TrackingSession from 'App/Models/TrackingSession'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

class ReportsService {
  public async getDailyTrack(user: User) {
    const today = new Date()
    const todayAsDateTime = CustomHelpers.dateAsDateTime(today)
    const todayAsDateTimePluOne = todayAsDateTime.plus({ days: 1 })

    const trackingSessions = await TrackingSession.query()
      .where('user_id', user.id)
      .andWhereBetween('started_at', [
        todayAsDateTime.toSQLDate(),
        todayAsDateTimePluOne.toSQLDate(),
      ])
      .preload('project')
      .preload('task')

    return this._getDailyTrackPerProjectAndTask(trackingSessions)
  }

  private _getDailyTrackPerProjectAndTask(sessions: TrackingSession[]) {
    return sessions.reduce(
      (acc: any, curr) => {
        acc.totalTracked += curr.trackingTime

        const projectIndex = acc.projects
          .map((dailyTrack: any) => dailyTrack.projectId)
          .indexOf(curr.project.id)

        const projectIsNotInArray = projectIndex < 0

        if (projectIsNotInArray) {
          const newArrayItem = {
            projectId: curr.projectId,
            trackingTime: curr.trackingTime,
            tasks: [{ taskId: curr.taskId, trackingTime: curr.trackingTime }],
          }
          acc.projects.push(newArrayItem)

          return acc
        }

        acc.projects[projectIndex].trackingTime += curr.trackingTime

        const taskIndex = acc.projects[projectIndex].tasks
          .map((task: any) => task.taskId)
          .indexOf(curr.taskId)

        const taskIsNotInProjectArray = taskIndex < 0

        if (taskIsNotInProjectArray) {
          const newTasksArrayItem = {
            taskId: curr.taskId,
            trackingTime: curr.trackingTime,
          }

          acc.projects[projectIndex].tasks.push(newTasksArrayItem)

          return acc
        }

        acc.projects[projectIndex].tasks[taskIndex].trackingTime += curr.trackingTime

        return acc
      },
      { totalTracked: 0, projects: [] }
    )
  }

  public async getScreenshotsReport({ params }: ReportRequest) {
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

  public async getTrackingSessionsReport({ params }: ReportRequest) {
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

  public async getTimeAndActivityReport({ params }: TimeAndActivityReportRequest) {
    const { filters } = params

    if (isNaN(Date.parse(filters.start)) || isNaN(Date.parse(filters.end))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    if (!filters.groupBy) {
      throw new Exception('Missing groupBy param', 400)
    }

    const startAsDateTime = CustomHelpers.dateAsDateTime(filters.start)
    const endAsDateTimePlusOne = CustomHelpers.dateAsDateTime(filters.end).plus({ days: 1 })

    const timeAndActivityQuery = await Database.from('tracking_sessions')
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .where('user_id', filters.userId)
      .join('tasks', 'tracking_sessions.task_id', '=', 'tasks.id')
      .join('projects', 'tasks.project_id', '=', 'projects.id')
      .select(
        Database.raw(
          "to_char( started_at, 'MM-DD-YYYY') as started_date, sum(tracking_sessions.tracking_time) as tracking_time, tasks.name as task, projects.name as project"
        )
      )
      .groupByRaw('projects.name, tasks.name, started_date')
      .orderBy('started_date')

    return CustomHelpers.groupBy(timeAndActivityQuery, filters.groupBy)
  }
}

export default new ReportsService()
