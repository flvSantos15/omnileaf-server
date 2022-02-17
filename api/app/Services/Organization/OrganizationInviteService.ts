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
  ListUserInvitesRequest,
} from 'App/Interfaces/Organization/organization-invites-service'
import Label from 'App/Models/Label'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import WelcomeToOrganizationMail from 'App/Mailers/WelcomeToOrganizationMail'
import Database from '@ioc:Adonis/Lucid/Database'

class OrganizationInviteService {
  public async create({ id, payload, bouncer }: InviteUserRequest) {
    const { email, labelIds } = payload

    const [organization, user] = await Promise.all([
      Organization.find(id),
      User.findBy('email', email),
    ])

    /**
     *
     * Guard
     */
    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    const invite = await OrganizationInvite.query()
      .where('organizationId', id)
      .andWhere('userEmail', email)
      .andWhere('status', OrganizationInviteStatus.IN_PROGRESS)
      .first()

    if (!types.isNull(invite)) {
      throw new Exception('User is already invited', 400)
    }

    if (user) {
      await user.load('organizations')
      if (user.organizations.map((org) => org.id).includes(id)) {
        throw new Exception('User is already a member', 400)
      }
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
      userEmail: email,
      organizationId: id,
      labelsString: labelIds.join(';'),
    })

    await new InviteToOrganizationMail(email, organization.name).send()
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
      .andWhere('userEmail', user.email)
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
      .andWhere('userEmail', user.email)
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
     * Handle
     */
    await invite.merge({ status: OrganizationInviteStatus.DENIED }).save()
  }

  public async listUserInvites({ auth }: ListUserInvitesRequest) {
    const user = auth.use('web').user!

    /**
     *
     * Handle
     */
    const invites = await Database.from((subquery) => {
      subquery
        .from(`${OrganizationInvite.table}`)
        .where(`${OrganizationInvite.table}.user_email`, user.email)
        .andWhere(`${OrganizationInvite.table}.status`, OrganizationInviteStatus.IN_PROGRESS)
        .join(`${User.table}`, `${OrganizationInvite.table}.user_email`, '=', `${User.table}.email`)
        .join(
          `${Organization.table}`,
          `${OrganizationInvite.table}.organization_id`,
          '=',
          `${Organization.table}.id`
        )
        .select(
          Database.raw(
            `${OrganizationInvite.table}.created_at,
          ${OrganizationInvite.table}.status,
          ${Organization.table}.name as organization,
          ${Organization.table}.avatar_url
          `
          )
        )
        .as('subquery')
    }).select({
      avatarUrl: 'avatar_url',
      organization: 'organization',
      status: 'status',
      createdAt: 'created_at',
    })

    return invites
  }
}

export default new OrganizationInviteService()
