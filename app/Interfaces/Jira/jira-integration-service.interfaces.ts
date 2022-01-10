import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'
import { JiraIssue } from './jira-issue.interface'
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
  id: string
  payload: {
    jiraId: string
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
  issues: JiraIssue[]
}

export interface UpdateOrCreateTaskFromJiraIssueProps {
  issue: JiraIssue
  projectId: string
}

export interface JiraIssueWebhook {
  webhookEvent: JiraIssueWebhookEvent
  issue: JiraIssue
}

export enum JiraIssueWebhookEvent {
  CREATED = 'jira:issue_created',
  UPDATED = 'jira:issue_updated',
  DELETED = 'jira:issue_deleted',
}

export interface AssignUserFromJiraToTaskProps {
  task: Task
  issueAssignee: {
    accountId: string
  }
}
