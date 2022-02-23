import ManualEntry from 'App/Models/ManualEntry'
import TrackingSession from 'App/Models/TrackingSession'
import { TrackingSessionStatus } from 'Contracts/enums'
import { TrackingSessionType } from 'Contracts/enums/tracking-session-type'
import { DateTime } from 'luxon'

class ManualEntryExtensions {
  public createSessionsPayload(entry: ManualEntry) {
    const sessionsPayload: Partial<TrackingSession>[] = []

    const startedDate = DateTime.fromISO(entry.startedDate.toString())
    const finishedDate = DateTime.fromISO(entry.finishedDate.toString())

    const DIFF_IN_DAYS = finishedDate.diff(startedDate, 'days').toObject().days

    const [startedHours, startedMins] = entry.workedFrom.split(':').map((value) => Number(value))
    const [finishedHours, finishedMins] = entry.workedTo.split(':').map((value) => Number(value))

    const START_DAYS_DIFF = 0

    for (
      let CURRENT_DAY_DIFF = START_DAYS_DIFF;
      CURRENT_DAY_DIFF <= DIFF_IN_DAYS!;
      CURRENT_DAY_DIFF++
    ) {
      const startedAt =
        CURRENT_DAY_DIFF === START_DAYS_DIFF
          ? startedDate.plus({ hours: startedHours, minutes: startedMins })
          : startedDate.plus({ days: CURRENT_DAY_DIFF })

      const stoppedAt =
        CURRENT_DAY_DIFF === DIFF_IN_DAYS
          ? finishedDate.plus({ hours: finishedHours, minutes: finishedMins })
          : startedDate.plus({ days: CURRENT_DAY_DIFF + 1 })

      const trackingTime = stoppedAt.diff(startedAt, 'seconds').toObject().seconds

      const payload: Partial<TrackingSession> = {
        status: TrackingSessionStatus.FINISHED,
        userId: entry.userId,
        taskId: entry.taskId,
        startedAt,
        stoppedAt,
        trackingTime,
        type: TrackingSessionType.MANUAL,
      }

      sessionsPayload.push(payload)
    }

    return sessionsPayload
  }
}

export default new ManualEntryExtensions()
