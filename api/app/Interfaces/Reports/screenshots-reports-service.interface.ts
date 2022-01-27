export interface TimeAndActivityOnScreenshotsReportsRequest {
  params: TimeAndActivityOnScreenshotsReportsParams
}

export interface TimeAndActivityOnScreenshotsReportsParams {
  userId: string
  date: string
}

export interface AllScreenshotReportRequest {
  params: AllScreenshotReportParams
}

export interface AllScreenshotReportParams {
  date: string
  userId: string
}

export interface EveryTenMinutesReportRequest {
  params: EveryTenMinutesParams
}

export interface EveryTenMinutesParams {
  date: string
  userId: string
}
