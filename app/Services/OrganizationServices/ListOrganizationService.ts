import { LogList } from 'App/Helpers/CustomLogs'
import Organization from 'App/Models/Organization'

export default class ListOrganizationService {
  public async execute(): Promise<Organization[]> {
    const organizations = await Organization.all()

    LogList(organizations)

    return organizations
  }
}
