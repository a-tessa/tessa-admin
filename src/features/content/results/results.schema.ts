import { z } from 'zod'

export const RESULTS_SECTION_STAT_COUNT = 3

export const DEFAULT_RESULTS_VALUES = [7, 200, 20] as const

export const RESULTS_STAT_LABELS = [
  'de m² em estruturas metálicas',
  'instalações realizadas no Brasil',
  'anos de experiência em engenharia estrutural',
] as const

export const resultsSectionFormSchema = z.object({
  values: z.tuple([
    z.coerce.number().int().nonnegative('Informe um número inteiro ≥ 0.'),
    z.coerce.number().int().nonnegative('Informe um número inteiro ≥ 0.'),
    z.coerce.number().int().nonnegative('Informe um número inteiro ≥ 0.'),
  ]),
})

export type ResultsSectionFormValues = z.infer<typeof resultsSectionFormSchema>

export const defaultResultsSectionFormValues: ResultsSectionFormValues = {
  values: [...DEFAULT_RESULTS_VALUES],
}

export function toResultsSectionFormValues(
  section: { values: number[] } | null,
): ResultsSectionFormValues {
  if (
    section &&
    Array.isArray(section.values) &&
    section.values.length === RESULTS_SECTION_STAT_COUNT &&
    section.values.every(
      (value) => Number.isInteger(value) && value >= 0,
    )
  ) {
    return {
      values: [
        section.values[0]!,
        section.values[1]!,
        section.values[2]!,
      ],
    }
  }

  return defaultResultsSectionFormValues
}

export function toResultsSectionInput(
  values: ResultsSectionFormValues,
): { values: [number, number, number] } {
  return {
    values: [values.values[0], values.values[1], values.values[2]],
  }
}
