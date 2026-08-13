import { authenticatedRequest } from '@/shared/lib/api'
import type {
  ContactNotificationRecipientsResponse,
  ReplaceContactNotificationRecipientsInput,
} from './types'

const BASE_PATH = '/api/contacts/admin/notification-recipients'

export async function fetchContactNotificationRecipients(): Promise<ContactNotificationRecipientsResponse> {
  return authenticatedRequest<ContactNotificationRecipientsResponse>(BASE_PATH)
}

export async function replaceContactNotificationRecipients(
  input: ReplaceContactNotificationRecipientsInput,
): Promise<ContactNotificationRecipientsResponse> {
  return authenticatedRequest<ContactNotificationRecipientsResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}
