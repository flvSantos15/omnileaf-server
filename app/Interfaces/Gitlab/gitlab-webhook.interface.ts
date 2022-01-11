import { DateTime } from 'luxon'

export interface GitlabWebhook {
  id: number
  created_at: DateTime
}
