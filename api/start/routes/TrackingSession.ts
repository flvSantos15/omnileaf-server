import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('tracking-sessions', 'TrackingSessionsController.list')

  Route.get('tracking-sessions/:id', 'TrackingSessionsController.show')

  Route.post('tracking-sessions', 'TrackingSessionsController.create')

  Route.patch('tracking-sessions/close/:id', 'TrackingSessionsController.closeSession')

  //   Route.delete('tracking-session/:id', 'TrackingSessionsController.delete')
}).middleware('auth')
