export interface TimeAndActivityOnScreenshotsRequest {
  params: TimeAndActivityOnScreenshotsParams
}

export interface TimeAndActivityOnScreenshotsParams {
  userId: string
  date: string
}

export interface AllScreenshotsRequest {
  params: AllScreenshotsParams
}

export interface AllScreenshotsParams {
  date: string
  userId: string
}

export interface EveryTenMinutesRequest {
  params: EveryTenMinutesParams
}

export interface EveryTenMinutesParams {
  date: string
  userId: string
}
