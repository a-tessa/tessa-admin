import { cn } from '@/shared/lib/utils'

export function SeoFieldMeter({
  currentChars,
  recommendedMax,
  hardMax,
  currentPx,
  maxPx,
}: {
  readonly currentChars: number
  readonly recommendedMax: number
  readonly hardMax: number
  readonly currentPx: number
  readonly maxPx: number
}) {
  const overRecommended = currentChars > recommendedMax || currentPx > maxPx
  const overHard = currentChars > hardMax

  return (
    <span
      className={cn(
        'font-mono text-xs tabular-nums text-muted-foreground',
        overRecommended && 'text-amber-700 dark:text-amber-400',
        overHard && 'text-destructive',
      )}
    >
      {String(currentChars)}/{String(recommendedMax)} · {String(Math.round(currentPx))}/
      {String(maxPx)}px
    </span>
  )
}
