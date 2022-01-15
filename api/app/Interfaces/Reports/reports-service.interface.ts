export interface ReportParams {
  filters: {
    date: string
    user: string
  }
}

export interface ReportRequest {
  params: ReportParams
}
