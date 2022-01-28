import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('reports/time-and-activity/grouped', 'ReportsController.groupedReportOnTimeAndActivity')
})
