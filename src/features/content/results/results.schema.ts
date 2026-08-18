import { z } from 'zod'
import type { ResultsSection, StoredResultsSection } from './types'

export const MIN_RESULTS_STATS = 1
export const MAX_RESULTS_STATS = 4
export const MAX_RESULTS_LABEL_LENGTH = 80
export const RESULTS_SECTION_LEGACY_STAT_COUNT = 3

const MILLION = 1_000_000
const THOUSAND = 1_000
const LEGACY_COMPACT_SUFFIXES = ['MI', 'K', ''] as const

export const DEFAULT_RESULTS_STATS = [
  {
    value: 7_000_000,
    label: 'de m² em estruturas metálicas',
  },
  {
    value: 200_000,
    label: 'instalações realizadas no Brasil',
  },
  {
    value: 20,
    label: 'anos de experiência em engenharia estrutural',
  },
] as const

function divideForSuffix(value: number, divisor: number): number {
  const result = value / divisor
  if (Number.isInteger(result)) return result
  return Math.round(result * 10) / 10
}

export function abbreviateResultValue(value: number): {
  value: number
  suffix: string
} {
  if (!Number.isFinite(value) || value < 0) {
    return { value: 0, suffix: '' }
  }

  if (value >= MILLION) {
    return { value: divideForSuffix(value, MILLION), suffix: 'MI' }
  }

  if (value >= THOUSAND) {
    return { value: divideForSuffix(value, THOUSAND), suffix: 'K' }
  }

  return { value, suffix: '' }
}

export function expandCompactResultValue(
  value: number,
  suffix: string,
): number {
  const normalized = suffix.trim().toUpperCase()
  if (normalized === 'MI') return value * MILLION
  if (normalized === 'K') return value * THOUSAND
  return value
}

export function formatResultStatDisplay(rawValue: number): string {
  const abbreviated = abbreviateResultValue(rawValue)
  return `+${String(abbreviated.value)}${abbreviated.suffix}`
}

const INVALID_STAT_MESSAGE = 'Informe um número inteiro ≥ 0.'

const statValueSchema = z
  .string()
  .trim()
  .min(1, INVALID_STAT_MESSAGE)
  .regex(/^\d+$/, INVALID_STAT_MESSAGE)

const resultsStatFormSchema = z.object({
  value: statValueSchema,
  label: z
    .string()
    .trim()
    .min(1, 'O texto do número é obrigatório.')
    .max(
      MAX_RESULTS_LABEL_LENGTH,
      `O texto deve ter no máximo ${String(MAX_RESULTS_LABEL_LENGTH)} caracteres.`,
    ),
})

export const resultsSectionFormSchema = z.object({
  stats: z
    .array(resultsStatFormSchema)
    .min(
      MIN_RESULTS_STATS,
      `Informe pelo menos ${String(MIN_RESULTS_STATS)} número.`,
    )
    .max(
      MAX_RESULTS_STATS,
      `Informe no máximo ${String(MAX_RESULTS_STATS)} números.`,
    ),
})

export type ResultsSectionFormValues = z.infer<typeof resultsSectionFormSchema>

export const defaultResultsSectionFormValues: ResultsSectionFormValues = {
  stats: DEFAULT_RESULTS_STATS.map((stat) => ({
    value: String(stat.value),
    label: stat.label,
  })),
}

export const emptyResultsStatFormValue: ResultsSectionFormValues['stats'][number] =
  {
    value: '',
    label: '',
  }

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

function isStoredStatsSection(
  section: StoredResultsSection,
): section is ResultsSection {
  return 'stats' in section && Array.isArray(section.stats)
}

function toFormStats(
  stats: readonly { value: number; suffix?: string; label: string }[],
): ResultsSectionFormValues['stats'] | null {
  if (stats.length < MIN_RESULTS_STATS || stats.length > MAX_RESULTS_STATS) {
    return null
  }

  const parsed: ResultsSectionFormValues['stats'] = []
  for (const stat of stats) {
    if (!isNonNegativeInteger(stat.value) || stat.label.trim().length === 0) {
      return null
    }

    parsed.push({
      value: String(expandCompactResultValue(stat.value, stat.suffix ?? '')),
      label: stat.label,
    })
  }

  return parsed
}

export function toResultsSectionFormValues(
  section: StoredResultsSection | null,
): ResultsSectionFormValues {
  if (!section) return defaultResultsSectionFormValues

  if (isStoredStatsSection(section)) {
    const stats = toFormStats(section.stats)
    if (!stats) return defaultResultsSectionFormValues
    return { stats }
  }

  const values = section.values
  if (
    values.length !== RESULTS_SECTION_LEGACY_STAT_COUNT ||
    values.some((value) => !isNonNegativeInteger(value))
  ) {
    return defaultResultsSectionFormValues
  }

  return {
    stats: DEFAULT_RESULTS_STATS.map((stat, index) => ({
      value: String(
        expandCompactResultValue(
          values[index] ?? 0,
          LEGACY_COMPACT_SUFFIXES[index] ?? '',
        ),
      ),
      label: stat.label,
    })),
  }
}

export function toResultsSectionInput(
  values: ResultsSectionFormValues,
): ResultsSection {
  return {
    stats: values.stats.map((stat) => ({
      value: Number(stat.value),
      label: stat.label.trim(),
    })),
  }
}
