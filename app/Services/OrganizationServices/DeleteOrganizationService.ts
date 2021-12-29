import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogDeleted } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

interface Irequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export default class DeleteOrganizationService {
  public async execute({ id, bouncer }: Irequest): Promise<void> {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationCreator', organization)

    LogDeleted(organization)

    await organization.delete()
  }
}
