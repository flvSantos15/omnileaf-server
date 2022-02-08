import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('manual-entries', 'ManualEntriesController.create')

  Route.patch('manual-entries/:id/approove', 'ManualEntriesController.approove')

  Route.patch('manual-entries/:id/deny', 'ManualEntriesController.deny')
}).middleware('auth')
