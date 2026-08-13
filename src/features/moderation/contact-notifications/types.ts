export interface ContactNotificationRecipient {
  id: string
  email: string
  name: string | null
}

export interface ContactNotificationRecipientsResponse {
  recipients: ContactNotificationRecipient[]
  /** Destino usado enquanto a lista está vazia, definido no ambiente da API. */
  fallbackEmail: string
  isEmailDeliveryConfigured: boolean
}

export interface ReplaceContactNotificationRecipientsInput {
  recipients: {
    email: string
    name: string | null
  }[]
}
