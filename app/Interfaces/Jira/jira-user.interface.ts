import { ProjectRoles } from 'Contracts/enums'

export interface JiraUser {
  account_id: string
  email: string
  name: string
  picture: string
  email_verified: boolean
}

export interface JiraUserWithRole extends JiraUser {
  role: ProjectRoles
}

export interface JiraPaginatedUsers {
  nextPage?: string
  values: JiraUser[]
}

export type ProjectMemberProps = {
  id: string
  role: ProjectRoles
}

export interface JiraUserFromGroup {
  accountId: string
}
export interface PaginatedUsersFromGroup {
  nextPage?: string
  values: JiraUserFromGroup[]
}
