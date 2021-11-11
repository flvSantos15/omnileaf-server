import Label from 'App/Models/Label'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import { LogCreated } from 'App/Helpers/CustomLogs'
import { OrganizationLabels } from 'Contracts/enums'

interface Irequest {
  user: User
  payload: { name: string; avatar_url: string | undefined; description: string | undefined }
}

export default class CreateOrganizationService {
  private async createOrganizationLabels({
    relationId,
    orgId,
  }: {
    relationId: string
    orgId: string
  }) {
    await Promise.all(
      Object.values(OrganizationLabels).map(async (role) => {
        const label = await Label.create({ title: role, organizationId: orgId })

        if (role === 'A') {
          await label.related('organizationUser').attach([relationId])
        }
      })
    )
  }

  private async getUserOrganizationRelationId({ user, orgId }: { user: User; orgId: string }) {
    await user.load('organizationRelations')

    const [relationId] = await Promise.all(
      user.organizationRelations
        .filter((relation) => relation.organizationId === orgId)
        .map((relation) => relation.id)
    )

    return relationId
  }

  public async execute({ user, payload }: Irequest): Promise<Organization> {
    const organization = await Organization.create({ ...payload, creatorId: user.id })

    await organization.related('members').attach([user.id])

    const relationId = await this.getUserOrganizationRelationId({ user, orgId: organization.id })

    //Create default labels to organization
    await this.createOrganizationLabels({ orgId: organization.id, relationId })

    LogCreated(organization)

    return organization
  }
}
