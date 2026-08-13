import { z } from 'zod'
import {
  formatBrazilMobileDisplay,
  formatCnpjDisplay,
  isCompleteCnpj,
  isValidBrazilMobile,
} from '@/shared/lib/brazil-ids'
import type { CompanyInformation } from './types'

export const MAX_COMPANY_NAME_LENGTH = 160
export const MAX_COMPANY_CNPJ_LENGTH = 20
export const MAX_COMPANY_ADDRESS_LENGTH = 300
export const MAX_COMPANY_ZIP_CODE_LENGTH = 12
export const MAX_COMPANY_EMAIL_LENGTH = 255
export const MAX_COMPANY_PHONE_LENGTH = 40
export const MIN_COMPANY_PHONE_CONTACTS = 1
export const MAX_COMPANY_PHONE_CONTACTS = 5

export const DEFAULT_COMPANY_NAME = 'Tessa Tecnologia e Desenvolvimento LTDA'
export const DEFAULT_COMPANY_ADDRESS =
  'Rodovia Assis Chateaubriand SP 425 KM175.9, Guapiaçu'
export const DEFAULT_COMPANY_ZIP_CODE = '15110-000'
export const DEFAULT_COMPANY_EMAIL = 'contato@tessa.com.br'
export const DEFAULT_COMPANY_PHONES = [
  '+55 17 3267-1220',
  '+55 17 3267-1453',
] as const

export const companyInformationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'A razão social é obrigatória.')
    .max(
      MAX_COMPANY_NAME_LENGTH,
      `A razão social deve ter no máximo ${String(MAX_COMPANY_NAME_LENGTH)} caracteres.`,
    ),
  cnpj: z
    .string()
    .trim()
    .min(1, 'O CNPJ é obrigatório.')
    .max(
      MAX_COMPANY_CNPJ_LENGTH,
      `O CNPJ deve ter no máximo ${String(MAX_COMPANY_CNPJ_LENGTH)} caracteres.`,
    )
    .refine(
      (value: string): boolean => isCompleteCnpj(value),
      'Informe um CNPJ completo, por exemplo 00.000.000/0001-00.',
    ),
  address: z
    .string()
    .trim()
    .min(1, 'O endereço é obrigatório.')
    .max(
      MAX_COMPANY_ADDRESS_LENGTH,
      `O endereço deve ter no máximo ${String(MAX_COMPANY_ADDRESS_LENGTH)} caracteres.`,
    ),
  zipCode: z
    .string()
    .trim()
    .min(1, 'O CEP é obrigatório.')
    .max(
      MAX_COMPANY_ZIP_CODE_LENGTH,
      `O CEP deve ter no máximo ${String(MAX_COMPANY_ZIP_CODE_LENGTH)} caracteres.`,
    ),
  email: z
    .email('Informe um e-mail válido.')
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .max(
      MAX_COMPANY_EMAIL_LENGTH,
      `O e-mail deve ter no máximo ${String(MAX_COMPANY_EMAIL_LENGTH)} caracteres.`,
    ),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'O WhatsApp é obrigatório.')
    .refine(
      (value: string): boolean => isValidBrazilMobile(value),
      'Informe um celular com DDD, por exemplo (17) 99999-9999.',
    ),
  phoneContacts: z
    .array(
      z.object({
        phone: z
          .string()
          .trim()
          .min(1, 'O telefone é obrigatório.')
          .max(
            MAX_COMPANY_PHONE_LENGTH,
            `O telefone deve ter no máximo ${String(MAX_COMPANY_PHONE_LENGTH)} caracteres.`,
          ),
      }),
    )
    .min(
      MIN_COMPANY_PHONE_CONTACTS,
      'Informe pelo menos um telefone.',
    )
    .max(
      MAX_COMPANY_PHONE_CONTACTS,
      `Informe no máximo ${String(MAX_COMPANY_PHONE_CONTACTS)} telefones.`,
    ),
})

export type CompanyInformationFormValues = z.infer<
  typeof companyInformationFormSchema
>

export const defaultCompanyInformationFormValues: CompanyInformationFormValues =
  {
    name: DEFAULT_COMPANY_NAME,
    cnpj: '',
    address: DEFAULT_COMPANY_ADDRESS,
    zipCode: DEFAULT_COMPANY_ZIP_CODE,
    email: DEFAULT_COMPANY_EMAIL,
    whatsapp: '',
    phoneContacts: DEFAULT_COMPANY_PHONES.map((phone) => ({ phone })),
  }

export function toCompanyInformationFormValues(
  section: CompanyInformation | null,
): CompanyInformationFormValues {
  if (!section) return defaultCompanyInformationFormValues

  const phoneContacts = section.phoneContacts
    .map((contact) => ({ phone: contact.phone.trim() }))
    .filter((contact) => contact.phone.length > 0)

  return {
    name: section.name,
    cnpj: formatCnpjDisplay(section.cnpj),
    address: section.address,
    zipCode: section.zipCode,
    email: section.email,
    whatsapp: formatBrazilMobileDisplay(section.whatsapp ?? ''),
    phoneContacts:
      phoneContacts.length > 0
        ? phoneContacts
        : defaultCompanyInformationFormValues.phoneContacts,
  }
}

export function toCompanyInformationInput(
  values: CompanyInformationFormValues,
): CompanyInformation {
  return {
    name: values.name.trim(),
    cnpj: formatCnpjDisplay(values.cnpj),
    address: values.address.trim(),
    zipCode: values.zipCode.trim(),
    email: values.email.trim(),
    whatsapp: formatBrazilMobileDisplay(values.whatsapp),
    phoneContacts: values.phoneContacts.map((contact) => ({
      phone: contact.phone.trim(),
    })),
  }
}
