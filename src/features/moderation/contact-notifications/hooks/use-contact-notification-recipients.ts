import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  contactNotificationKeys,
  contactNotificationRecipientsQuery,
} from '../contact-notifications.queries'
import { replaceContactNotificationRecipients } from '../contact-notifications.service'
import type { ReplaceContactNotificationRecipientsInput } from '../types'

export function useContactNotificationRecipients() {
  return useQuery(contactNotificationRecipientsQuery())
}

export function useSaveContactNotificationRecipients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReplaceContactNotificationRecipientsInput) =>
      replaceContactNotificationRecipients(input),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({
        queryKey: contactNotificationKeys.all,
      })
    },
  })
}
