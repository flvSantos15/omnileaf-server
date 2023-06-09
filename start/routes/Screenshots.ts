import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('screenshots', 'ScreenshotsController.register')

  Route.delete('screenshots/:id', 'ScreenshotsController.delete')
}).middleware('auth')
