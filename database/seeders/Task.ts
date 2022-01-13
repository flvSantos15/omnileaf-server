import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Task from 'App/Models/Task'
import { defaultId, dummyTask } from 'Database/seeders-constants'

export default class TaskSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const task = await Task.find(dummyTask.id)
    if (task) return

    const newTask = await Task.create(dummyTask)

    await newTask.related('usersAssigned').attach([defaultId])

    await Task.createMany([
      {
        name: 'Develop project',
        projectId: defaultId,
      },
      {
        name: 'Finish project',
        projectId: defaultId,
      },
    ])
  }
}
