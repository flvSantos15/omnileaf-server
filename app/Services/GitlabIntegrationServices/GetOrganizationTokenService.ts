import { exceptionsHelper } from 'App/Helpers/CreateExceptionHelper'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import GitlabHttpClientService from './GitlabHttpClientService'

interface IValidateToken {
  expiresIn: number
  createdAt: number
}

interface IUpdateToken {
  existingToken: GitlabToken
}

export default class GetOrganizationTokenService {
  private _validateToken({ expiresIn, createdAt }: IValidateToken) {
    const expirationTime = createdAt + expiresIn
    const currentTime = Date.now().valueOf()

    return currentTime < expirationTime
  }

  private async _updateToken({ existingToken }: IUpdateToken) {
    const gitlabHttpClient = new GitlabHttpClientService()
    const token = await gitlabHttpClient.refreshAccessToken(existingToken.refreshToken)

    await existingToken
      .merge({
        token: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        createdTime: token.created_at,
      })
      .save()

    return existingToken
  }

  public async execute(organizationId: string): Promise<string> {
    const organization = await Organization.find(organizationId)

    if (!organization) exceptionsHelper.idNotFoundException(Organization.name)

    await organization!.load('gitlabToken')

    const tokenIsValid = this._validateToken({
      expiresIn: organization!.gitlabToken.expiresIn,
      createdAt: organization!.gitlabToken.createdTime,
    })

    if (!tokenIsValid) {
      const updatedToken = await this._updateToken({ existingToken: organization!.gitlabToken })
      return updatedToken.token
    }

    return organization!.gitlabToken.token
  }
}
