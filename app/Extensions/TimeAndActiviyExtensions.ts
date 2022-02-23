import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'

class TimeAndActivityExtensions {
  private _getWeeklyAvgActivity(Data: any) {
    const averageActivityArray = Data.map((data: any) => {
      return data.activity_time ? Number(data.activity_time.replace('%', '')) : 0
    })

    return (
      Math.round(
        averageActivityArray.reduce((acc, curr) => {
          return acc + curr
        }, 0) / averageActivityArray.length
      ).toString() + '%'
    )
  }

  public mapSessionsToUserWeeklyReport(sessions: any[]) {
    const mappedGroup = {}
    const mappedGroupArray: any[] = []

    const grouped = CustomHelpers.groupBy(sessions, 'project_id')

    for (const group in grouped) {
      const currentData = grouped[group]

      mappedGroup[group] = {}
      mappedGroup[group]['project'] = currentData[0]['project']

      mappedGroup[group]['avatarUrl'] = currentData[0]['avatar_url']

      mappedGroup[group]['data'] = currentData

      mappedGroup[group]['totalTracked'] = currentData.reduce((acc: number, curr: any) => {
        return acc + Number(curr.tracked)
      }, 0)

      mappedGroup[group]['averageActivity'] = this._getWeeklyAvgActivity(currentData)
    }

    for (const group in mappedGroup) {
      mappedGroupArray.push(mappedGroup[group])
    }

    return mappedGroupArray
  }

  public mapSessionsToOrgWeeklyReport(sessions: any[]) {
    const mappedGroup = {}
    const mappedGroupArray: any[] = []

    const grouped = CustomHelpers.groupBy(sessions, 'user_id')

    for (const group in grouped) {
      const currentData = grouped[group]

      mappedGroup[group] = {}
      mappedGroup[group]['user'] = currentData[0]['user']
      mappedGroup[group]['avatarUrl'] = currentData[0]['avatar_url']
      mappedGroup[group]['data'] = currentData

      mappedGroup[group]['totalTracked'] = currentData.reduce((acc: number, curr: any) => {
        return acc + Number(curr.tracked)
      }, 0)

      mappedGroup[group]['averageActivity'] = this._getWeeklyAvgActivity(currentData)
    }

    for (const group in mappedGroup) {
      mappedGroupArray.push(mappedGroup[group])
    }

    return mappedGroupArray
  }

  public mapSessionsToGroupedReport(sessions: any[], groupBy: string) {
    const mappedGroup = {}
    const mappedGroupArray: any[] = []

    const groupByClause =
      (groupBy === 'project' && 'project_id') ||
      (groupBy === 'task' && 'task_id') ||
      (groupBy === 'client' && 'client_id') ||
      groupBy

    const grouped = CustomHelpers.groupBy(sessions, groupByClause)

    for (const group in grouped) {
      const groupIsNotNull = group !== 'null'

      if (groupIsNotNull) {
        const currentData = grouped[group]

        mappedGroup[group] = {}
        mappedGroup[group][groupBy] = currentData[0][groupBy]
        if (groupBy === 'project') {
          mappedGroup[group]['avatarUrl'] = currentData[0]['project_avatar']
        }
        if (groupBy === 'client') {
          mappedGroup[group]['avatarUrl'] = currentData[0]['client_avatar']
        }
        mappedGroup[group]['data'] = currentData
      }
    }

    for (const group in mappedGroup) {
      mappedGroupArray.push(mappedGroup[group])
    }

    return mappedGroupArray
  }
}

export default new TimeAndActivityExtensions()
