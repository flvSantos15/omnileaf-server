import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  AllScreenshotsParams,
  EveryTenMinutesParams,
  TimeAndActivityOnScreenshotsParams,
} from 'App/Interfaces/Activity/screenshots-activity-service.interfaces'
import ScreenshotsActivityService from 'App/Services/Activity/ScreenshotsActivityService'

export default class ActivitiesController {
  public async timeAndActivityOnScreenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as TimeAndActivityOnScreenshotsParams

    const timeAndActivityReport = await ScreenshotsActivityService.timeAndActivity({ params })

    logger.info('Succesfully retrieved time and activity on screenshots')

    response.send(timeAndActivityReport)
  }

  public async allScreenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as AllScreenshotsParams

    const screenshotsReport = await ScreenshotsActivityService.allScreenshots({ params })

    logger.info('Succesfully retrieved all screenshots')

    response.send(screenshotsReport)
  }

  public async everyTenMinutesScreenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as EveryTenMinutesParams

    const trackingSessionsReport = await ScreenshotsActivityService.everyTenMinutes({ params })

    logger.info('Succesfully retrieved every ten minutes screenshots')

    response.send(trackingSessionsReport)
  }
}
