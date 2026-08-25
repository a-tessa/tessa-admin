import type { SeoCheck } from './seo-checks'

export function scoreSeoChecks(checks: readonly SeoCheck[]): number {
  if (checks.length === 0) return 0

  const total = checks.reduce((sum, check) => {
    if (check.severity === 'ok') return sum + 1
    if (check.severity === 'warning') return sum + 0.5
    return sum
  }, 0)

  return Math.round((total / checks.length) * 100)
}
