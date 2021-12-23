import { GitlabAccessLevels } from 'Contracts/enums/gitlab-access-levels'
import { DateTime } from 'luxon'

export interface IGitlabProject {
  id: number
  description?: string
  name: string
  created_at: DateTime
  avatar_url?: string
  creator_id?: number
  permissions?: {
    project_access?: {
      access_level: GitlabAccessLevels
    }
    group_access?: {
      access_level: GitlabAccessLevels
    }
  }
}
