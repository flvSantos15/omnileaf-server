export interface ReportParams {
  filters: {
    date: string
    user: string
  }
}

export interface TimeAndActivityReportParams {
  filters: {
    start: string
    end: string
    userId: string
    groupBy: 'date' | 'task' | 'project'
  }
}

export interface ReportRequest {
  params: ReportParams
}

export interface TimeAndActivityReportRequest {
  params: TimeAndActivityReportParams
}
