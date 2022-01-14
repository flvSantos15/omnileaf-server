import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import Screenshot from 'App/Models/Screenshot'
import { ScreenshotsReportRequest } from 'App/Interfaces/Reports/reports-service.interface'
import { Exception } from '@adonisjs/core/build/standalone'

class ReportsService {
  public async screenshots({ params }: ScreenshotsReportRequest) {
    const { filters } = params

    if (isNaN(Date.parse(filters.date))) {
      throw new Exception('Date filter should be a valid date. Ex: MM-dd-yyyy', 400)
    }

    const datetime = CustomHelpers.dateAsDateTime(filters.date)
    const oneDayAfterDate = datetime.plus({ days: 1 })

    const queryScreenshots = Screenshot.query().whereBetween('createdAt', [
      datetime.toSQLDate(),
      oneDayAfterDate.toSQLDate(),
    ])

    if (filters.user) {
      queryScreenshots.andWhere('user_id', filters.user)
    }

    const screenshots = await queryScreenshots

    return screenshots
  }
}

export default new ReportsService()
