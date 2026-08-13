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
        values: [10, 300, 25],
      }),
    ).toEqual({ values: [10, 300, 25] })
  })
})
