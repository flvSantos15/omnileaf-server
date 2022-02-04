import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  GroupedReportParams,
  HoursWorkedPerDayParams,
  OrganizationUsersWorkSummaryParams,
  OrgWeeklyReportParams,
  UserWeeklyReportParams,
} from 'App/Interfaces/Reports/time-and-activity-service.interface'
import TimeAndActivityService from 'App/Services/Reports/TimeAndActivityService'

export default class ReportsController {
  /**
   *
   * Time and Activiy controllers
   */
  public async getUsersWorkSummaryByOrg({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as OrganizationUsersWorkSummaryParams

    const sessions = await TimeAndActivityService.getUsersWorkSummaryByOrg({ params })

    logger.info('Succesfully retrieved organization users work summary')

    response.send(sessions)
  }

  public async getHoursWorkedPerDay({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as HoursWorkedPerDayParams

    const sessions = await TimeAndActivityService.getHoursWorkedPerDay({ params })

    logger.info('Succesfully retrieved organization users work summary')

    response.send(sessions)
  }

  public async getGroupedReport({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as GroupedReportParams

    const timeAndActivityReport = await TimeAndActivityService.getGroupedReport({ params })

    logger.info('Succesfully retrieved Time & Activity reports')

    response.send(timeAndActivityReport)
  }

  public async getUserWeeklyReport({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as UserWeeklyReportParams

    const userWeeklyReport = await TimeAndActivityService.getUserWeeklyReport({ params })

    logger.info('Succesfully retrieved user weekly report')

    response.send(userWeeklyReport)
  }

  public async getOrgWeeklyReport({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as OrgWeeklyReportParams

    const orgWeeklyReport = await TimeAndActivityService.getOrganizationWeeklyReport({ params })

    logger.info('Succesfully retrieved organization weekly report')

    response.send(orgWeeklyReport)
  }
}
