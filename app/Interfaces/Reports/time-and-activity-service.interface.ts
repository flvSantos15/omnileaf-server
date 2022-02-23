export interface GroupedReportParams {
  start: string
  end: string
  userId: string
  organizationId: string
  groupBy: 'date' | 'task' | 'project' | 'client'
}

export interface GroupedReportRequest {
  params: GroupedReportParams
}

export interface OrganizationUsersWorkSummaryParams {
  start: string
  end: string
  userId?: string
  organizationId: string
}

export interface OrganizationUsersWorkSummaryRequest {
  params: OrganizationUsersWorkSummaryParams
}

export interface HoursWorkedPerDayParams {
  start: string
  end: string
  userId?: string
  organizationId: string
}

export interface HoursWorkedPerDayRequest {
  params: HoursWorkedPerDayParams
}

export interface UserWeeklyReportParams {
  start: string
  end: string
  userId: string
  organizationId: string
}

export interface UserWeeklyReportRequest {
  params: UserWeeklyReportParams
}

export interface OrgWeeklyReportParams {
  start: string
  end: string
  userId?: string
  organizationId: string
}

export interface OrgWeeklyReportRequest {
  params: OrgWeeklyReportParams
}
