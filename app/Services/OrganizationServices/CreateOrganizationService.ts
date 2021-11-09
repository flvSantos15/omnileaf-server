import { LogCreated } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import { OrganizationRoles } from 'Contracts/enums'

interface Irequest {
  user: User
  payload: { name: string; avatar_url: string | undefined; description: string | undefined }
}

export default class CreateOrganizationService {
  public async execute({ user, payload }: Irequest): Promise<Organization> {
    const organization = await Organization.create({ ...payload, creatorId: user.id })

    await organization.related('members').attach({
      [user.id]: {
        member_role: OrganizationRoles.MANAGER,
      },
    })

    LogCreated(organization)

    return organization
  }
}
