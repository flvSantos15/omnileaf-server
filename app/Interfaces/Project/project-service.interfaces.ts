import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import { ProjectRoles } from 'Contracts/enums'

export interface CreateProjectRequest {
  user: User
  payload: {
    name: string
    description: string | undefined
    organizationId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface UpdateProjectRequest {
  id: string
  payload: {
    name: string | undefined
    description: string | undefined
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface DeleteProjectRequest {
  id: string
  bouncer: ActionsAuthorizerContract<User>
}

export interface AddParticipantRequest {
  id: string
  payload: {
    userId: string
    role: ProjectRoles
  }
  bouncer: ActionsAuthorizerContract<User>
}

export interface RemoveParticipantRequest {
  id: string
  payload: {
    userId: string
  }
  bouncer: ActionsAuthorizerContract<User>
}
