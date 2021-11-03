import { DateTime } from 'luxon'

export interface IgitlabProject {
  id: number
  description?: string
  name: string
  created_at: DateTime
  avatar_url?: string
  creator_id?: number
}
