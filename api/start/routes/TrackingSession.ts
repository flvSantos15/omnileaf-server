import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('tracking-sessions', 'TrackingSessionsController.list')

  Route.get('tracking-sessions/:id', 'TrackingSessionsController.show')

  Route.post('tracking-sessions', 'TrackingSessionsController.create')

  Route.post('tracking-sessions/create-many', 'TrackingSessionsController.createMany')

  Route.patch('tracking-sessions/:id/close/', 'TrackingSessionsController.closeSession')

  Route.patch(
    'tracking-sessions/:id/tracking-time',
    'TrackingSessionsController.updateTrackingTime'
  )

  //   Route.delete('tracking-session/:id', 'TrackingSessionsController.delete')
}).middleware('auth')
