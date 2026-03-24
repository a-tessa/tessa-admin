import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, Loader2 } from 'lucide-react'
import { apiRequest } from '@/shared/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { formatDateTime } from '@/shared/lib/format'

interface HealthResponse {
  ok: boolean
  service: string
  timestamp: string
}

export function HealthStatusCard() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<HealthResponse>('/api/health'),
    retry: 1,
    refetchInterval: 60_000,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Health check</CardTitle>
        <Activity className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {healthQuery.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Verificando API...
          </div>
        ) : null}

        {healthQuery.isSuccess ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="text-2xl font-bold">Online</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {healthQuery.data.service} &middot; {formatDateTime(healthQuery.data.timestamp)}
            </p>
          </div>
        ) : null}

        {healthQuery.isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            API não respondeu
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
