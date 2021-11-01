import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LoadProjectRelations } from 'App/Helpers/RelationsLoaders/ProjectRelationsLoader'
import {
  LogAttached,
  LogCreated,
  LogDeleted,
  LogDettached,
  LogList,
  LogUpdated,
} from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import { ValidateAddParticipant } from 'App/Validators/Project/AddParticipantValidator'
import { CreateProjectValidator } from 'App/Validators/Project/CreateProjectValidator'
import { ValidateRemoveParticipant } from 'App/Validators/Project/RemoveParticipantValidator'
import { ValidateUpdateProject } from 'App/Validators/Project/UpdateProjectValidator'
import { ProjectRoles } from 'Contracts/enums'

export default class ProjectsController {
  public async list({ response }: HttpContextContract) {
    const projects = await Project.all()

    LogList(projects)

    response.send(projects)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const project = await LoadProjectRelations(id, request.qs())

    response.send(project)
  }

  public async create({ request, response, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateProjectValidator)

    const organization = await Organization.findOrFail(payload.organizationId)

    await bouncer.authorize('OrganizationManager', organization)

    const project = await Project.create({ ...payload, creatorId: user.id })

    LogCreated(project)

    await project.related('usersAssigned').attach({
      [user.id]: {
        user_role: ProjectRoles.MANAGER,
      },
    })

    LogAttached()

    response.status(201).send(project)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await ValidateUpdateProject(request)

    const project = await Project.findOrFail(id)

    await bouncer.authorize('ProjectManager', project)

    await project.merge(payload).save()

    LogUpdated(project)

    response.send(project)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const project = await Project.findOrFail(id)

    await bouncer.authorize('ProjectCreator', project)

    await project.related('usersAssigned').detach()

    LogDeleted(project)

    await project.delete()

    response.status(204)
  }

  public async addParticipant({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const project = await Project.findOrFail(id)

    const { userId, userRole } = await ValidateAddParticipant(request, project)

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').attach({
      [userId]: {
        user_role: userRole,
      },
    })

    LogAttached()

    response.status(204)
  }

  public async removeParticipant({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const project = await Project.findOrFail(id)

    const { userId } = await ValidateRemoveParticipant(request, project)

    await bouncer.authorize('ProjectManager', project)

    await project.related('usersAssigned').detach([userId])

    LogDettached()

    response.status(204)
  }
}
