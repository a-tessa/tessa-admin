import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

interface DashboardStatCardProps {
  label: string
  value: string | number | undefined
  description?: string
  icon: LucideIcon
  isLoading: boolean
  accent?: 'default' | 'warning' | 'success'
  to?: string
}

const accentClass: Record<
  NonNullable<DashboardStatCardProps['accent']>,
  string
> = {
  default: 'text-muted-foreground',
  warning: 'text-amber-600 dark:text-amber-400',
  success: 'text-emerald-600 dark:text-emerald-400',
}

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  isLoading,
  accent = 'default',
  to,
}: DashboardStatCardProps) {
  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={cn('size-4', accentClass[accent])} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{String(value ?? 0)}</p>
        )}
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </>
  )

  if (to) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <Link to={to} className="block focus-visible:outline-none">
          {content}
        </Link>
      </Card>
    )
  }

  return <Card>{content}</Card>
}
