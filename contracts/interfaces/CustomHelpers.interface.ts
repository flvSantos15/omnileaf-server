import { DateTime } from 'luxon'

export default interface CustomHelpersInterface {
  dateAsDateTime(date: Date | string): DateTime
  groupBy(xs: any[], key: string): any
}
