import User from 'App/Models/User'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { GitlabIssue } from './gitlab-issue.interface'
import Task from 'App/Models/Task'
import { DateTime } from 'luxon'

export interface ImportProjectRequest {
  id: string
  payload: {
    gitlabId: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportOrganizationRequest {
  id: string
  user: User
  payload: {
    gitlabId: number
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportUserRequest {
  payload: {
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  user?: User
  bouncer: ActionsAuthorizerContract<User>
}

export interface UpdateOrCreateTaskFromGitlabIssueProps {
  issue: GitlabIssue
}

export interface AssignUserFromGitlabToTaskProps {
  task: Task
  issueAssignee?: {
    id: number
  }
}

export interface GitlabIssueFromWebhook {
  id: number
  project_id: number
  description?: string
  title: string
  time_estimate: number
  assignee_id: number
  state: string
  created_at: DateTime
  updated_at: DateTime
}

export interface GitlabIssueWebhook {
  object_attributes: GitlabIssueFromWebhook
}
