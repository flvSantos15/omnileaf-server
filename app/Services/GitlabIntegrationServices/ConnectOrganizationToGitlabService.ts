import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import { exceptionsHelper } from 'App/Helpers/CreateExceptionHelper'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import User from 'App/Models/User'

interface Irequest {
  payload: {
    organizationId: string
    gitlabId: number
    token: {
      access_token: string
      refresh_token: string
      expires_in: number
      created_at: number
    }
  }
  bouncer: ActionsAuthorizerContract<User>
}

export default class ConnectOrganizationToGitlabService {
  public async execute({ payload, bouncer }: Irequest): Promise<void> {
    const { organizationId, gitlabId, token } = payload

    const organization = await Organization.find(organizationId)

    if (!organization) exceptionsHelper.idNotFoundException(Organization.name)

    await bouncer.authorize('OrganizationCreator', organization!)

    await organization!.merge({ gitlabId }).save()

    await GitlabToken.create({
      ownerId: organization!.creatorId,
      organizationId,
      token: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      createdTime: token.created_at,
    })
  }
}
