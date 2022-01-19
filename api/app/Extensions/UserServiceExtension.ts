import Project from 'App/Models/Project'

export default class UserServiceExtension {
  protected async _summarizeProjectsDailyTrack(projects: Project[]) {
    const projectsDailySessions = projects.reduce((projAcc: any[], currProj) => {
      const currProjHasTasks = currProj.tasks.length > 0

      if (currProjHasTasks) {
        const tasksTrackingSessions = currProj.tasks.reduce((taskAcc: any[], currTask) => {
          const currTaskHasSession = currTask.trackingSessions.length > 0

          if (currTaskHasSession) {
            taskAcc = [...taskAcc, ...currTask.trackingSessions]
          }

          return taskAcc
        }, [])

        projAcc = [...projAcc, ...tasksTrackingSessions]
      }

      return projAcc
    }, [])

    return projects.reduce(
      (projAcc: any, currProj) => {
        const projectSessions = projectsDailySessions.filter(
          (session) => session.projectId === currProj.id
        )

        projAcc.totalTracked += projectSessions.reduce((acc, curr) => {
          return acc + curr.trackingTime
        }, 0)

        const newArrayItem = {
          projectId: currProj.id,
          projectName: currProj.name,
          tracked: projectSessions.reduce((acc, curr) => {
            return acc + curr.trackingTime
          }, 0),
          tasks: [
            ...currProj.tasks.map((task) => {
              return { taskId: task.id, taskName: task.name, tracked: 0 }
            }),
          ] as any[],
        }

        projectSessions.forEach((session) => {
          const taskIndex = newArrayItem.tasks
            .map((task: any) => task.taskId)
            .indexOf(session.taskId)

          const taskIsInNewItemArray = taskIndex >= 0

          if (taskIsInNewItemArray) {
            newArrayItem.tasks[taskIndex].tracked += session.trackingTime
          }
        })

        projAcc.projects.push(newArrayItem)

        return projAcc
      },
      { totalTracked: 0, projects: [] }
    )
  }
}
