import Database from '@ioc:Adonis/Lucid/Database'
import {
  GroupedReportRequest,
  HoursWorkedPerDayRequest,
  OrganizationUsersWorkSummaryRequest,
  OrgWeeklyReportRequest,
  UserWeeklyReportRequest,
} from 'App/Interfaces/Reports/time-and-activity-service.interface'
import TrackingSession from 'App/Models/TrackingSession'
import Project from 'App/Models/Project'
import GetGroupedReportValidator from 'App/Validators/Report/TimeAndActivity/GetGroupedReportValidator'
import { DateTime } from 'luxon'
import GetOrganizationUsersWorkSummaryValidator from 'App/Validators/Report/TimeAndActivity/GetOrganizationUsersWorkSummaryValidator'
import GetUserWeeklyReportValidator from 'App/Validators/Report/TimeAndActivity/GetUserWeeklyReportValidator'
import TimeAndActiviyServiceExtensions from 'App/Extensions/TimeAndActiviyServiceExtensions'
import GetOrgWeeklyReportValidator from 'App/Validators/Report/TimeAndActivity/GetOrgWeeklyReportValidator'
import User from 'App/Models/User'
import Task from 'App/Models/Task'

class TimeAndActivityService {
  public async getUsersWorkSummaryByOrg({ params }: OrganizationUsersWorkSummaryRequest) {
    await GetOrganizationUsersWorkSummaryValidator.validate(params)

    const { start, end, userId, organizationId } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    let sessionsQuery = Database.from(TrackingSession.table)
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .andWhere(`${TrackingSession.table}.organization_id`, organizationId)

    if (userId) {
      sessionsQuery = sessionsQuery.andWhere(`${TrackingSession.table}.user_id`, userId)
    }

    sessionsQuery = sessionsQuery.join(`${Project.table}`, (query) => {
      query.on(`${TrackingSession.table}.project_id`, '=', `${Project.table}.id`)
    })

    const usersWorkSummary = await sessionsQuery
      .sum(`${TrackingSession.table}.tracking_time as timeTracked`)

      .countDistinct(`${Project.table}.id as projectsWorked`)

      .select(
        Database.raw(
          `TRIM(
            TO_CHAR(
              ((1 - (sum(${TrackingSession.table}.inactivity_time) / sum(${TrackingSession.table}.tracking_time))) * 100
            ), '999%')
          ) as activity`
        )
      )
      .first()

    return usersWorkSummary
  }

  public async getHoursWorkedPerDay({ params }: HoursWorkedPerDayRequest) {
    await GetOrganizationUsersWorkSummaryValidator.validate(params)

    const { start, end, userId, organizationId } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    let sessionsQuery = Database.from(TrackingSession.table)
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .andWhere(`${TrackingSession.table}.organization_id`, organizationId)

    if (userId) {
      sessionsQuery = sessionsQuery.andWhere(`${TrackingSession.table}.user_id`, userId)
    }

    const sessions = await sessionsQuery
      .select(
        Database.raw(
          `to_char(started_at, 'YYYY-MM-DD') as date,
          sum(${TrackingSession.table}.tracking_time) as tracking_time`
        )
      )
      //TO-DO: Add tracking time Type: session /  manual and groupBy type in line above
      .groupByRaw('date')
      .orderBy('date')

    return sessions
  }

  public async getGroupedReport({ params }: GroupedReportRequest) {
    await GetGroupedReportValidator.validate(params)

    const { start, end, userId, organizationId, groupBy } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    const sessionsSum = await Database.from(TrackingSession.table)
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .andWhere(`${TrackingSession.table}.organization_id`, organizationId)
      .andWhere(`${TrackingSession.table}.user_id`, userId)
      .join(`${Task.table}`, `${TrackingSession.table}.task_id`, '=', `${Task.table}.id`)
      .join(`${Project.table}`, `${TrackingSession.table}.project_id`, '=', `${Project.table}.id`)
      .leftJoin(`${User.table}`, `${Project.table}.client_id`, '=', `${User.table}.id`)

      .select(
        Database.raw(
          `to_char(started_at, 'YYYY-MM-DD') as date,
        sum(${TrackingSession.table}.tracking_time) as tracking_time,
        ${Task.table}.name as task,
        ${Task.table}.id as task_id,
        ${Project.table}.name as project,
        ${Project.table}.id as project_id,
        ${User.table}.name as client,
        ${User.table}.id as client_id`
        )
      )
      .groupByRaw(`${Project.table}.id, ${Task.table}.id, ${User.table}.id, date`)
      .orderBy('date')

    return TimeAndActiviyServiceExtensions.mapSessionsToGroupedReport(sessionsSum, groupBy)
  }

  public async getUserWeeklyReport({ params }: UserWeeklyReportRequest) {
    await GetUserWeeklyReportValidator.validate(params)

    const { start, end, userId, organizationId } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    const sessions = await Database.from(TrackingSession.table)
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .andWhere(`${TrackingSession.table}.organization_id`, organizationId)
      .andWhere(`${TrackingSession.table}.user_id`, userId)
      .join(`${Project.table}`, `${TrackingSession.table}.project_id`, '=', `${Project.table}.id`)
      .select(
        Database.raw(
          `to_char(started_at, 'YYYY-MM-DD') as date, 
          sum(cast(tracking_sessions.tracking_time as integer)) as tracked, 
          ${Project.table}.name as project, ${Project.table}.id as project_id`
        )
      )
      .groupByRaw(`${Project.table}.id, date`)
      .orderBy('date')

    return TimeAndActiviyServiceExtensions.mapSessionsToUserWeeklyReport(sessions)
  }

  public async getOrganizationWeeklyReport({ params }: OrgWeeklyReportRequest) {
    await GetOrgWeeklyReportValidator.validate(params)

    const { start, end, userId, organizationId } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    let sessionsQuery = Database.from(TrackingSession.table)
      .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
      .andWhere(`${TrackingSession.table}.organization_id`, organizationId)

    if (userId) {
      sessionsQuery = sessionsQuery.andWhere(`${TrackingSession.table}.user_id`, userId)
    }

    sessionsQuery = sessionsQuery
      .join(`${User.table}`, `${TrackingSession.table}.user_id`, '=', `${User.table}.id`)
      .select(
        Database.raw(
          `to_char(started_at, 'YYYY-MM-DD') as date, 
          sum(cast(tracking_sessions.tracking_time as integer)) as tracked, 
          ${User.table}.name as user, ${User.table}.avatar_url, ${User.table}.id as user_id`
        )
      )
      .groupByRaw(`${User.table}.id, ${User.table}.avatar_url, date`)
      .orderBy('date')

    const sessions = await sessionsQuery

    return TimeAndActiviyServiceExtensions.mapSessionsToOrgWeeklyReport(sessions)
  }
}

export default new TimeAndActivityService()
