import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TimeAndActivityReportParams } from 'App/Interfaces/Reports/time-and-activity-service.interface'
import TimeAndActivityService from 'App/Services/Reports/TimeAndActivityService'

export default class ReportsController {
  public async groupedReportOnTimeAndActivity({ request, response, logger }: HttpContextContract) {
    const params = request.qs() as TimeAndActivityReportParams

    const timeAndActivityReport = await TimeAndActivityService.getGroupedReport({ params })

    logger.info('Succesfully retrieved Time & Activity reports')

    response.send(timeAndActivityReport)
  }
}
