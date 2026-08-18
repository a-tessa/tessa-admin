export interface ResultsStat {
  value: number
  label: string
  suffix?: string
}

export interface ResultsSection {
  stats: ResultsStat[]
}

export type StoredResultsSection =
  | ResultsSection
  | { values: number[] }

export interface ResultsSectionResponse {
  resultsSection: StoredResultsSection
}
