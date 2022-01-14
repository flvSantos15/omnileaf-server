export interface JiraProject {
  id: string
  key: string
  name: string
}

export interface JiraPaginatedProjects {
  nextPage?: string
  values: JiraProject[]
}

export interface ProjectRoleDetails {
  name: string
  id: number
  actors: ProjectRoleActor[]
}

interface ProjectRoleActor {
  id: number
  actorUser?: {
    accountId: string
  }
  actorGroup?: {
    name: string
  }
}

// TO-DO: This response type is related to my mocked project on Jira
// it should be updated to Main Leaf
export enum JiraProjectRoles {
  'atlassian-addons-project-access' = 'PM',
  'Administrator' = 'PM',
  'Viewer' = 'PV',
  'Member' = 'U',
}
