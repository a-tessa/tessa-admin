import { describe, expect, it } from 'vitest'
import {
  companyInformationFormSchema,
  defaultCompanyInformationFormValues,
  toCompanyInformationFormValues,
  toCompanyInformationInput,
} from './company-information.schema'

const validValues = {
  name: 'Tessa Tecnologia e Desenvolvimento LTDA',
  cnpj: '00.000.000/0001-00',
  address: 'Rodovia Assis Chateaubriand SP 425 KM175.9, Guapiaçu',
  zipCode: '15110-000',
  email: 'contato@tessa.com.br',
  whatsapp: '(17) 99999-1234',
  phoneContacts: [
    { phone: '+55 17 3267-1220' },
    { phone: '+55 17 3267-1453' },
  ],
}

describe('company-information.schema', () => {
  it('usa defaults quando a seção ainda não existe', () => {
    expect(toCompanyInformationFormValues(null)).toEqual(
      defaultCompanyInformationFormValues,
    )
  })

  it('converte o formulário para o payload da API', () => {
    expect(
      toCompanyInformationInput({
        name: '  Tessa LTDA  ',
        cnpj: ' 00000000000100 ',
        address: ' Rua Exemplo, 123 ',
        zipCode: ' 15110-000 ',
        email: ' contato@tessa.com.br ',
        whatsapp: ' +55 17 99999-1234 ',
        phoneContacts: [{ phone: ' +55 17 3267-1220 ' }],
      }),
    ).toEqual({
      name: 'Tessa LTDA',
      cnpj: '00.000.000/0001-00',
      address: 'Rua Exemplo, 123',
      zipCode: '15110-000',
      email: 'contato@tessa.com.br',
      whatsapp: '(17) 99999-1234',
      phoneContacts: [{ phone: '+55 17 3267-1220' }],
    })
  })

  it('aplica a máscara de CNPJ ao carregar dígitos crus', () => {
    expect(
      toCompanyInformationFormValues({
        name: 'Tessa LTDA',
        cnpj: '00000000000100',
        address: 'Rua Exemplo, 123',
        zipCode: '15110-000',
        email: 'contato@tessa.com.br',
        phoneContacts: [{ phone: '+55 17 3267-1220' }],
      }).cnpj,
    ).toBe('00.000.000/0001-00')
  })

  it('aplica a máscara nacional ao carregar um WhatsApp com DDI', () => {
    expect(
      toCompanyInformationFormValues({
        name: 'Tessa LTDA',
        cnpj: '00.000.000/0001-00',
        address: 'Rua Exemplo, 123',
        zipCode: '15110-000',
        email: 'contato@tessa.com.br',
        whatsapp: '+55 17 99999-1234',
        phoneContacts: [{ phone: '+55 17 3267-1220' }],
      }).whatsapp,
    ).toBe('(17) 99999-1234')
  })

  it('agrupa o WhatsApp com 5 dígitos após o DDD, mesmo sem 9 inicial', () => {
    expect(
      toCompanyInformationInput({
        ...validValues,
        whatsapp: '17326714530',
      }).whatsapp,
    ).toBe('(17) 32671-4530')
  })

  it('rejeita e-mail inválido, CNPJ vazio, WhatsApp incompleto e lista de telefones vazia', () => {
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        email: 'nao-e-email',
      }).success,
    ).toBe(false)
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        cnpj: ' ',
      }).success,
    ).toBe(false)
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        cnpj: '12.345',
      }).success,
    ).toBe(false)
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        phoneContacts: [],
      }).success,
    ).toBe(false)
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        whatsapp: '123',
      }).success,
    ).toBe(false)
    expect(
      companyInformationFormSchema.safeParse({
        ...validValues,
        whatsapp: '(17) 3267-1220',
      }).success,
    ).toBe(false)
  })
})
