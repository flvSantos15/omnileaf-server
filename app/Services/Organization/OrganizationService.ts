import { Exception } from '@adonisjs/core/build/standalone'
import {
  CreateOrganizationRequest,
  DeleteOrganizationRequest,
  RemoveMemberRequest,
  UpdateOrganizationRequest,
} from 'App/Interfaces/Organization/organization-service'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

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

  public async register({ user, payload }: CreateOrganizationRequest): Promise<Organization> {
    const organization = await Organization.create({ ...payload, creatorId: user.id })

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

  public async removeMember({ id, payload, bouncer }: RemoveMemberRequest): Promise<void> {
    const { userId } = payload

    const [organization, user] = await Promise.all([Organization.find(id), User.find(userId)])

    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    if (!user) {
      throw new Exception('User not found', 404)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await this._dettachUserFromProjects(user, organization)

    await organization.related('members').detach([userId])
  }

  private async _dettachUserFromProjects(user: User, organization: Organization) {
    const projects = (await User.query()
      .where('id', user.id)
      .preload('assignedProjects', (query) => {
        query.where('organizationId', organization.id)
      })
      .first())!.assignedProjects

    await user.related('assignedProjects').detach(projects.map((project) => project.id))
  }
}

export default new OrganizationService()
