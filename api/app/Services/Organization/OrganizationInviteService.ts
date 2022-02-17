import { Exception } from '@adonisjs/core/build/standalone'
import { types } from '@ioc:Adonis/Core/Helpers'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import OrganizationInvite from 'App/Models/OrganizationInvite'
import InviteToOrganizationMail from 'App/Mailers/InviteToOrganizationMail'
import {
  AddMemberLabelsProps,
  AnswerInviteRequest,
  InviteUserRequest,
} from 'App/Interfaces/Organization/organization-invites-service'
import Label from 'App/Models/Label'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import WelcomeToOrganizationMail from 'App/Mailers/WelcomeToOrganizationMail'

class OrganizationInviteService {
  public async inviteUser({ id, payload, bouncer }: InviteUserRequest) {
    const { userId, labelIds } = payload

    const [organization, user] = await Promise.all([Organization.find(id), User.find(userId)])

    /**
     *
     * Guard
     */
    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const invite = await OrganizationInvite.query()
      .where('organizationId', id)
      .andWhere('userId', user.id)
      .andWhere('status', OrganizationInviteStatus.IN_PROGRESS)
      .first()

    if (!types.isNull(invite)) {
      throw new Exception('User is already invited', 400)
    }

    await user.load('organizations')
    if (user.organizations.map((org) => org.id).includes(id)) {
      throw new Exception('User is already a member', 400)
    }

    for await (let labelId of labelIds) {
      let label = await Label.find(labelId)

      if (!label) {
        throw new Exception(`Label ${labelId} not found`, 404)
      }
    }

    await bouncer.authorize('OrganizationManager', organization!)

    /**
     *
     * Handle
     */
    await OrganizationInvite.create({
      userId,
      organizationId: id,
      labelsString: labelIds.join(';'),
    })

    await new InviteToOrganizationMail(user.email, organization.name).send()
  }

  public async accept({ id, auth }: AnswerInviteRequest) {
    const user = auth.use('web').user!

    const organization = await Organization.find(id)

    /**
     *
     * Guard
     */
    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    const invite = await OrganizationInvite.query()
      .where('organizationId', id)
      .andWhere('userId', user.id)
      .andWhere('status', OrganizationInviteStatus.IN_PROGRESS)
      .first()

    if (!invite) {
      throw new Exception('Organization Invite not found', 404)
    }

    /**
     *
     * Handle
     */
    await organization.related('members').attach([user.id])

    await this._addMemberLabels({ user, labelIds: invite.labels })

    await invite.merge({ status: OrganizationInviteStatus.ACCEPTED }).save()

    await new WelcomeToOrganizationMail(user.email, organization.name).send()
  }

  private async _addMemberLabels({ user, labelIds }: AddMemberLabelsProps) {
    await user.load('organizationRelations')

    for await (let labelId of labelIds) {
      const label = await Label.find(labelId)

      const [orgRelation] = user!.organizationRelations.filter(
        (relation) => relation.organizationId === label!.organizationId
      )

      label!.related('organizationUser').attach([orgRelation.id])
    }
  }

  public async denie({ id, auth }: AnswerInviteRequest) {
    const user = auth.use('web').user!

    const organization = await Organization.find(id)

    /**
     *
     * Guard
     */
    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    const invite = await OrganizationInvite.query()
      .where('organizationId', id)
      .andWhere('userId', user.id)
      .andWhere('status', OrganizationInviteStatus.IN_PROGRESS)
      .first()

    if (!invite) {
      throw new Exception('Organization Invite not found', 404)
    }

    if (invite.status !== OrganizationInviteStatus.IN_PROGRESS) {
      throw new Exception('This invite has already been answered', 400)
    }

    /**
     *
     * Hanlde
     */
    await invite.merge({ status: OrganizationInviteStatus.DENIED }).save()
  }
}

export default new OrganizationInviteService()
