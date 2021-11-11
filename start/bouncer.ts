/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import TrackingSession from 'App/Models/TrackingSession'
import User from 'App/Models/User'
import { OrganizationRoles } from 'Contracts/enums'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer.define('OwnUser', (user: User, id: string) => {
  return user.id === id
})
  .define('OrganizationCreator', async (user: User, organization: Organization) => {
    await user.load('organizationRelations')
    const [orgRelation] = user.organizationRelations.filter(
      async (relation) => relation.organizationId === organization.id
    )

    if (orgRelation) {
      await orgRelation.load('labels')

      return orgRelation.labels.map((label) => label.title).includes(OrganizationRoles.OWNER)
    }

    return false
  })
  .define('OrganizationManager', async (user: User, organization: Organization) => {
    await user.load('organizationRelations')
    const [orgRelation] = user.organizationRelations.filter(
      async (relation) => relation.organizationId === organization.id
    )

    if (orgRelation) {
      await orgRelation.load('labels')

      const allowedRoles = [OrganizationRoles.OWNER, OrganizationRoles.ORGANIZATION_MANAGER]

      return allowedRoles.some((role) => {
        orgRelation.labels.map((label) => label.title).includes(role)
      })
    }

    return false
  })
  .define('ProjectCreator', async (user: User, project: Project) => {
    return user.id === project.creatorId
  })
  .define('ProjectManager', async (user: User, project: Project) => {
    await user.load('projectsRelations')
    const indexOfRelation = user.projectsRelations.findIndex(
      (relation) => relation.projectId === project.id
    )
    await user.projectsRelations[indexOfRelation].load('labels')

    const authorizationRoles = ['Lead']

    const result = authorizationRoles.some((auth) => {
      return user.projectsRelations[indexOfRelation].labels
        .map((label) => label.title)
        .includes(auth)
    })

    return result
  })
  .define('AssignedToProject', async (user: User, project: Project) => {
    await project.load('usersAssigned')
    return project.usersAssigned.map((usrAss) => usrAss.id).includes(user.id)
  })
  .define('SessionOwner', async (user: User, trackingSession: TrackingSession) => {
    return trackingSession.userId === user.id
  })

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
