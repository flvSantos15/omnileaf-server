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
          tasks: [] as any[],
        }

        projectSessions.map((session) => {
          const taskIndex = newArrayItem.tasks
            .map((task: any) => task.taskId)
            .indexOf(session.taskId)

          const taskIsNotInNewItemArray = taskIndex < 0

          if (taskIsNotInNewItemArray) {
            const newTasksArrayItem = {
              taskId: session.taskId,
              taskName: session.task.name,
              tracked: session.trackingTime,
            }
            newArrayItem.tasks.push(newTasksArrayItem)
            return
          }

          newArrayItem.tasks[taskIndex].tracked += session.trackingTime
        })

        projAcc.projects.push(newArrayItem)

        return projAcc
      },
      { totalTracked: 0, projects: [] }
    )
  }
}
