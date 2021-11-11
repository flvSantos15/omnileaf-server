import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { Exception } from '@poppinss/utils'
import { LogAttached } from 'App/Helpers/CustomLogs'
import Label from 'App/Models/Label'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

interface Irequest {
  id: string
  payload: {
    userId: string
    labelIds: string[]
  }
  bouncer: ActionsAuthorizerContract<User>
}

interface IaddMemberLabels {
  user: User | null
  labelIds: string[]
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

  private async addMemberLabels({ user, labelIds }: IaddMemberLabels) {
    const labelsFound: Label[] = []

    // Check if there's unexistent labels on array.
    labelIds.forEach(async (id) => {
      let existingLabel = await Label.find(id)

      if (!existingLabel) {
        throw new Exception('Unable to add labels: There are non existent labels on array.', 400)
      }

      labelsFound.push(existingLabel)
    })

    await user!.load('organizationRelations')

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

  public async execute({ id, payload, bouncer }: Irequest): Promise<void> {
    const { userId, labelIds } = payload

    const organization = await Organization.find(id)
    const user = await User.find(userId)

    await this.treatExceptions({ id, user, organization })

    await bouncer.authorize('OrganizationManager', organization!)

    organization!.related('members').attach([userId])

    await this.addMemberLabels({ user, labelIds })

    LogAttached()
  }
}
