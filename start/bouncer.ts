/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import User from 'App/Models/User'

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
export const { actions } = Bouncer.define('editAndDeleteUser', (user: User, id: string) => {
  return user.id === id
})
  .define('OrganizationCreator', async (user: User, organization: Organization) => {
    return organization.creatorId === user.id
  })
  .define('OrganizationManager', async (user: User, organization: Organization) => {
    await organization.load('members')
    const member = organization.members.filter((member) => member.id === user.id)[0]
    return member.$extras.pivot_member_role === 'MANAGER'
  })
  .define('ProjectCreator', async (user: User, project: Project) => {
    return user.id === project.creatorId
  })
  .define('ProjectManager', async (user: User, project: Project) => {
    await project.load('usersAssigned')
    const userAssigned = project.usersAssigned.filter(
      (userAssigned) => userAssigned.id === user.id
    )[0]
    return userAssigned.$extras.pivot_user_role === 'MANAGER'
  })
  .define('AssignedToProject', async (user: User, project: Project) => {
    await project.load('usersAssigned')
    return project.usersAssigned.map((usrAss) => usrAss.id).includes(user.id)
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
