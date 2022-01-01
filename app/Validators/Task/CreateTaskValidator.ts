import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import List from 'App/Models/List'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  name: string
  body: string | undefined
  projectId: string
  listId?: string
}

export default class CreateTaskValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string(),
    body: schema.string.optional(),
    projectId: schema.string({}, [rules.uuid({ version: 4 })]),
    listId: schema.string.optional({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateCreateTask = async (request) => {
  const payload: PayloadProps = await request.validate(CreateTaskValidator)

  //Check if project exists
  const project = await Project.find(payload.projectId)
  if (!project) {
    throw new Exception('Project not found', 404)
  }

  //Check if list exists
  if (payload.listId) {
    const list = await List.find(payload.listId)
    if (!list) {
      throw new Exception('List not found.', 404)
    }
  }

  //Return payload and project
  return { payload, project }
}
