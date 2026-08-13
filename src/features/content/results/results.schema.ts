import { z } from 'zod'

export const RESULTS_SECTION_STAT_COUNT = 3

export const DEFAULT_RESULTS_VALUES = [7, 200, 20] as const

export const RESULTS_STAT_LABELS = [
  'de m² em estruturas metálicas',
  'instalações realizadas no Brasil',
  'anos de experiência em engenharia estrutural',
] as const

/**
 * Caminhos fixos do tuple. Um nome montado em tempo de execução não é aceito
 * pelo tipo do campo, que só admite estes três.
 */
export const RESULTS_STAT_FIELDS = [
  { name: 'values.0', label: RESULTS_STAT_LABELS[0] },
  { name: 'values.1', label: RESULTS_STAT_LABELS[1] },
  { name: 'values.2', label: RESULTS_STAT_LABELS[2] },
] as const

const INVALID_STAT_MESSAGE = 'Informe um número inteiro ≥ 0.'

// O campo do formulário guarda texto, como o input entrega. A conversão para
// número acontece só na borda da API, em toResultsSectionInput.
const statValueSchema = z
  .string()
  .trim()
  .min(1, INVALID_STAT_MESSAGE)
  .regex(/^\d+$/, INVALID_STAT_MESSAGE)

export const resultsSectionFormSchema = z.object({
  values: z.tuple([statValueSchema, statValueSchema, statValueSchema]),
})

export type ResultsSectionFormValues = z.infer<typeof resultsSectionFormSchema>

export const defaultResultsSectionFormValues: ResultsSectionFormValues = {
  values: [
    String(DEFAULT_RESULTS_VALUES[0]),
    String(DEFAULT_RESULTS_VALUES[1]),
    String(DEFAULT_RESULTS_VALUES[2]),
  ],
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

export function toResultsSectionFormValues(
  section: { values: number[] } | null,
): ResultsSectionFormValues {
  const values = section?.values ?? []
  const [first, second, third] = values

  if (
    values.length !== RESULTS_SECTION_STAT_COUNT ||
    first === undefined ||
    second === undefined ||
    third === undefined ||
    !isNonNegativeInteger(first) ||
    !isNonNegativeInteger(second) ||
    !isNonNegativeInteger(third)
  ) {
    return defaultResultsSectionFormValues
  }

  return {
    values: [String(first), String(second), String(third)],
  }
}

export function toResultsSectionInput(values: ResultsSectionFormValues): {
  values: [number, number, number]
} {
  return {
    values: [
      Number(values.values[0]),
      Number(values.values[1]),
      Number(values.values[2]),
    ],
  }
}
