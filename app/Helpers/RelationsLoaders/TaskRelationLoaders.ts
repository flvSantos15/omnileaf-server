import Task from 'App/Models/Task'

type QueryStringProps = {
  list: string
  usersAssigned: string
  screenshots: string
  tags: string
}

export const LoadTaskRelations = async (
  id: string,
  queryString: Record<string, any>
): Promise<Task> => {
  const task = await Task.findOrFail(id)

  await task.load('creator')

  await task.load('project')

  const { list, usersAssigned, screenshots, tags } = queryString as unknown as QueryStringProps

  if (list) await task.load('list')

  if (usersAssigned) await task.load('usersAssigned')

  if (screenshots) await task.load('screenshots')

  if (tags) await task.load('tags')

  return task
}
