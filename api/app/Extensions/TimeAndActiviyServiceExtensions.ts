import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'

class TimeAndActivityServiceExtensions {
  public mapSessionsToUserWeeklyReport(sessions: any[]) {
    const newGroup = {}
    const newGroupArray: any[] = []

    const grouped = CustomHelpers.groupBy(sessions, 'project_id')

    for (const group in grouped) {
      const currentData = grouped[group]

      const currentGroupTotalTracked = grouped[group].reduce((acc: number, curr: any) => {
        return acc + Number(curr.tracked)
      }, 0)

      newGroup[group] = {}
      newGroup[group]['project'] = grouped[group][0]['project']
      //TO-DO: ADD PROJECT AVATAR
      newGroup[group]['projectAvatar'] = ''
      newGroup[group]['data'] = currentData
      newGroup[group]['totalTracked'] = currentGroupTotalTracked
      //TO-DO CALCULATE AVG ACTIVITY
      newGroup[group]['averageActivity'] = 0
    }

    for (const group in newGroup) {
      newGroupArray.push(newGroup[group])
    }

    return newGroupArray
  }

  public mapSessionsToOrgWeeklyReport(sessions: any[]) {
    const newGroup = {}
    const newGroupArray: any[] = []

    const grouped = CustomHelpers.groupBy(sessions, 'user_id')

    for (const group in grouped) {
      const currentData = grouped[group]

      const currentGroupTotalTracked = grouped[group].reduce((acc: number, curr: any) => {
        return acc + Number(curr.tracked)
      }, 0)

      newGroup[group] = {}
      newGroup[group]['user'] = grouped[group][0]['user']
      newGroup[group]['userAvatar'] = grouped[group][0]['avatar_url']
      newGroup[group]['data'] = currentData
      newGroup[group]['totalTracked'] = currentGroupTotalTracked
      //TO-DO CALCULATE AVG ACTIVITY
      newGroup[group]['averageActivity'] = 0
    }

    for (const group in newGroup) {
      newGroupArray.push(newGroup[group])
    }

    return newGroupArray
  }

  public mapSessionsToGroupedReport(sessions: any[], groupBy: string) {
    const groupByClause =
      (groupBy === 'project' && 'project_id') || (groupBy === 'task' && 'task_id') || groupBy

    const newGroup = {}
    const newGroupArray: any[] = []

    const grouped = CustomHelpers.groupBy(sessions, groupByClause)

    for (const group in grouped) {
      const currentData = grouped[group]

      newGroup[group] = {}
      newGroup[group][groupBy] = grouped[group][0][groupBy]
      if (groupBy === 'project') {
        newGroup[group]['projectAvatar'] = ''
      }
      newGroup[group]['data'] = currentData
    }

    for (const group in newGroup) {
      newGroupArray.push(newGroup[group])
    }

    return newGroupArray
  }
}

export default new TimeAndActivityServiceExtensions()
