import { z } from 'zod'
import type {
  ContactNotificationRecipientsResponse,
  ReplaceContactNotificationRecipientsInput,
} from './types'

export const MAX_CONTACT_NOTIFICATION_RECIPIENTS = 10
export const MAX_CONTACT_NOTIFICATION_RECIPIENT_NAME_LENGTH = 120
export const MAX_CONTACT_NOTIFICATION_RECIPIENT_EMAIL_LENGTH = 255

const recipientEmailSchema = z
  .string()
  .trim()
  .min(1, 'O e-mail é obrigatório.')
  .max(
    MAX_CONTACT_NOTIFICATION_RECIPIENT_EMAIL_LENGTH,
    `O e-mail deve ter no máximo ${String(MAX_CONTACT_NOTIFICATION_RECIPIENT_EMAIL_LENGTH)} caracteres.`,
  )
  .refine(
    (value: string): boolean => z.email().safeParse(value).success,
    'Informe um e-mail válido.',
  )

export const contactNotificationRecipientsFormSchema = z.object({
  recipients: z
    .array(
      z.object({
        email: recipientEmailSchema,
        name: z
          .string()
          .trim()
          .max(
            MAX_CONTACT_NOTIFICATION_RECIPIENT_NAME_LENGTH,
            `A identificação deve ter no máximo ${String(MAX_CONTACT_NOTIFICATION_RECIPIENT_NAME_LENGTH)} caracteres.`,
          ),
      }),
    )
    .max(
      MAX_CONTACT_NOTIFICATION_RECIPIENTS,
      `Cadastre no máximo ${String(MAX_CONTACT_NOTIFICATION_RECIPIENTS)} destinatários.`,
    )
    .superRefine((recipients, ctx) => {
      const seen = new Set<string>()

      recipients.forEach((recipient, index) => {
        const email = recipient.email.trim().toLowerCase()
        if (email.length === 0) return

        if (seen.has(email)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'email'],
            message: 'Este e-mail já está na lista.',
          })
          return
        }

        seen.add(email)
      })
    }),
})

export type ContactNotificationRecipientsFormValues = z.infer<
  typeof contactNotificationRecipientsFormSchema
>

export const defaultContactNotificationRecipientsFormValues: ContactNotificationRecipientsFormValues =
  {
    recipients: [],
  }

export function toContactNotificationRecipientsFormValues(
  response: ContactNotificationRecipientsResponse | undefined,
): ContactNotificationRecipientsFormValues {
  if (!response) return defaultContactNotificationRecipientsFormValues

  return {
    recipients: response.recipients.map((recipient) => ({
      email: recipient.email,
      name: recipient.name ?? '',
    })),
  }
}

export function toContactNotificationRecipientsInput(
  values: ContactNotificationRecipientsFormValues,
): ReplaceContactNotificationRecipientsInput {
  return {
    recipients: values.recipients.map((recipient) => {
      const name = recipient.name.trim()

      return {
        email: recipient.email.trim().toLowerCase(),
        name: name.length > 0 ? name : null,
      }
    }),
  }
}
