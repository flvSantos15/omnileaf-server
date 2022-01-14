import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ScreenshotsReportParams } from 'App/Interfaces/Reports/reports-service.interface'
import ReportsService from 'App/Services/Reports/ReportsService'

export default class ReportsController {
  public async screenshots({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as ScreenshotsReportParams

    const screenshots = await ReportsService.screenshots({ params })

    logger.info('Succesfully retrieved Screenshots reports')

    response.send(screenshots)
  }
}
