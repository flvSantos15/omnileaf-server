import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ReportParams } from 'App/Interfaces/Reports/reports-service.interface'
import ReportsService from 'App/Services/Reports/ReportsService'

export default class ReportsController {
  public async screenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as ReportParams

    const screenshots = await ReportsService.screenshots({ params })

    logger.info('Succesfully retrieved Screenshots reports')

    response.send(screenshots)
  }

  public async trackingSessions({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as ReportParams

    const trackingSessions = await ReportsService.trackingSessions({ params })

    logger.info('Succesfully retrieved Tracking Sessions reports')

    response.send(trackingSessions)
  }
}
