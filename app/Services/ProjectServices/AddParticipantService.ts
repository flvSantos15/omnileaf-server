import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogAttached } from 'App/Helpers/CustomLogs'
import Project from 'App/Models/Project'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    userId: string
    label?: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class AddParticipantService {
  private async _treatUserExceptions({ userId, project }: { userId: string; project: Project }) {
    const user = await User.find(userId)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    // Check if user is an organization member
    await project.load('organization')

    await project.organization.load('members')

    if (!project.organization.members.map((member) => member.id).includes(userId)) {
      throw new Exception('User is not a member of project Organization.', 400)
    }

    //Check if user is already assigned
    await user.load('assignedProjects')

    if (user.assignedProjects.map((proj) => proj.id).includes(project.id)) {
      throw new Exception('User is already assigned to project.', 409)
    }
  }

  public async execute({ id, payload, bouncer }: Irequest): Promise<void> {
    const { userId } = payload

    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists.', 404)
    }

    await this._treatUserExceptions({ userId, project })

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').attach([userId])

    LogAttached()
  }
}
