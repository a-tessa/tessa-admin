import { z } from 'zod'

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export function isValidInternalPath(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return false
  if (/[?#]/.test(trimmed)) return false
  return trimmed.length > 0
}

export function isValidRedirectDestination(value: string): boolean {
  const trimmed = value.trim()
  if (isAbsoluteHttpUrl(trimmed)) {
    try {
      const url = new URL(trimmed)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  return isValidInternalPath(trimmed)
}

export const redirectFormSchema = z
  .object({
    fromPath: z
      .string()
      .trim()
      .min(1, 'Informe o caminho de origem.')
      .refine(
        (value: string): boolean => isValidInternalPath(value),
        'A origem precisa ser um caminho interno começando por /.',
      ),
    toPath: z
      .string()
      .trim()
      .min(1, 'Informe o destino.')
      .refine(
        (value: string): boolean => isValidRedirectDestination(value),
        'O destino precisa ser um caminho interno ou uma URL http(s).',
      ),
    statusCode: z.union([z.literal(301), z.literal(302)]),
  })
  .superRefine((values, context) => {
    const fromPath = values.fromPath.replace(/\/+$/, '').toLowerCase()
    const toPath = values.toPath.replace(/\/+$/, '').toLowerCase()
    if (!isAbsoluteHttpUrl(values.toPath) && fromPath === toPath) {
      context.addIssue({
        code: 'custom',
        path: ['toPath'],
        message: 'O destino precisa ser diferente da origem.',
      })
    }
  })

export type RedirectFormValues = z.infer<typeof redirectFormSchema>

export const defaultRedirectFormValues: RedirectFormValues = {
  fromPath: '',
  toPath: '',
  statusCode: 301,
}
