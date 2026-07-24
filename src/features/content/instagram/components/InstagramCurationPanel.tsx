import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Languages,
  Save,
} from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

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

function mediaTypeLabel(mediaType: InstagramMediaDto['mediaType']): string {
  if (mediaType === 'VIDEO') return 'Vídeo / Reel'
  if (mediaType === 'CAROUSEL_ALBUM') return 'Carrossel'
  return 'Foto'
}

function mediaCaptionExcerpt(caption: string | null): string {
  const normalizedCaption = caption?.trim().replace(/\s+/g, ' ')

  if (!normalizedCaption) return 'Sem legenda'
  if (normalizedCaption.length <= 56) return normalizedCaption

  return `${normalizedCaption.slice(0, 53)}…`
}

function slotLabel(slot: InstagramSelectionSlot): string {
  return slots.find((item) => item.key === slot)?.label ?? slot
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
      <div className="relative aspect-4/3 overflow-hidden">
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

function CatalogMediaCard({
  media,
  selectedSlot,
  onPreview,
}: {
  media: InstagramMediaDto
  selectedSlot: InstagramSelectionSlot | null
  onPreview: (mediaId: string) => void
}) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10',
        'transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        selectedSlot && 'ring-2 ring-primary',
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted outline-1 -outline-offset-1 outline-foreground/10">
        <img
          src={media.imageUrl}
          alt={media.altText ?? 'Prévia da mídia do Instagram'}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1">
          <Badge variant="secondary">{mediaTypeLabel(media.mediaType)}</Badge>
          {media.isCollaborative ? (
            <Badge variant="secondary">Colaboração</Badge>
          ) : null}
        </div>
        {selectedSlot ? (
          <Badge className="absolute bottom-2 left-2">
            {slotLabel(selectedSlot)}
          </Badge>
        ) : null}
        {!media.isAvailable ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4 text-center text-xs font-medium text-destructive backdrop-blur-xs">
            Mídia indisponível
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-3">
        <div className="space-y-1">
          <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
            {media.caption?.trim()
              ? media.caption.trim()
              : 'Sem legenda — será usado o texto padrão.'}
          </p>
          <p className="text-[0.625rem] tabular-nums text-muted-foreground">
            {formatDateTime(media.publishedAt)}
          </p>
        </div>

        <Button
          type="button"
          variant={selectedSlot ? 'secondary' : 'outline'}
          className="w-full active:scale-96"
          onClick={() => onPreview(media.id)}
        >
          <Eye />
          Visualizar e selecionar
        </Button>
      </div>
    </article>
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
  const [previewMediaId, setPreviewMediaId] = useState<string | null>(null)
  const mediaById = useMemo(
    () =>
      new Map(
        catalog.media.map((media) => [media.id, media] as const),
      ),
    [catalog.media],
  )
  const selectedSlotByMediaId = useMemo(() => {
    const result = new Map<string, InstagramSelectionSlot>()

    for (const slot of slots) {
      const mediaId = selection[slot.key]
      if (mediaId) result.set(mediaId, slot.key)
    }

    return result
  }, [selection])
  const previewMedia = previewMediaId
    ? mediaById.get(previewMediaId) ?? null
    : null
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

  function handleAssignToSlot(
    mediaId: string,
    targetSlot: InstagramSelectionSlot,
  ) {
    setSelection((current) => {
      const next = { ...current }

      for (const slot of slots) {
        if (next[slot.key] === mediaId) next[slot.key] = ''
      }

      next[targetSlot] = mediaId
      return next
    })
    setPreviewMediaId(null)
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
                            <span className='font-bold'>
                              {mediaCaptionExcerpt(media.caption)}
                            </span>
                            {' · '}
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
                    <div className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                      Nenhuma publicação selecionada
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}

        {catalog.media.length > 0 ? (
          <section className="space-y-3 border-t pt-5" aria-labelledby="catalog-title">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3
                  id="catalog-title"
                  className="text-balance text-sm font-semibold"
                >
                  Catálogo de publicações
                </h3>
                <p className="text-pretty text-xs text-muted-foreground">
                  Visualize fotos, legendas e carrosséis antes de escolher a
                  posição na landing.
                </p>
              </div>
              <p className="text-xs tabular-nums text-muted-foreground">
                {String(selectedIds.length)} de 3 selecionadas ·{' '}
                {String(catalog.media.length)} disponíveis
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {catalog.media.map((media) => (
                <CatalogMediaCard
                  key={media.id}
                  media={media}
                  selectedSlot={selectedSlotByMediaId.get(media.id) ?? null}
                  onPreview={setPreviewMediaId}
                />
              ))}
            </div>
          </section>
        ) : null}

        <Dialog
          open={previewMedia !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setPreviewMediaId(null)
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            {previewMedia ? (
              <>
                <DialogHeader>
                  <DialogTitle>Prévia da publicação</DialogTitle>
                  <DialogDescription>
                    Confira a imagem e a legenda antes de definir sua posição.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted outline-1 -outline-offset-1 outline-foreground/10">
                    <img
                      src={previewMedia.imageUrl}
                      alt={
                        previewMedia.altText ??
                        'Prévia ampliada da mídia do Instagram'
                      }
                      className="size-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">
                        {mediaTypeLabel(previewMedia.mediaType)}
                      </Badge>
                      {previewMedia.isCollaborative ? (
                        <Badge variant="secondary">Colaboração</Badge>
                      ) : null}
                      <Badge
                        variant={
                          previewMedia.isLocalized ? 'default' : 'outline'
                        }
                      >
                        {previewMedia.isLocalized
                          ? 'Traduções prontas'
                          : 'Traduções pendentes'}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">
                        Legenda
                      </p>
                      <p className="max-h-52 overflow-y-auto whitespace-pre-wrap text-pretty text-sm text-muted-foreground">
                        {previewMedia.caption?.trim()
                          ? previewMedia.caption.trim()
                          : 'Sem legenda — será usado o texto padrão localizado.'}
                      </p>
                    </div>

                    <p className="text-xs tabular-nums text-muted-foreground">
                      Publicada em {formatDateTime(previewMedia.publishedAt)}
                    </p>

                    <div className="mt-auto space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        Escolher posição
                      </p>
                      <div className="grid gap-2">
                        {slots.map((slot) => {
                          const isCurrentSlot =
                            selection[slot.key] === previewMedia.id

                          return (
                            <Button
                              key={slot.key}
                              type="button"
                              variant={isCurrentSlot ? 'secondary' : 'outline'}
                              className="justify-start active:scale-96"
                              disabled={
                                !previewMedia.isAvailable || isCurrentSlot
                              }
                              onClick={() =>
                                handleAssignToSlot(previewMedia.id, slot.key)
                              }
                            >
                              {isCurrentSlot
                                ? `Selecionada como ${slot.label}`
                                : `Usar como ${slot.label}`}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button asChild variant="outline">
                    <a
                      href={previewMedia.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir publicação no Instagram
                      <ExternalLink />
                    </a>
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

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
