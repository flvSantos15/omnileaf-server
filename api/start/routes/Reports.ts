import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('reports/screenshots', 'ReportsController.screenshots')

  Route.get('reports/tracking-sessions', 'ReportsController.trackingSessions')
}).middleware('reports')
