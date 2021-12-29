import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogDettached } from 'App/Helpers/CustomLogs'
import Project from 'App/Models/Project'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    userId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class RemoveParticipantServer {
  public async execute({ id, payload, bouncer }: Irequest): Promise<void> {
    const { userId } = payload

    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').detach([userId])

    LogDettached()
  }
}
