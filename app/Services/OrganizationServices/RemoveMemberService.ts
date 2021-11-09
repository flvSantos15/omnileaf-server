import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    userId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class RemoveMemberService {
  public async execute({ id, payload, bouncer }: Irequest): Promise<void> {
    const { userId } = payload

    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.related('members').detach([userId])
  }
}