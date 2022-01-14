export interface ScreenshotsReportParams {
  filters: {
    date: string
    user: string
  }
}

export interface ScreenshotsReportRequest {
  params: ScreenshotsReportParams
}
