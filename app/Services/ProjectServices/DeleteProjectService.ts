import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogDeleted } from 'App/Helpers/CustomLogs'
import Project from 'App/Models/Project'
import User from 'App/Models/User'

interface Irequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export default class DeleteProjectService {
  public async execute({ id, bouncer }: Irequest): Promise<void> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists.', 404)
    }

    await bouncer.authorize('ProjectCreator', project)

    LogDeleted(project)

    await project.delete()
  }
}
