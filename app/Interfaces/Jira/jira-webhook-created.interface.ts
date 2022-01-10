export interface WebhookCreatedView {
  webhookRegistrationResult: WebhookCreated[]
}

interface WebhookCreated {
  createdWebhookId: number
}
