import { Exception } from '@adonisjs/core/build/standalone'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { IGitlabProject } from 'App/Interfaces/Gitlab/gitlab-project.interface'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import GitlabBaseService from './GitabBaseService'

export interface ImportProjectRequest {
  project: IGitlabProject
  organizationId: string
}

export interface ImportOrganizationRequest {
  payload: {
    organizationId: string
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface ImportUserRequest {
  payload: {
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  user?: User
  bouncer: ActionsAuthorizerContract<User>
}

class GitlabIntegrationService extends GitlabBaseService {
  public async importOrganization({ payload, bouncer }: ImportOrganizationRequest): Promise<void> {
    const { organizationId, gitlabId, token } = payload

    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await bouncer.authorize('OrganizationCreator', organization)

    await organization.merge({ gitlabId }).save()

    await GitlabToken.create({
      ownerId: organization!.creatorId,
      organizationId,
      token: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      createdTime: token.created_at,
    })
  }

  public async importProject(payload: ImportProjectRequest): Promise<void> {
    const { project, organizationId } = payload

    const projectExists = await Project.findBy('gitlabId', project.id)

    if (projectExists) throw new Exception('Project is already imported', 409)

    const newProject = await Project.create({
      name: project.name,
      description: project.description ? project.description : '',
      gitlabAvatarUrl: project.avatar_url ? project.avatar_url : '',
      gitlabId: project.id,
      gitlabCreatorId: project.creator_id,
      organizationId,
    })

    await this.updateProject(newProject)
  }

  public async updateProject(project: Project): Promise<void> {
    if (!project) return
    if (!project.gitlabId) return

    const token = await this.getOrgToken(project.organizationId)

    const users = await this.getProjectUsers({ id: project.gitlabId, token })
    const tasks = await this.getProjectTasks({ id: project.gitlabId, token })

    await this.updateProjectUsers({ project, users })
    await this.updateProjectTasks({ project, tasks })
  }

  public async importUser({ payload, user, bouncer }: ImportUserRequest): Promise<void> {
    const { gitlabId, token } = payload

    if (!user) {
      throw new Exception('User not found', 404)
    }

    await bouncer.authorize('OwnUser', user.id)

    await user.merge({ gitlabId }).save()

    await GitlabToken.create({
      ownerId: user.id,
      token: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      createdTime: token.created_at,
    })
  }

  public async updateUser(user?: User): Promise<void> {
    if (!user) {
      throw new Exception('User not found.', 404)
    }

    const token = await this.getUserToken(user)

    const userGitlabOrganizations = await this.getUserOrganizations({ token })

    //Update Organizations
    userGitlabOrganizations.forEach(async (org) => {
      const organization = await Organization.findBy('gitlabId', org.id)

      if (!organization) return

      await organization.load('members')

      if (organization.members.map((member) => member.id).includes(user.id)) return

      await organization.related('members').attach([user.id])
    })

    // Update Projects
    const userGitlabProjects = await this.getUserProjects({ token })

    userGitlabProjects.forEach(async (pr) => {
      const project = await Project.findBy('gitlabId', pr.id)

      if (!project) return

      await project.load('usersAssigned')

      if (project.usersAssigned.map((u) => u.id).includes(user.id)) return

      const userAccessLevel = pr.permissions!.project_access
        ? pr.permissions!.project_access.access_level
        : pr.permissions!.group_access!.access_level

      const role = this.getUserRole(userAccessLevel)

      await project.related('usersAssigned').attach({ [user.id]: { role } })

      const tasks = await this.getProjectTasks({ id: project.gitlabId, token })

      await this.updateProjectTasks({ project, tasks })
    })
  }
}

export default new GitlabIntegrationService()
