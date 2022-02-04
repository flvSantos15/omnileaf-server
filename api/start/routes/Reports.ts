import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get(
    'reports/time-and-activity/users-work-summary',
    'ReportsController.getUsersWorkSummaryByOrg'
  )

  Route.get('reports/time-and-activity/hours-per-day', 'ReportsController.getHoursWorkedPerDay')

  Route.get('reports/time-and-activity/grouped', 'ReportsController.getGroupedReport')

  Route.get('reports/time-and-activity/user-weekly', 'ReportsController.getUserWeeklyReport')

  Route.get('reports/time-and-activity/organization-weekly', 'ReportsController.getOrgWeeklyReport')
})
