import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get(
    'reports/screenshots/time-and-activity',
    'ReportsController.timeAndActivityOnScreenshotsReports'
  )

  Route.get('reports/screenshots/all', 'ReportsController.allScreenshots')

  Route.get('reports/screenshots/every-ten-minutes', 'ReportsController.everyTenMinutesScreenshots')

  Route.get('reports/time-and-activity', 'ReportsController.timeAndActivity')
})
