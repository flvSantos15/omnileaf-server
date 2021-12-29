import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import List from 'App/Models/List'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  name: string | undefined
  body: string | undefined
  timeEstimated: number | undefined
  listId: string | undefined
}

export default class UpdateTaskValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string.optional(),
    body: schema.string.optional(),
    timeEstimated: schema.number.optional(),
    listId: schema.string.optional({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateUpdateTask = async (request) => {
  const payload: PayloadProps = await request.validate(UpdateTaskValidator)

  //If List, Check if list exists
  if (payload.listId) {
    const list = await List.find(payload.listId)
    if (!list) {
      throw new Exception('List not found.', 404)
    }
  }

  //Return payload and project
  return payload
}
