import { z } from 'zod'
import type { FooterSection } from './types'

export const MAX_FOOTER_NEWSLETTER_TITLE_LENGTH = 80
export const MAX_FOOTER_NEWSLETTER_SUB_LENGTH = 120

export const DEFAULT_FOOTER_NEWSLETTER_TITLE = 'Receba novidades da Tessa'
export const DEFAULT_FOOTER_NEWSLETTER_SUB =
  'Conteúdos técnicos, novidades e soluções'

export const footerSectionFormSchema = z.object({
  newsletterTitle: z
    .string()
    .trim()
    .min(1, 'O título da newsletter é obrigatório.')
    .max(
      MAX_FOOTER_NEWSLETTER_TITLE_LENGTH,
      `O título deve ter no máximo ${String(MAX_FOOTER_NEWSLETTER_TITLE_LENGTH)} caracteres.`,
    ),
  newsletterSub: z
    .string()
    .trim()
    .min(1, 'O subtítulo da newsletter é obrigatório.')
    .max(
      MAX_FOOTER_NEWSLETTER_SUB_LENGTH,
      `O subtítulo deve ter no máximo ${String(MAX_FOOTER_NEWSLETTER_SUB_LENGTH)} caracteres.`,
    ),
})

export type FooterSectionFormValues = z.infer<typeof footerSectionFormSchema>

export const defaultFooterSectionFormValues: FooterSectionFormValues = {
  newsletterTitle: DEFAULT_FOOTER_NEWSLETTER_TITLE,
  newsletterSub: DEFAULT_FOOTER_NEWSLETTER_SUB,
}

export function toFooterSectionFormValues(
  section: FooterSection | null,
): FooterSectionFormValues {
  if (!section) return defaultFooterSectionFormValues

  return {
    newsletterTitle: section.newsletterTitle,
    newsletterSub: section.newsletterSub,
  }
}

export function toFooterSectionInput(
  values: FooterSectionFormValues,
): FooterSection {
  return {
    newsletterTitle: values.newsletterTitle.trim(),
    newsletterSub: values.newsletterSub.trim(),
  }
}
