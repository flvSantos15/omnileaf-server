import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get(
    'reports/screenshots/time-and-activity',
    'ReportsController.timeAndActivityOnScreenshotsReports'
  )

  Route.get('reports/screenshots', 'ReportsController.allScreenshots')

  Route.get('reports/tracking-sessions', 'ReportsController.everyTenMinutesScreenshots')

  Route.get('reports/time-and-activity', 'ReportsController.timeAndActivity')
})
