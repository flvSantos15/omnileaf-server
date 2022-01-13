import { Exception } from '@adonisjs/core/build/standalone'
import {
  AddMemberLabelsProps,
  AddMemberRequest,
  CreateOrganizationRequest,
  DeleteOrganizationRequest,
  RemoveMemberRequest,
  UpdateOrganizationRequest,
} from 'App/Interfaces/Organization/organization-service'
import Label from 'App/Models/Label'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import { OrganizationLabels } from 'Contracts/enums'

class OrganizationService {
  public async getAll(): Promise<Organization[]> {
    const organizations = await Organization.all()

    return organizations
  }

  public async getOne(id: string): Promise<Organization> {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists.', 404)
    }

    return organization
  }

  private async _getUserOrganizationRelationId({ user, orgId }: { user: User; orgId: string }) {
    await user.load('organizationRelations')

    const [relationId] = await Promise.all(
      user.organizationRelations
        .filter((relation) => relation.organizationId === orgId)
        .map((relation) => relation.id)
    )

    return relationId
  }

  private async _createOrganizationLabels({
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

  public async register({ user, payload }: CreateOrganizationRequest): Promise<Organization> {
    const organization = await Organization.create({ ...payload, creatorId: user.id })

    await organization.related('members').attach([user.id])

    const relationId = await this._getUserOrganizationRelationId({ user, orgId: organization.id })

    //Create default labels to organization
    await this._createOrganizationLabels({ orgId: organization.id, relationId })

    return organization
  }

  public async update({ id, payload, bouncer }: UpdateOrganizationRequest): Promise<Organization> {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.merge(payload).save()

    return organization
  }

  public async delete({ id, bouncer }: DeleteOrganizationRequest): Promise<void> {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationCreator', organization)

    await organization.delete()
  }

  private async _addMemberLabels({ user, labelIds }: AddMemberLabelsProps) {
    const labelsFound: Label[] = []

    // Check if there's unexistent labels on array.
    labelIds.forEach(async (id) => {
      let existingLabel = await Label.find(id)

      if (!existingLabel) {
        throw new Exception('Unable to add labels: There are non existent labels on array.', 400)
      }

      labelsFound.push(existingLabel)
    })

    await user.load('organizationRelations')

    labelsFound.forEach(async (label) => {
      const [orgRelation] = user!.organizationRelations.filter(
        (relation) => relation.organizationId === label.organizationId
      )

      if (!orgRelation) {
        throw new Exception('Could not find Organization relation for that user.', 404)
      }

      label.related('organizationUser').attach([orgRelation.id])
    })
  }

  public async addMember({ id, payload, bouncer }: AddMemberRequest): Promise<void> {
    const { userId, labelIds } = payload

    const organization = await Organization.find(id)
    const user = await User.find(userId)

    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    if (!user) {
      throw new Exception('User not found', 404)
    }

    await user.load('organizations')
    if (user.organizations.map((org) => org.id).includes(id)) {
      throw new Exception('User is already a member', 400)
    }

    await bouncer.authorize('OrganizationManager', organization!)

    organization!.related('members').attach([userId])

    await this._addMemberLabels({ user, labelIds })
  }

  public async removeMember({ id, payload, bouncer }: RemoveMemberRequest): Promise<void> {
    const { userId } = payload

    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.related('members').detach([userId])
  }
}

export default new OrganizationService()
