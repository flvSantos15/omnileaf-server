import Organization from 'App/Models/Organization'

interface QueryStringProps {
  projects: string
  members: string
}

export const LoadOrganizationRelations = async (
  id: string,
  queryString: Record<string, any>
): Promise<Organization> => {
  const organization = await Organization.findOrFail(id)

  await organization.load('creator')

  const { projects, members } = queryString as unknown as QueryStringProps

  if (projects) await organization.load('projects')

  if (members) await organization.load('members')

  return organization
}
