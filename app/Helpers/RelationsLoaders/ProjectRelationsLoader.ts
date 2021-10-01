import Project from 'App/Models/Project'

export const LoadProjectRelations = async (id: string, queryString: Record<string, any>) => {
  const project = await Project.findOrFail(id)

  await project.load('organization')

  await project.load('owner')

  await project.load('userInCharge')

  const { usersAssigned, boards, tags, tasks, lists } = queryString

  if (usersAssigned) await project.load('usersAssigned')

  if (boards) await project.load('boards')

  if (lists) await project.load('lists')

  if (tasks) await project.load('tasks')

  if (tags) await project.load('tags')

  return project
}