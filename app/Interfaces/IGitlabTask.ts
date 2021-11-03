import { DateTime } from 'luxon'

export interface IgitlabAssignee {
  id: number
  name: string
  avatar_url: string
}

export interface IgitlabTask {
  id: number
  title: string
  iid: number
  description: string
  state: string
  author: {
    id: number
  }
  created_at: DateTime
  updated_at: DateTime
  closed_at: DateTime
  assignees: IgitlabAssignee[]
  time_stats: {
    time_estimate: number
    total_time_spent: number
  }
}
