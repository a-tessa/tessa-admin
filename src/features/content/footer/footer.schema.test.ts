import { describe, expect, it } from 'vitest'
import {
  defaultFooterSectionFormValues,
  footerSectionFormSchema,
  toFooterSectionFormValues,
  toFooterSectionInput,
} from './footer.schema'

describe('footer.schema', () => {
  it('usa defaults quando a seção ainda não existe', () => {
    expect(toFooterSectionFormValues(null)).toEqual(
      defaultFooterSectionFormValues,
    )
  })

  it('converte o formulário para o payload da API', () => {
    expect(
      toFooterSectionInput({
        newsletterTitle: '  Novo título  ',
        newsletterSub: ' Novo subtítulo ',
      }),
    ).toEqual({
      newsletterTitle: 'Novo título',
      newsletterSub: 'Novo subtítulo',
    })
  })

  it('rejeita título e subtítulo vazios', () => {
    expect(
      footerSectionFormSchema.safeParse({
        newsletterTitle: ' ',
        newsletterSub: 'Conteúdos técnicos',
      }).success,
    ).toBe(false)
  })
})
