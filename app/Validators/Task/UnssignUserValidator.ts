import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'

type PayloadProps = {
  userId: string
}

export default class UnssignUserToTaskValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateUnssignUserToTask = async (id: string, request) => {
  const { userId }: PayloadProps = await request.validate(UnssignUserToTaskValidator)

  //Check if User exists
  const user = await User.find(userId)
  if (!user) {
    throw new Exception('User not found.', 404)
  }

  //Validates if user is already assigned to task
  await user.load('assignedTasks')
  if (!user.assignedTasks.map((tsk) => tsk.id).includes(id)) {
    throw new Exception('User is not assigned to task', 404)
  }

  //Return payload and project
  return { userId }
}
