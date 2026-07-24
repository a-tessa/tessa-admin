import { AlertCircle, CheckCircle2, Languages, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  useInstagramCatalog,
  useSaveInstagramSelection,
} from '../hooks/use-instagram'
import type {
  InstagramCatalogResponse,
  InstagramMediaDto,
  InstagramSelectionSlot,
} from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatDateTime } from '@/shared/lib/format'

const slots = [
  { key: 'primary', label: 'Principal' },
  { key: 'upperRight', label: 'Superior direita' },
  { key: 'lowerRight', label: 'Inferior direita' },
] as const satisfies readonly {
  key: InstagramSelectionSlot
  label: string
}[]

type LocalSelection = Record<InstagramSelectionSlot, string>

const emptySelection: LocalSelection = {
  primary: '',
  upperRight: '',
  lowerRight: '',
}

function toLocalSelection(
  selection:
    | {
        primary: string
        upperRight: string
        lowerRight: string
      }
    | null
    | undefined,
): LocalSelection {
  return selection
    ? {
        primary: selection.primary,
        upperRight: selection.upperRight,
        lowerRight: selection.lowerRight,
      }
    : emptySelection
}

function MediaPreview({ media }: { media: InstagramMediaDto }) {
  return (
    <div className="overflow-hidden rounded-md border bg-muted">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={media.imageUrl}
          alt={media.altText ?? 'Mídia do Instagram'}
          className="size-full object-cover"
        />
        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1">
          {media.isCollaborative ? (
            <Badge variant="secondary">Colaboração</Badge>
          ) : null}
          {!media.isAvailable ? (
            <Badge variant="destructive">Indisponível</Badge>
          ) : media.isLocalized ? (
            <Badge>Traduções prontas</Badge>
          ) : (
            <Badge variant="outline">Traduzindo</Badge>
          )}
        </div>
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
          {media.caption?.trim()
            ? media.caption.trim()
            : 'Sem legenda — será usado o texto padrão.'}
        </p>
        <p className="text-[0.625rem] text-muted-foreground">
          {formatDateTime(media.publishedAt)}
        </p>
      </div>
    </div>
  )
}

export function InstagramCurationPanel({
  isConnected,
}: {
  isConnected: boolean
}) {
  const catalog = useInstagramCatalog({ enabled: isConnected })

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Curadoria</CardTitle>
          <CardDescription>
            Conecte a conta oficial para montar a seleção publicada.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (catalog.isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (catalog.isError || !catalog.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Não foi possível carregar a curadoria</AlertTitle>
        <AlertDescription>
          {catalog.error instanceof Error
            ? catalog.error.message
            : 'Tente atualizar a página.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <InstagramCurationEditor
      key={`${catalog.data.updatedAt}:${String(catalog.data.draftSelection?.version ?? 0)}`}
      catalog={catalog.data}
    />
  )
}

function InstagramCurationEditor({
  catalog,
}: {
  catalog: InstagramCatalogResponse
}) {
  const saveSelection = useSaveInstagramSelection()
  const persistedSelection = toLocalSelection(
    catalog.draftSelection ?? catalog.publishedSelection,
  )
  const [selection, setSelection] = useState(persistedSelection)
  const mediaById = useMemo(
    () =>
      new Map(
        catalog.media.map((media) => [media.id, media] as const),
      ),
    [catalog.media],
  )
  const selectedIds = slots.map((slot) => selection[slot.key]).filter(Boolean)
  const hasCompleteSelection = selectedIds.length === slots.length
  const hasDistinctSelection = new Set(selectedIds).size === slots.length
  const hasLocalChanges = slots.some(
    (slot) => selection[slot.key] !== persistedSelection[slot.key],
  )
  const isDraftDifferentFromPublished = slots.some(
    (slot) =>
      catalog.draftSelection?.[slot.key] !==
      catalog.publishedSelection?.[slot.key],
  )

  function handleSave() {
    if (!hasCompleteSelection || !hasDistinctSelection) {
      return
    }

    saveSelection.mutate({
      expectedUpdatedAt: catalog.updatedAt,
      primary: selection.primary,
      upperRight: selection.upperRight,
      lowerRight: selection.lowerRight,
    })
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Curadoria das publicações</CardTitle>
            <CardDescription>
              Escolha três mídias distintas. Salvar altera o rascunho; a barra
              global publica a seleção na home e nas páginas de serviços.
            </CardDescription>
          </div>
          {isDraftDifferentFromPublished ? (
            <Badge variant="secondary">Rascunho não publicado</Badge>
          ) : (
            <Badge variant="outline">Igual ao publicado</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {catalog.media.length === 0 ? (
          <Alert>
            <Languages />
            <AlertTitle>Catálogo vazio</AlertTitle>
            <AlertDescription>
              Sincronize a conta para importar mídias próprias e colaborações
              aceitas.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {slots.map((slot) => {
              const selectedMedia = mediaById.get(selection[slot.key])

              return (
                <section
                  key={slot.key}
                  className="space-y-3 rounded-lg border bg-card p-4"
                  aria-labelledby={`instagram-slot-${slot.key}`}
                >
                  <div className="space-y-1">
                    <h3
                      id={`instagram-slot-${slot.key}`}
                      className="text-sm font-medium"
                    >
                      {slot.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {slot.key === 'primary'
                        ? 'Destaque maior à esquerda.'
                        : 'Cartão menor na coluna direita.'}
                    </p>
                  </div>

                  <Select
                    value={selection[slot.key]}
                    onValueChange={(mediaId) =>
                      setSelection((current) => ({
                        ...current,
                        [slot.key]: mediaId,
                      }))
                    }
                  >
                    <SelectTrigger aria-label={`Selecionar ${slot.label}`}>
                      <SelectValue placeholder="Selecionar publicação" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.media.map((media) => {
                        const isUsedElsewhere = slots.some(
                          (otherSlot) =>
                            otherSlot.key !== slot.key &&
                            selection[otherSlot.key] === media.id,
                        )

                        return (
                          <SelectItem
                            key={media.id}
                            value={media.id}
                            disabled={!media.isAvailable || isUsedElsewhere}
                          >
                            {formatDateTime(media.publishedAt)}
                            {media.isCollaborative ? ' · colaboração' : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {selectedMedia ? (
                    <MediaPreview media={selectedMedia} />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                      Nenhuma publicação selecionada
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}

        {!hasDistinctSelection && hasCompleteSelection ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Seleção duplicada</AlertTitle>
            <AlertDescription>
              Cada posição precisa usar uma publicação diferente.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4" />
            A publicação global será bloqueada enquanto houver traduções
            pendentes.
          </p>
          <Button
            onClick={handleSave}
            disabled={
              !hasCompleteSelection ||
              !hasDistinctSelection ||
              !hasLocalChanges ||
              saveSelection.isPending
            }
          >
            <Save />
            Salvar rascunho da seleção
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
