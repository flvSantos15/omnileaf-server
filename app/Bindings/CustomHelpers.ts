import CustomHelpersInterface from 'Contracts/interfaces/CustomHelpers.interface'
import { types } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'

export default class CustomHelpers implements CustomHelpersInterface {
  dateAsDateTime(date: Date | string): DateTime {
    if (types.isString(date)) {
      const newDate = new Date(date)
      return DateTime.fromISO(newDate.toISOString())
    }

    return DateTime.fromISO(date.toISOString())
  }

  groupBy(arr: any[], key: string) {
    return arr.reduce(function (acc: any, curr: any) {
      ;(acc[curr[key]] = acc[curr[key]] || []).push(curr)
      return acc
    }, {})
  }
}
