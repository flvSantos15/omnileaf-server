import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ProjectRoles } from 'Contracts/enums'
import User from 'App/Models/User'
import { Exception } from '@poppinss/utils'
import Project from 'App/Models/Project'

type PayloadProps = {
  userId: string
  userRole: ProjectRoles
}

class AddParticipantValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
    userRole: schema.enum(Object.values(ProjectRoles)),
  })
}

export const ValidateAddParticipant = async (request, project: Project): Promise<PayloadProps> => {
  const payload = await request.validate(AddParticipantValidator)
  const { userId } = payload
  const user = await User.find(userId)
  if (!user) throw new Exception('User not found', 404)
  await user.load('assignedProjects')
  if (user.assignedProjects.map((prj) => prj.id).includes(project.id)) {
    throw new Exception('User is already assigned to project', 409)
  }
  return payload
}
