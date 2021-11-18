import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogCreated } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'

interface Irequest {
  user: User
  payload: {
    name: string
    description: string | undefined
    organizationId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class CreateProjectService {
  public async execute({ user, payload, bouncer }: Irequest): Promise<Project> {
    const { organizationId } = payload

    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization Id does not exists.', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    const project = await Project.create({ ...payload, creatorId: user.id })

    LogCreated(project)

    await project.related('usersAssigned').attach({ [user.id]: { role: ProjectRoles.MANAGER } })

    return project
  }
}
