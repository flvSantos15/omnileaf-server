import { Exception } from '@poppinss/utils'
import { LogShow } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'

export default class ShowOrganizationService {
  public async execute(id: string): Promise<Organization> {
    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization Id does not exists.', 404)
    }

    LogShow(organization)

    return organization
  }
}
