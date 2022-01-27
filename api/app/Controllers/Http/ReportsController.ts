import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  AllScreenshotReportParams,
  EveryTenMinutesParams,
  TimeAndActivityOnScreenshotsReportsParams,
} from 'App/Interfaces/Reports/screenshots-reports-service.interface'
import { TimeAndActivityReportParams } from 'App/Interfaces/Reports/time-and-activity-service.interface'
import ScreenshotsReportsService from 'App/Services/Reports/ScreenshotsReportsService'
import TimeAndActivityService from 'App/Services/Reports/TimeAndActivityService'

export default class ReportsController {
  public async timeAndActivityOnScreenshotsReports({
    request,
    response,
    logger,
  }: HttpContextContract) {
    const params = request.qs() as TimeAndActivityOnScreenshotsReportsParams

    const timeAndActivityReport = await ScreenshotsReportsService.timeAndActivity({ params })

    logger.info('Succesfully retrieved time and activity on screenshots reports')

    response.send(timeAndActivityReport)
  }

  public async allScreenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as AllScreenshotReportParams

    const screenshotsReport = await ScreenshotsReportsService.allScreenshots({ params })

    logger.info('Succesfully retrieved Screenshots reports')

    response.send(screenshotsReport)
  }

  public async everyTenMinutesScreenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as EveryTenMinutesParams

    const trackingSessionsReport = await ScreenshotsReportsService.everyTenMinutes({ params })

    logger.info('Succesfully retrieved Tracking Sessions reports')

    response.send(trackingSessionsReport)
  }

  public async groupedReportOnTimeAndActivity({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as TimeAndActivityReportParams

    const timeAndActivityReport = await TimeAndActivityService.getGroupedReport({ params })

    logger.info('Succesfully retrieved Time & Activity reports')

    response.send(timeAndActivityReport)
  }
}
