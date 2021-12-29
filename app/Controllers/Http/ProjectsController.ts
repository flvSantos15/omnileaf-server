import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import ListProjectsService from 'App/Services/ProjectServices/ListProjectsService'
import ShowProjectService from 'App/Services/ProjectServices/ShowProjectService'
import CreateProjectService from 'App/Services/ProjectServices/CreateProjectService'
import CreateProjectValidator from 'App/Validators/Project/CreateProjectValidator'
import UpdateProjectService from 'App/Services/ProjectServices/UpdateProjectService'
import UpdateProjectValidator from 'App/Validators/Project/UpdateProjectValidator'
import DeleteProjectService from 'App/Services/ProjectServices/DeleteProjectService'
import AddParticipantService from 'App/Services/ProjectServices/AddParticipantService'
import AddParticipantValidator from 'App/Validators/Project/AddParticipantValidator'
import RemoveParticipantService from 'App/Services/ProjectServices/RemoveParticipantService'
import RemoveParticipantValidator from 'App/Validators/Project/RemoveParticipantValidator'

export default class ProjectsController {
  public async list({ response }: HttpContextContract) {
    const listProjects = new ListProjectsService()

    const projects = await listProjects.execute()

    response.send(projects)
  }

  public async show({ request, response }: HttpContextContract) {
    const showProject = new ShowProjectService()

    const id = validateIdParam(request.param('id'))

    const project = await showProject.execute({ id })

    response.send(project)
  }

  public async create({ request, response, auth, bouncer }: HttpContextContract) {
    const createProject = new CreateProjectService()

    const user = auth.use('web').user!

    const payload = await request.validate(CreateProjectValidator)

    const project = await createProject.execute({ user, payload, bouncer })

    response.status(201).send(project)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const updateProject = new UpdateProjectService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateProjectValidator)

    const project = await updateProject.execute({ id, payload, bouncer })

    response.send(project)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const deleteProject = new DeleteProjectService()

    const id = validateIdParam(request.param('id'))

    await deleteProject.execute({ id, bouncer })

    response.status(204)
  }

  public async addParticipant({ request, response, bouncer }: HttpContextContract) {
    const addParticipantService = new AddParticipantService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(AddParticipantValidator)

    await addParticipantService.execute({ id, payload, bouncer })

    response.status(204)
  }

  public async removeParticipant({ request, response, bouncer }: HttpContextContract) {
    const removeParticipantService = new RemoveParticipantService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(RemoveParticipantValidator)

    await removeParticipantService.execute({ id, payload, bouncer })

    response.status(204)
  }
}
