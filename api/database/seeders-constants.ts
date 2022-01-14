import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import User from 'App/Models/User'
import { TrackingSessionStatus } from 'Contracts/enums'
import TrackingSession from '../app/Models/TrackingSession'

export const defaultId = '19e183c4-50cb-4cda-83eb-9acc494071ac'
export const defaultScreenshotCode = 'fVOewLLLGDQ8'

export const dummyUser: Partial<User> = {
  id: defaultId,
  displayName: 'jonsnow',
  name: 'Jon Snow',
  email: 'snow@email.com',
  password: 'jon123',
}

export const dummyOrganization: Partial<Organization> = {
  id: defaultId,
  creatorId: defaultId,
  name: 'Main Leaf',
}

export const dummyProject: Partial<Project> = {
  id: defaultId,
  name: 'Omnileaf',
  creatorId: defaultId,
  organizationId: defaultId,
}

export const dummyTask: Partial<Task> = {
  id: defaultId,
  name: 'Create project',
  projectId: defaultId,
}

export const dummySession: Partial<TrackingSession> = {
  id: defaultId,
  status: TrackingSessionStatus.FINISHED,
  userId: defaultId,
  taskId: defaultId,
  startedAt: CustomHelpers.dateAsDateTime(new Date()),
  stoppedAt: CustomHelpers.dateAsDateTime(new Date()).plus({ minutes: 10 }),
  trackingTime: 600,
}
