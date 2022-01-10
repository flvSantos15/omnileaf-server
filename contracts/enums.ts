export enum UserRoles {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PRODUCTION = 'PRODUCTION',
}

export enum TrackingSessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export enum TaskStatus {
  IN_PROGRESS,
  CLOSED,
}

export enum OrganizationLabels {
  OWNER = 'A',
  ORGANIZATION_MANAGER = 'OM',
  USER = 'U',
  PROJECT_VIEWER = 'PV',
  PROJECT_MANAGER = 'PM',
}

export enum ProjectRoles {
  VIEWER = 'PV',
  USER = 'U',
  MANAGER = 'PM',
}
