import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TrackingSessionStatus } from 'Contracts/enums'

export default class CreateManySessionValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    sessions: schema.array().members(
      schema.object().members({
        status: schema.enum.optional(Object.values(TrackingSessionStatus)),
        trackingTime: schema.number(),
        userId: schema.string({}, [rules.uuid({ version: 4 })]),
        taskId: schema.string({}, [rules.uuid({ version: 4 })]),
        startedAt: schema.date(),
        stoppedAt: schema.date.optional(),
        screenshots: schema.array.optional().members(
          schema.object().members({
            createdAt: schema.date(),
            isDeleted: schema.boolean(),
            base64: schema.string(),
          })
        ),
      })
    ),
  })
}
