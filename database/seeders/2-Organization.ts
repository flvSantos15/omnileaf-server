import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Organization from 'App/Models/Organization'
import { dummyOrganization } from 'Database/seeders-constants'

export default class OrganizationSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const organization = await Organization.find(dummyOrganization.id)
    if (organization) return

    await Organization.create(dummyOrganization)
  }
}
