import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('screenshots', 'ScreenShotsController.create')

  Route.delete('screenshots/:id', 'ScreenShotsController.delete')
}).middleware('auth')
