export type AccessLevelProps = 0 | 5 | 10 | 20 | 30 | 40 | 50

export interface IGitlabUser {
  id: number
  avatar_url: string
  name: string
  access_level: AccessLevelProps
}
