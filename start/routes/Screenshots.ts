import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('screenshots', 'ScreenShotsController.register')

  Route.post('screenshots/upload', 'ScreenShotsController.upload')

  Route.delete('screenshots/:id', 'ScreenShotsController.delete')
}).middleware('auth')
