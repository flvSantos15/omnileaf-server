import { GitlabAccessLevels } from 'Contracts/enums/gitlab-access-levels'

export interface GitlabUser {
  id: number
  avatar_url: string
  name: string
  access_level: GitlabAccessLevels
}
