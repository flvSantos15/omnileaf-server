import List from 'App/Models/List'

type QueryStringProps = {
  tasks: string
}

export const LoadListRelations = async (
  id: string,
  queryString: Record<string, any>
): Promise<List> => {
  const list = await List.findOrFail(id)

  await list.load('creator')

  await list.load('board')

  const { tasks } = queryString as unknown as QueryStringProps

  if (tasks) await list.load('tasks')

  return list
}
