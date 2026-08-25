import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { SeoCheck } from '../lib/seo-checks'
import { scoreSeoChecks } from '../lib/seo-score'

function CheckIcon({ severity }: { readonly severity: SeoCheck['severity'] }) {
  if (severity === 'error') {
    return <CircleAlert aria-hidden="true" className="size-4 text-destructive" />
  }
  if (severity === 'warning') {
    return (
      <AlertTriangle
        aria-hidden="true"
        className="size-4 text-amber-600 dark:text-amber-400"
      />
    )
  }
  return (
    <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />
  )
}

export function SeoChecklistCard({
  checks,
}: {
  readonly checks: readonly SeoCheck[]
}) {
  const score = scoreSeoChecks(checks)
  const errors = checks.filter((check) => check.severity === 'error')
  const warnings = checks.filter((check) => check.severity === 'warning')
  const oks = checks.filter((check) => check.severity === 'ok')
  const ordered = [...errors, ...warnings, ...oks]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Assistente de SEO</CardTitle>
            <CardDescription>
              Regras do que o Google espera nesses campos. A meta description e
              as palavras-chave não ranqueiam sozinhas; título único e
              descritivo é o que mais pesa aqui.
            </CardDescription>
          </div>
          <Badge variant={score >= 80 ? 'secondary' : 'outline'}>
            Completude {String(score)}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Preencha os padrões globais e ao menos uma página para ver as
            verificações.
          </p>
        ) : (
          <ul className="space-y-3">
            {ordered.map((check) => (
              <li key={check.id} className="flex gap-2">
                <CheckIcon severity={check.severity} />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{check.message}</p>
                  <p className="text-xs text-muted-foreground">{check.help}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
