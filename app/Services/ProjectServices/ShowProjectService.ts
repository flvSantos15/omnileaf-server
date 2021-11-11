import { Exception } from '@poppinss/utils'
import Project from 'App/Models/Project'

export default class ShowProjectService {
  public async execute({ id }: { id: string }): Promise<Project> {
    const project = await Project.find(id)

    if (!project) {
      throw new Exception('Project Id does not exists.', 404)
    }

    return project
  }
}
