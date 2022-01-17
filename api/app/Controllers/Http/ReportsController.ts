import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  ReportParams,
  TimeAndActivityReportParams,
} from 'App/Interfaces/Reports/reports-service.interface'
import ReportsService from 'App/Services/Reports/ReportsService'

export default class ReportsController {
  public async screenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as ReportParams

    const screenshotsReport = await ReportsService.getScreenshotsReport({ params })

    logger.info('Succesfully retrieved Screenshots reports')

    response.send(screenshotsReport)
  }

  public async trackingSessions({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as ReportParams

    const trackingSessionsReport = await ReportsService.getTrackingSessionsReport({ params })

    logger.info('Succesfully retrieved Tracking Sessions reports')

    response.send(trackingSessionsReport)
  }

  public async timeAndActivity({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as TimeAndActivityReportParams

    const timeAndActivityReport = await ReportsService.getTimeAndActivityReport({ params })

    logger.info('Succesfully retrieved Time & Activity reports')

    response.send(timeAndActivityReport)
  }
}
