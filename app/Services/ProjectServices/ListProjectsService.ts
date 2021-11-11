import { LogList } from 'App/Helpers/CustomLogs'
import Project from 'App/Models/Project'

export default class ListProjectsService {
  public async execute(): Promise<Project[]> {
    const projects = await Project.all()

    LogList(projects)

    return projects
  }
}
