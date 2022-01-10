import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import CreateProjectValidator from 'App/Validators/Project/CreateProjectValidator'
import UpdateProjectValidator from 'App/Validators/Project/UpdateProjectValidator'
import AddParticipantValidator from 'App/Validators/Project/AddParticipantValidator'
import RemoveParticipantValidator from 'App/Validators/Project/RemoveParticipantValidator'
import ProjectService from 'App/Services/Project/ProjectService'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ProjectsController {
  public async list({ response }: HttpContextContract) {
    const projects = await ProjectService.getAll()

    Logger.info('Projects list retrieved succesfully')

    response.send(projects)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const project = await ProjectService.getOne({ id })

    Logger.info('Project retrieved succesfully')

    response.send(project)
  }

  public async create({ request, response, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateProjectValidator)

    const project = await ProjectService.register({ user, payload, bouncer })

    Logger.info('Project created succesfully')

    response.status(201).send(project)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateProjectValidator)

    const project = await ProjectService.update({ id, payload, bouncer })

    Logger.info('Project updated succesfully')

    response.send(project)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    await ProjectService.delete({ id, bouncer })

    Logger.info('Project deleted succesfully')

    response.status(204)
  }

  public async addParticipant({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(AddParticipantValidator)

    await ProjectService.addParticipant({ id, payload, bouncer })

    Logger.info('User added to project succesfully')

    response.status(204)
  }

  public async removeParticipant({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(RemoveParticipantValidator)

    await ProjectService.removeParticipant({ id, payload, bouncer })

    Logger.info('User removed from project succesfully')

    response.status(204)
  }
}
