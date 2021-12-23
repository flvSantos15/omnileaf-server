import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import Organization from 'App/Models/Organization'
import GitlabIntegrationService from 'App/Services/GitlabIntegrationServices/GitlabIntegrationService'

export default class GitlabIntegrationCronJob extends BaseTask {
  public static get schedule() {
    return '*/5 * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    const organizations = await Organization.query().whereNotNull('gitlabId')
    organizations.forEach(async (organization) => {
      await organization.load('projects')
      organization.projects.forEach((project) => {
        GitlabIntegrationService.updateProject(project)
      })
      Logger.info(`Gitlab projects of ${organization.name} organization updated succesfully.`)
    })
  }
}
