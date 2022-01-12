import { DateTime } from 'luxon'

export interface GitlabIssue {
  id: number
  title: string
  iid: number
  description: string
  state: string
  project_id: number
  author: {
    id: number
  }
  created_at: DateTime
  updated_at: DateTime
  closed_at: DateTime
  assignee: {
    id: number
  }
  time_stats: {
    time_estimate: number
    total_time_spent: number
  }
}
