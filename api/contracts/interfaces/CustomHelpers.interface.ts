import { DateTime } from 'luxon'

export default interface CustomHelpersInterface {
  dateAsDateTime(date: Date | string): DateTime
}
