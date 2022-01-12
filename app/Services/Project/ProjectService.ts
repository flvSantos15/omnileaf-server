import { Exception } from '@adonisjs/core/build/standalone'
import {
  AddParticipantRequest,
  CreateProjectRequest,
  DeleteProjectRequest,
  RemoveParticipantRequest,
  UpdateProjectRequest,
} from 'App/Interfaces/Project/project-service.interfaces'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'

class ProjectService {
  public async getAll(): Promise<Project[]> {
    const projects = await Project.all()

    return projects
  }

  public async getOne({ id }: { id: string }): Promise<Project> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    return project
  }

  public async register({ user, payload, bouncer }: CreateProjectRequest): Promise<Project> {
    const { organizationId } = payload

    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    const project = await Project.create({ ...payload, creatorId: user.id })

    await project.related('usersAssigned').attach({ [user.id]: { role: ProjectRoles.MANAGER } })

    return project
  }

  public async update({ id, payload, bouncer }: UpdateProjectRequest): Promise<Project> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.merge(payload).save()

    return project
  }

  public async delete({ id, bouncer }: DeleteProjectRequest): Promise<void> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.merge({ isDeleted: true }).save()
  }

  public async addParticipant({ id, payload, bouncer }: AddParticipantRequest): Promise<void> {
    const { userId, role } = payload

    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    const user = await User.find(userId)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    // Check if user is an organization member
    await project.load('organization')

    await project.organization.load('members')

    if (!project.organization.members.map((member) => member.id).includes(userId)) {
      throw new Exception('User is not member of project Organization.', 400)
    }

    //Check if user is already assigned
    await user.load('assignedProjects')

    if (user.assignedProjects.map((proj) => proj.id).includes(project.id)) {
      throw new Exception('User is already assigned to project.', 400)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').attach({ [userId]: { role } })
  }

  public async removeParticipant({
    id,
    payload,
    bouncer,
  }: RemoveParticipantRequest): Promise<void> {
    const { userId } = payload

    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').detach([userId])
  }
}

export default new ProjectService()
