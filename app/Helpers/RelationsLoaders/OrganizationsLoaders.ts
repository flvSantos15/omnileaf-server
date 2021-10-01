import Organization from 'App/Models/Organization'

interface ListQueryStringProps {
  creator: string
  members: string
}

export const ListOrganizationLoader = async (queryString: ListQueryStringProps | any) => {
  const { creator, members } = queryString

  if (members && creator)
    return await Organization.query()
      .preload('creator')
      .preload('members', (query) => {
        query.pivotColumns(['member_role'])
      })
  if (creator && !members) return await Organization.query().preload('creator')
  if (members && !creator) {
    return await Organization.query().preload('members', (query) => {
      query.pivotColumns(['member_role'])
    })
  }

  return await Organization.all()
}

export const ShowOrganizationLoader = async (
  id: string,
  queryString: ListQueryStringProps | any
): Promise<Organization> => {
  const { creator, members } = queryString

  const organization = await Organization.findOrFail(id)

  if (creator) await organization.load('creator')
  if (members)
    await organization.load('members', (query) => {
      query.pivotColumns(['member_type'])
    })

  return organization
}

export let RelationsLoader
