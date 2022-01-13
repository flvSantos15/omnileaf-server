import Task from 'App/Models/Task'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  taskId: string
}

export default class CreateTrackingSessionValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    taskId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateCreateTrackingSession = async (request): Promise<Task> => {
  const payload: PayloadProps = await request.validate(CreateTrackingSessionValidator)

  //Check if task exists
  const task = await Task.find(payload.taskId)
  if (!task) {
    throw new Exception('Task not found', 404)
  }

  // Return Task found
  return task
}
