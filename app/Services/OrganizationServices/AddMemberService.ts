import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogAttached } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import { OrganizationRoles } from 'Contracts/enums'

interface Irequest {
  id: string
  payload: {
    userId: string
    memberRole: OrganizationRoles
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class AddMemberService {
  private async treatExceptions({
    id,
    user,
    organization,
  }: {
    id: string
    user: User | null
    organization: Organization | null
  }) {
    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    if (!user) {
      throw new Exception('User Id does not exists', 404)
    }

    await user.load('organizations')
    if (user.organizations.map((org) => org.id).includes(id)) {
      throw new Exception('User is already a member', 409)
    }
  }

  public async execute({ id, payload, bouncer }: Irequest): Promise<void> {
    const { userId, memberRole } = payload

    const organization = await Organization.find(id)
    const user = await User.find(userId)

    await this.treatExceptions({ id, user, organization })

    await bouncer.authorize('OrganizationManager', organization!)

    organization!.related('members').attach({
      [userId]: {
        member_role: memberRole,
      },
    })

    LogAttached()
  }
}
