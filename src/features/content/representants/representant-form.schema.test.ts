import { describe, expect, it } from 'vitest'
import {
  formatRepresentantPhone,
  representantFormSchema,
} from './representant-form.schema'

const validRepresentant = {
  name: 'João Silva',
  companyName: 'Representações Silva',
  segment: 'Agronegócio',
  city: 'São Paulo',
  state: 'SP',
  email: 'contato@empresa.com',
}

describe('formatRepresentantPhone', () => {
  it('formata 8 dígitos e 9 dígitos, mesmo sem começar com 9', () => {
    expect(formatRepresentantPhone('1732671220')).toBe('(17) 3267-1220')
    expect(formatRepresentantPhone('1199999999')).toBe('(11) 9999-9999')
    expect(formatRepresentantPhone('11999991234')).toBe('(11) 99999-1234')
    expect(formatRepresentantPhone('11326711220')).toBe('(11) 32671-1220')
  })
})

describe('representantFormSchema phone', () => {
  it('aceita o padrão de 8 dígitos e o de 9 dígitos', () => {
    for (const phone of [
      '(11) 3267-1220',
      '(11) 9999-9999',
      '(11) 99999-1234',
      '(11) 32671-1220',
    ]) {
      expect(
        representantFormSchema.safeParse({
          ...validRepresentant,
          phone,
        }).success,
        phone,
      ).toBe(true)
    }
  })

  it('rejeita telefone vazio, incompleto ou fora do padrão brasileiro', () => {
    const empty = representantFormSchema.safeParse({
      ...validRepresentant,
      phone: '',
    })
    const incomplete = representantFormSchema.safeParse({
      ...validRepresentant,
      phone: '(11) 9999-999',
    })
    const tooLong = representantFormSchema.safeParse({
      ...validRepresentant,
      phone: '(11) 99999-12345',
    })

    expect(empty.success).toBe(false)
    expect(incomplete.success).toBe(false)
    expect(tooLong.success).toBe(false)

    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe('Telefone é obrigatório.')
    }
    if (!incomplete.success) {
      expect(incomplete.error.issues[0]?.message).toBe(
        'Informe um telefone brasileiro com DDD e 8 ou 9 dígitos.',
      )
    }
  })
})
