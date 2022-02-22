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
import TimeAndActiviyExtensions from 'App/Extensions/TimeAndActiviyExtensions'
import GetOrgWeeklyReportValidator from 'App/Validators/Report/TimeAndActivity/GetOrgWeeklyReportValidator'
import User from 'App/Models/User'
import Task from 'App/Models/Task'

class TimeAndActivityService {
  public async getUsersWorkSummaryByOrg({ params }: OrganizationUsersWorkSummaryRequest) {
    await GetOrganizationUsersWorkSummaryValidator.validate(params)

    const { start, end, userId, organizationId } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    let sessionsQuery = await Database.from((subquery) => {
      subquery
        .from(TrackingSession.table)
        .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
        .andWhere(`${TrackingSession.table}.organization_id`, organizationId)

      if (userId) {
        subquery.andWhere(`${TrackingSession.table}.user_id`, userId)
      }

      subquery

        .join(`${Project.table}`, (query) => {
          query.on(`${TrackingSession.table}.project_id`, '=', `${Project.table}.id`)
        })

        .sum(`${TrackingSession.table}.tracking_time as time_tracked`)

        .countDistinct(`${Project.table}.id as projects_worked`)

        .select(
          Database.raw(
            `trim(to_char((1 - (cast(sum(${TrackingSession.table}.inactivity_time) as float) 
            / cast(sum(${TrackingSession.table}.tracking_time) as float))) * 100, '999%')) as activity`
          )
        )

        .as('result')
    })
      .select(
        Database.raw(
          'cast(result.time_tracked as integer), cast(result.projects_worked as integer), result.activity'
        )
      )
      .first()

    return sessionsQuery
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
          cast(sum(${TrackingSession.table}.tracking_time) as integer) as tracking_time,
          ${TrackingSession.table}.type`
        )
      )
      //TO-DO: Add tracking time Type: session /  manual and groupBy type in line above
      .groupByRaw('date, type')
      .orderBy('date')

    return sessions
  }

  public async getGroupedReport({ params }: GroupedReportRequest) {
    await GetGroupedReportValidator.validate(params)

    const { start, end, userId, organizationId, groupBy } = params

    const startAsDateTime = DateTime.fromISO(start)
    const endAsDateTimePlusOne = DateTime.fromISO(end).plus({ days: 1 })

    const sessionsSum = await Database.from((subquery) => {
      subquery
        .from(TrackingSession.table)
        .whereBetween('started_at', [startAsDateTime.toSQLDate(), endAsDateTimePlusOne.toSQLDate()])
        .andWhere(`${TrackingSession.table}.organization_id`, organizationId)
        .andWhere(`${TrackingSession.table}.user_id`, userId)
        .join(`${Task.table}`, `${TrackingSession.table}.task_id`, '=', `${Task.table}.id`)
        .join(`${Project.table}`, `${TrackingSession.table}.project_id`, '=', `${Project.table}.id`)
        .leftJoin(`${User.table}`, `${Project.table}.client_id`, '=', `${User.table}.id`)
        .select(
          Database.raw(
            `to_char(started_at, 'YYYY-MM-DD') as date,
        cast(sum(${TrackingSession.table}.tracking_time) as integer) as tracking_time,
        cast(sum(${TrackingSession.table}.inactivity_time) as integer) as inactivity_time,
        trim(to_char(
          (1 - (
              cast(sum(${TrackingSession.table}.inactivity_time) as float) 
              / cast(sum(${TrackingSession.table}.tracking_time) as float)
            )
          ) * 100, '999%')) as activity_time,
        ${Task.table}.name as task,
        ${Task.table}.id as task_id,
        ${Project.table}.name as project,
        ${Project.table}.id as project_id,
        ${Project.table}.avatar_url as project_avatar,
        ${User.table}.name as client,
        ${User.table}.id as client_id,
        ${User.table}.avatar_url as client_avatar`
          )
        )
        .groupByRaw(`${Project.table}.id, ${Task.table}.id, ${User.table}.id, date`)
        .orderBy('date')
        .as('grouped_sessions')
    })

    return TimeAndActiviyExtensions.mapSessionsToGroupedReport(sessionsSum, groupBy)
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
          cast(sum(tracking_sessions.tracking_time) as integer) as tracked,
          trim(to_char(
            (1 - (
                cast(sum(${TrackingSession.table}.inactivity_time) as float) 
                / cast(sum(${TrackingSession.table}.tracking_time) as float)
              )
            ) * 100, '999%')) as activity_time, 
          ${Project.table}.name as project, 
          ${Project.table}.id as project_id,
          ${Project.table}.avatar_url`
        )
      )
      .groupByRaw(`${Project.table}.id, date`)
      .orderBy('date')

    return TimeAndActiviyExtensions.mapSessionsToUserWeeklyReport(sessions)
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
          cast(sum(tracking_sessions.tracking_time) as integer) as tracked,
          trim(to_char(
            (1 - (
                cast(sum(${TrackingSession.table}.inactivity_time) as float) 
                / cast(sum(${TrackingSession.table}.tracking_time) as float)
              )
            ) * 100, '999%')) as activity_time, 
          ${User.table}.name as user, 
          ${User.table}.avatar_url, 
          ${User.table}.id as user_id`
        )
      )
      .groupByRaw(`${User.table}.id, ${User.table}.avatar_url, date`)
      .orderBy('date')

    const sessions = await sessionsQuery

    return TimeAndActiviyExtensions.mapSessionsToOrgWeeklyReport(sessions)
  }
}

export default new TimeAndActivityService()
