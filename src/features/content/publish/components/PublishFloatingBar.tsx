import { Link } from '@tanstack/react-router'
import { AlertTriangle, ExternalLink, Loader2, Rocket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHasUnpublishedChanges } from '../hooks/use-has-unpublished-changes'
import { useAdminContent } from '../hooks/use-admin-content'
import { usePublishMainContent } from '../hooks/use-publish-main-content'
import { usePublicationStatus } from '../hooks/use-publication-status'
import { useRetryHomepageTranslations } from '../hooks/use-retry-homepage-translations'
import { usePublicationReadinessBlockers } from '../publication-readiness'
import {
  buildPublicationSummary,
  type PublicationBlocker,
} from '../publication-summary'
import type { TranslationLocaleStatus } from '../types'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { env } from '@/shared/config/env'
import { formatRelativeDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

const LOCALE_LABELS: Record<string, string> = {
  'pt-BR': 'Português',
  en: 'Inglês',
  es: 'Espanhol',
}

const TRANSLATION_STATUS_LABELS: Record<string, string> = {
  not_started: 'não iniciada',
  pending: 'na fila',
  processing: 'em andamento',
  completed: 'concluída',
  failed: 'com falha',
}

function formatLocaleList(locales: string[]): string {
  return locales.map((locale) => LOCALE_LABELS[locale] ?? locale).join(', ')
}

function BlockerList({ blockers }: { readonly blockers: PublicationBlocker[] }) {
  if (blockers.length === 0) return null

  return (
    <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
        Corrija antes de publicar
      </p>
      <ul className="space-y-1.5 text-sm text-foreground">
        {blockers.map((blocker) => (
          <li key={blocker.id}>
            <Link
              to="/conteudo/pagina-inicial"
              search={{ aba: blocker.tab }}
              className="underline underline-offset-2 hover:text-primary"
            >
              {blocker.message}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TranslationStatusList({
  locales,
  configured,
}: {
  readonly locales: TranslationLocaleStatus[]
  readonly configured: boolean
}) {
  if (!configured) {
    return (
      <p className="text-sm text-muted-foreground">
        Localização automática não está configurada neste ambiente. O português
        publicado permanece disponível e os demais idiomas usam o texto
        português até a configuração.
      </p>
    )
  }

  return (
    <ul className="space-y-1 text-sm">
      {locales.map((locale) => (
        <li key={locale.locale}>
          <span className="font-medium">
            {LOCALE_LABELS[locale.locale] ?? locale.locale}
          </span>
          {': '}
          {TRANSLATION_STATUS_LABELS[locale.status] ?? locale.status}
          {locale.error ? ` — ${locale.error}` : null}
          {locale.status === 'failed' && locale.fields.length > 0
            ? ` (${String(locale.fields.length)} campos)`
            : null}
        </li>
      ))}
    </ul>
  )
}

export function PublishFloatingBar() {
  const { hasChanges, isLoading, publishedAt, updatedAt } =
    useHasUnpublishedChanges()
  const { data: adminContent } = useAdminContent()
  const publishMutation = usePublishMainContent()
  const {
    data: publicationStatus,
    isFetching: isStatusFetching,
  } = usePublicationStatus(hasChanges)
  const retryMutation = useRetryHomepageTranslations()
  const readinessBlockers = usePublicationReadinessBlockers()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)

  const summary = useMemo(() => {
    if (!adminContent) return null
    return buildPublicationSummary(
      adminContent.content,
      adminContent.publishedContent,
    )
  }, [adminContent])

  const blockers = useMemo(() => {
    const persisted = summary?.blockers ?? []
    const byId = new Map<string, PublicationBlocker>()
    for (const blocker of [...persisted, ...readinessBlockers]) {
      byId.set(blocker.id, blocker)
    }
    return [...byId.values()]
  }, [readinessBlockers, summary?.blockers])

  const hasBlockers = blockers.length > 0
  const isPublishing = publishMutation.isPending
  const failedLocales =
    publicationStatus?.translations.locales.filter(
      (locale) => locale.status === 'failed',
    ) ?? []
  const publicHomeUrl = `${env.publicSiteUrl}/pt-BR`

  function handleOpenConfirm(): void {
    setConfirmOpen(true)
  }

  function handlePublish(): void {
    if (hasBlockers || isPublishing) return

    publishMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmOpen(false)
        setResultOpen(true)
        toast.success('Conteúdo publicado com sucesso.')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  function handleRetryTranslations(): void {
    retryMutation.mutate(undefined, {
      onSuccess: (status) => {
        const stillFailed = status.translations.locales.filter(
          (locale) => locale.status === 'failed',
        )
        if (stillFailed.length === 0) {
          toast.success('Traduções concluídas. Fallbacks foram substituídos.')
        } else {
          toast.error(
            'Ainda há falhas de localização. Você pode tentar novamente.',
          )
        }
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  if (isLoading || !hasChanges) return null

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex items-center justify-between',
          'border-t bg-card/95 px-4 py-2.5 shadow-[0_-2px_12px_0_oklch(0_0_0/0.06)] backdrop-blur-sm',
          'lg:left-64',
          'animate-in slide-in-from-bottom-full duration-300 fill-mode-both',
        )}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
          </span>

          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-foreground">
              Alterações não publicadas
            </p>
            {updatedAt ? (
              <p className="text-[0.625rem] text-muted-foreground">
                Editado {formatRelativeDate(updatedAt)}
                {publishedAt
                  ? ` · Publicado ${formatRelativeDate(publishedAt)}`
                  : ' · Nunca publicado'}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          size="default"
          className="gap-1.5"
          onClick={handleOpenConfirm}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Rocket className="size-3.5" />
          )}
          Publicar
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-h-[min(90dvh,40rem)] overflow-y-auto sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Brief de publicação</AlertDialogTitle>
            <AlertDialogDescription>
              Revise o que muda na página inicial antes de promover o rascunho
              para a versão pública.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 text-sm">
            <section className="space-y-1.5">
              <h3 className="font-medium text-foreground">Seções alteradas</h3>
              {summary && summary.changedSections.length > 0 ? (
                <ul className="list-inside list-disc text-muted-foreground">
                  {summary.changedSections.map((section) => (
                    <li key={section.key}>{section.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma seção reconhecida com diferença detectável.
                </p>
              )}
            </section>

            {summary?.operations ? (
              <section className="space-y-1.5">
                <h3 className="font-medium text-foreground">Operações</h3>
                <p className="text-muted-foreground">
                  {summary.operations.added} adicionada(s),{' '}
                  {summary.operations.removed} removida(s),{' '}
                  {summary.operations.reordered} reordenada(s).
                </p>
              </section>
            ) : null}

            {summary?.industryVideos ? (
              <section className="space-y-1.5">
                <h3 className="font-medium text-foreground">Vídeos da Indústria</h3>
                <p className="text-muted-foreground">
                  Próprios: {formatLocaleList(summary.industryVideos.ownLocales)}.
                  {summary.industryVideos.fallbackLocales.length > 0
                    ? ` Fallback pt-BR: ${formatLocaleList(summary.industryVideos.fallbackLocales)}.`
                    : null}
                </p>
              </section>
            ) : null}

            <section className="space-y-1.5">
              <h3 className="font-medium text-foreground">Localizações</h3>
              {isStatusFetching && !publicationStatus ? (
                <p className="text-muted-foreground">Carregando status…</p>
              ) : (
                <TranslationStatusList
                  configured={publicationStatus?.translations.configured ?? false}
                  locales={publicationStatus?.translations.locales ?? []}
                />
              )}
            </section>

            <BlockerList blockers={blockers} />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancelar</AlertDialogCancel>
            <Button
              onClick={handlePublish}
              disabled={hasBlockers || isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : null}
              Publicar agora
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resultOpen} onOpenChange={setResultOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Publicação concluída</AlertDialogTitle>
            <AlertDialogDescription>
              A página inicial pública pode levar até 60 segundos para refletir
              a atualização por causa do cache atual.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 text-sm">
            <a
              href={publicHomeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary underline underline-offset-2"
            >
              Abrir página inicial pública
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>

            {failedLocales.length > 0 ? (
              <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="font-medium text-foreground">
                  Algumas localizações falharam. Esses idiomas usam temporariamente
                  o texto português.
                </p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {failedLocales.map((locale) => (
                    <li key={locale.locale}>
                      {LOCALE_LABELS[locale.locale] ?? locale.locale}
                      {locale.fields.length > 0
                        ? `: ${locale.fields.join(', ')}`
                        : null}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={retryMutation.isPending}
                  onClick={handleRetryTranslations}
                >
                  {retryMutation.isPending ? (
                    <Loader2 className="mr-1 size-3.5 animate-spin" />
                  ) : null}
                  Tentar traduções novamente
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma falha de localização registrada neste momento.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <Button type="button" onClick={() => setResultOpen(false)}>
              Fechar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
