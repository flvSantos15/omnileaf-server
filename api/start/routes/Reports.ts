import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('reports/daily-track', 'ReportsController.getDailyTrack')

  Route.get('reports/screenshots', 'ReportsController.screenshots')

  Route.get('reports/tracking-sessions', 'ReportsController.trackingSessions')

  Route.get('reports/time-and-activity', 'ReportsController.timeAndActivity')
}).middleware('auth')
