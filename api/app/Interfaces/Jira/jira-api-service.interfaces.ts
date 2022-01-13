export interface JiraApiRequest {
  id?: string
  key?: string
  cloudId?: string
  token?: string
}

export interface GetProjectRoleRequest {
  endpoint: string
  token?: string
}

export interface GetUsersFromGroupRequest {
  name: string
  cloudId?: string
  token?: string
}

export interface DeleteWebhookRequest {
  webhookIds: string[]
  cloudId?: string
  token?: string
}
