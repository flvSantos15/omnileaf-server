export interface TimeAndActivityReportParams {
  start: string
  end: string
  userId: string
  groupBy: 'date' | 'task' | 'project'
}

export interface TimeAndActivityReportRequest {
  params: TimeAndActivityReportParams
}
