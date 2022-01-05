import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'
import { JiraIssue } from './jira-issue.interface'
import { JiraProject } from './jira-project.interface'
import { JiraTokenView } from './jira-token.interface'

export interface ImportJiraUserRequest {
  payload: {
    token: JiraTokenView
  }
  user?: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportJiraOrganizationRequest {
  id: string
  user: User
  payload: {
    jiraSiteId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportJiraProjectRequest {
  user: User
  payload: {
    project: JiraProject
    organizationId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ValidateTokenProps {
  expiresIn: number
  createdAt: number
}

interface ImportableUser {
  id: string
  role: ProjectRoles
}

export interface UpdateProjectUsersProps {
  project: Project
  users: ImportableUser[]
}

export interface UpdateProjectTaskProps {
  project: Project
  tasks: JiraIssue[]
}
