import { describe, expect, it } from 'vitest'
import {
  defaultResultsSectionFormValues,
  toResultsSectionFormValues,
  toResultsSectionInput,
} from './results.schema'

describe('results.schema', () => {
  it('usa defaults quando a seção ainda não existe', () => {
    expect(toResultsSectionFormValues(null)).toEqual(
      defaultResultsSectionFormValues,
    )
  })

  it('converte o formulário para o payload da API', () => {
    expect(
      toResultsSectionInput({
        values: ['10', '300', '25'],
      }),
    ).toEqual({ values: [10, 300, 25] })
  })

  it('carrega os valores salvos como texto para os campos', () => {
    expect(toResultsSectionFormValues({ values: [10, 300, 25] })).toEqual({
      values: ['10', '300', '25'],
    })
  })

  it('cai nos defaults quando os valores salvos são inválidos', () => {
    expect(toResultsSectionFormValues({ values: [10, -1, 25] })).toEqual(
      defaultResultsSectionFormValues,
    )
    expect(toResultsSectionFormValues({ values: [10, 300] })).toEqual(
      defaultResultsSectionFormValues,
    )
  })
})
