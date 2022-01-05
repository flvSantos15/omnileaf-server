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

    //TO-DO: insert task status, this is what defines which tasks will be showed for user to track
  }
}
interface content {
  content: Object[]
}

export interface JiraPaginatedIssues {
  nextPage?: string
  issues: JiraIssue[]
}
