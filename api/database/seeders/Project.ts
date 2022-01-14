import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Project from 'App/Models/Project'
import { defaultId, dummyProject } from 'Database/seeders-constants'

export default class ProjectSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const project = await Project.find(dummyProject.id)
    if (project) return

    const newProject = await Project.create(dummyProject)

    await newProject.related('usersAssigned').attach({ [defaultId]: { role: 'PM' } })

    await Project.createMany([
      {
        name: 'Omni Project',
        creatorId: defaultId,
        organizationId: defaultId,
      },
      {
        name: 'Project Omni',
        creatorId: defaultId,
        organizationId: defaultId,
      },
    ])
  }
}
