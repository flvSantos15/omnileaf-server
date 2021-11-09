import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogUpdated } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    name: string | undefined
    avatar_url: string | undefined
    description: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class UpdateOrganizationService {
  public async execute({ id, payload, bouncer }: Irequest) {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.merge(payload).save()

    LogUpdated(organization)

    return organization
  }
}
