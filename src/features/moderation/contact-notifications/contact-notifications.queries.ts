import { queryOptions } from '@tanstack/react-query'
import { fetchContactNotificationRecipients } from './contact-notifications.service'

export const contactNotificationKeys = {
  all: ['moderation', 'contact-notifications'] as const,
  recipients: () => [...contactNotificationKeys.all, 'recipients'] as const,
}

export function contactNotificationRecipientsQuery() {
  return queryOptions({
    queryKey: contactNotificationKeys.recipients(),
    queryFn: fetchContactNotificationRecipients,
  })
}
