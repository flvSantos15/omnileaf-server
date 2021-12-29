import User from 'App/Models/User'

type QueryStringProps = {
  ownedProjects: string
  assignedProjects: string
  ownedBoards: string
  ownedLists: string
  ownedTasks: string
  assignedTasks: string
  screenshots: string
  organizations: string
}

export const LoadUserRelations = async (id: string, queryString: Record<string, any>) => {
  const user = await User.findOrFail(id)

  await user.load('latestTrackingSession')

  const {
    ownedProjects,
    assignedProjects,
    ownedBoards,
    ownedLists,
    ownedTasks,
    assignedTasks,
    screenshots,
    organizations,
  } = queryString as unknown as QueryStringProps

  if (ownedProjects) await user.load('ownedProjects')

  if (assignedProjects) await user.load('assignedProjects')

  if (ownedBoards) await user.load('ownedBoards')

  if (ownedLists) await user.load('ownedLists')

  if (ownedTasks) await user.load('ownedTasks')

  if (assignedTasks) await user.load('assignedTasks')

  if (screenshots) await user.load('screenshots')

  if (organizations) await user.load('organizations')

  return user
}
