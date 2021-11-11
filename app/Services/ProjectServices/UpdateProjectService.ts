import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogUpdated } from 'App/Helpers/CustomLogs'
import Project from 'App/Models/Project'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    name: string | undefined
    description: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class UpdateProjectService {
  public async execute({ id, payload, bouncer }: Irequest): Promise<Project> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.merge(payload).save()

    LogUpdated(project)

    return project
  }
}
