import { z } from 'zod'
import { normalizeBrazilPhoneDigits } from '@/shared/lib/brazil-ids'

const BRAZIL_PHONE_ERROR =
  'Informe um telefone brasileiro com DDD e 8 ou 9 dígitos.'

/** DDD + 8 dígitos `(00) 0000-0000` ou DDD + 9 `(00) 00000-0000`. */
export function formatRepresentantPhone(raw: string): string {
  const digits = normalizeBrazilPhoneDigits(raw)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const subscriber = digits.slice(2)

  if (subscriber.length <= 8) {
    if (subscriber.length <= 4) return `(${ddd}) ${subscriber}`
    return `(${ddd}) ${subscriber.slice(0, 4)}-${subscriber.slice(4)}`
  }

  return `(${ddd}) ${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
}

function isBrazilRepresentantPhone(raw: string): boolean {
  let digits = raw.replace(/\D/g, '')

  if (
    digits.startsWith('55') &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2)
  }

  const subscriberLength = digits.length - 2
  return subscriberLength === 8 || subscriberLength === 9
}

export const representantFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120),
  companyName: z
    .string()
    .trim()
    .min(1, 'Nome da empresa é obrigatório.')
    .max(160),
  segment: z.string().trim().min(1, 'Segmento é obrigatório.').max(120),
  phone: z.string().trim().superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Telefone é obrigatório.',
      })
      return
    }

    if (!isBrazilRepresentantPhone(value)) {
      ctx.addIssue({
        code: 'custom',
        message: BRAZIL_PHONE_ERROR,
      })
    }
  }),
  city: z.string().trim().min(1, 'Cidade é obrigatória.').max(120),
  state: z.string().trim().min(1, 'Estado é obrigatório.').max(120),
  email: z
    .email('Email inválido.')
    .trim()
    .min(1, 'Email é obrigatório.')
    .max(255),
})

export type RepresentantFormValues = z.infer<typeof representantFormSchema>
