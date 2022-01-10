import { DateTime } from 'luxon'

export interface JiraIssue {
  id: string
  creator: {
    accountId: string
  }
  fields: {
    created: DateTime
    timeestimate: number
    timetracking: {
      timeSpentSeconds: number
    }
    assignee: {
      accountId: string
    }
    summary: string
    description: {
      content: content[]
    }
    project: {
      id: string
    }
    status: {
      name: string
    }
  }
}
interface content {
  content: Object[]
}

export interface JiraPaginatedIssues {
  nextPage?: string
  issues: JiraIssue[]
}
