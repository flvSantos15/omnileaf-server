import { Exception } from '@adonisjs/core/build/standalone'
import { types } from '@ioc:Adonis/Core/Helpers'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'
import OrganizationInvite from 'App/Models/OrganizationInvite'
import InviteToOrganizationMail from 'App/Mailers/InviteToOrganizationMail'
import {
  AddMemberLabelsProps,
  AnswerInviteRequest,
  AttachMemberToProjectsProps,
  InviteUserRequest,
  ListUserInvitesRequest,
} from 'App/Interfaces/Organization/organization-invites-service'
import Label from 'App/Models/Label'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import WelcomeToOrganizationMail from 'App/Mailers/WelcomeToOrganizationMail'
import Database from '@ioc:Adonis/Lucid/Database'
import Project from 'App/Models/Project'
import { OrganizationLabels, ProjectRoles } from 'Contracts/enums'

class OrganizationInviteService {
  public async create({ id, payload, bouncer }: InviteUserRequest) {
    const { email, labelIds, projectIds } = payload

    const [organization, user] = await Promise.all([
      Organization.find(id),
      User.findBy('email', email),
    ])

    /**
     *
     * Guard
     */
    await bouncer.authorize('OrganizationManager', organization!)

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

    await this._labelsExistsGuard(labelIds, organization.id)

    await this._duplicatedRoleGuard(labelIds)

    await this._ownerLabelGuard(labelIds)

    if (projectIds) {
      await this._projectExistsGuard(projectIds, organization.id)
    }

    if (user) {
      await this._userIsMemberGuard(user, organization.id)
    }

    /**
     *
     * Handle
     */
    await OrganizationInvite.create({
      userEmail: email,
      organizationId: id,
      labelsString: labelIds.join(';'),
      projectsString: projectIds?.join(';'),
    })

    await new InviteToOrganizationMail(email, organization.name).send()
  }

  private async _userIsMemberGuard(user: User, organizationId: string) {
    await user.load('organizations')
    if (user.organizations.map((org) => org.id).includes(organizationId)) {
      throw new Exception('User is already a member', 400)
    }
  }

  private async _labelsExistsGuard(labelIds: string[], organizationId: string) {
    for await (let id of labelIds) {
      let label = await Label.query()
        .where('id', id)
        .andWhere('organizationId', organizationId)
        .first()

      if (!label) {
        throw new Exception(`Label ${id} not found`, 404)
      }
    }
  }

  private async _duplicatedRoleGuard(labelIds: string[]) {
    const labels = (await Promise.all(labelIds.map((id) => Label.findOrFail(id)))).map(
      (label) => label.title
    )

    const labelsFound = labels.filter((label) => Object.values(OrganizationLabels).includes(label))

    if (labelsFound.length > 1) {
      throw new Exception('Duplicated organization roles', 400)
    }
  }

  private async _ownerLabelGuard(labelIds: string[]) {
    const labels = (await Promise.all(labelIds.map((id) => Label.findOrFail(id)))).map(
      (label) => label.title
    )

    if (labels.includes(OrganizationLabels.OWNER)) {
      throw new Exception('Can not invite a member to be organization owner', 400)
    }
  }

  private async _projectExistsGuard(projectIds: string[], organizationId: string) {
    for await (let id of projectIds) {
      let project = await Project.query()
        .where('id', id)
        .andWhere('organizationId', organizationId)
        .first()

      if (!project) {
        throw new Exception(`Project ${id} not found`, 404)
      }
    }
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

    await this._attachMemberToProjects({
      user,
      projectIds: invite.projects,
      labelIds: invite.labels,
    })

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

  private async _attachMemberToProjects({
    user,
    projectIds,
    labelIds,
  }: AttachMemberToProjectsProps) {
    const role = await this._getProjectRole(labelIds)

    for await (let projectId of projectIds) {
      const project = await Project.findOrFail(projectId)

      await project.related('usersAssigned').attach({
        [user.id]: {
          role,
        },
      })
    }
  }

  private async _getProjectRole(labelIds: string[]) {
    let orgRole: string = ''

    for await (let labelId of labelIds) {
      const label = await Label.findOrFail(labelId)

      if (Object.values(OrganizationLabels).includes(label.title)) {
        orgRole = label.title
      }
    }

    const managerRoles = [
      OrganizationLabels.ORGANIZATION_MANAGER,
      OrganizationLabels.PROJECT_MANAGER,
    ]

    if (managerRoles.some((role) => orgRole === role)) {
      return ProjectRoles.MANAGER
    } else if (orgRole === OrganizationLabels.USER) {
      return ProjectRoles.USER
    } else {
      return ProjectRoles.VIEWER
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
