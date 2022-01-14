import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('reports/screenshots', 'ReportsController.screenshots')
})
  .middleware('auth')
  .middleware('reports')
