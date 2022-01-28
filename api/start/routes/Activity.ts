import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get(
    'activity/screenshots/time-and-activity',
    'ActivitiesController.timeAndActivityOnScreenshots'
  )

  Route.get('activity/screenshots/all', 'ActivitiesController.allScreenshots')

  Route.get(
    'activity/screenshots/every-ten-minutes',
    'ActivitiesController.everyTenMinutesScreenshots'
  )
}).middleware('auth')
