export interface ContactNotificationRecipient {
  id: string
  email: string
  name: string | null
}

export interface SuggestedContactNotificationUser {
  id: string
  name: string
  email: string
}

export interface ContactNotificationRecipientsResponse {
  recipients: ContactNotificationRecipient[]
  /** Usuários ativos do admin, oferecidos como atalho ao montar a lista. */
  suggestedUsers: SuggestedContactNotificationUser[]
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
