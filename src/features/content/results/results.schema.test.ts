import { describe, expect, it } from 'vitest'
import {
  abbreviateResultValue,
  defaultResultsSectionFormValues,
  formatResultStatDisplay,
  toResultsSectionFormValues,
  toResultsSectionInput,
} from './results.schema'

describe('abbreviateResultValue', () => {
  it('converte milhões para MI e milhares para K', () => {
    expect(abbreviateResultValue(8_000_000)).toEqual({ value: 8, suffix: 'MI' })
    expect(abbreviateResultValue(600_000)).toEqual({ value: 600, suffix: 'K' })
    expect(abbreviateResultValue(20)).toEqual({ value: 20, suffix: '' })
  })

  it('formata o valor exibido na landing', () => {
    expect(formatResultStatDisplay(8_000_000)).toBe('+8MI')
    expect(formatResultStatDisplay(600_000)).toBe('+600K')
    expect(formatResultStatDisplay(20)).toBe('+20')
  })
})

describe('results.schema', () => {
  it('usa defaults quando a seção ainda não existe', () => {
    expect(toResultsSectionFormValues(null)).toEqual(
      defaultResultsSectionFormValues,
    )
  })

  it('envia o número completo para a API, sem sufixo', () => {
    expect(
      toResultsSectionInput({
        stats: [
          {
            value: '8000000',
            label: 'de m² em estruturas metálicas',
          },
          {
            value: '600000',
            label: 'instalações realizadas no Brasil',
          },
          {
            value: '25',
            label: 'anos de experiência em engenharia estrutural',
          },
        ],
      }),
    ).toEqual({
      stats: [
        {
          value: 8_000_000,
          label: 'de m² em estruturas metálicas',
        },
        {
          value: 600_000,
          label: 'instalações realizadas no Brasil',
        },
        {
          value: 25,
          label: 'anos de experiência em engenharia estrutural',
        },
      ],
    })
  })

  it('carrega números crus e expande stats compactados antigos', () => {
    expect(
      toResultsSectionFormValues({
        stats: [
          { value: 8_000_000, label: 'de m² em estruturas metálicas' },
          { value: 4, suffix: 'K', label: 'unidades em operação' },
        ],
      }),
    ).toEqual({
      stats: [
        {
          value: '8000000',
          label: 'de m² em estruturas metálicas',
        },
        { value: '4000', label: 'unidades em operação' },
      ],
    })
  })

  it('migra o payload antigo de três números compactados', () => {
    expect(toResultsSectionFormValues({ values: [10, 300, 25] })).toEqual({
      stats: [
        {
          value: '10000000',
          label: 'de m² em estruturas metálicas',
        },
        {
          value: '300000',
          label: 'instalações realizadas no Brasil',
        },
        {
          value: '25',
          label: 'anos de experiência em engenharia estrutural',
        },
      ],
    })
  })

  it('cai nos defaults quando os valores salvos são inválidos', () => {
    expect(
      toResultsSectionFormValues({
        stats: [{ value: -1, label: 'inválido' }],
      }),
    ).toEqual(defaultResultsSectionFormValues)
    expect(toResultsSectionFormValues({ values: [10, 300] })).toEqual(
      defaultResultsSectionFormValues,
    )
  })
})
