import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useBlocker } from '@tanstack/react-router'
import {
  AlertCircle,
  AlertTriangle,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteOperationSection,
  useOperationSection,
  useSaveOperationSection,
} from '../hooks/use-operation-section'
import { mapPool } from '../lib/upload-queue'
import {
  createGalleryClientId,
  describeOperationFileRejection,
  isAcceptedOperationFile,
  MAX_OPERATION_SECTION_IMAGES,
  MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH,
  OPERATION_FILE_ACCEPT,
  OPERATION_UPLOAD_CONCURRENCY,
  operationSectionFormSchema,
  toOperationGalleryItems,
  toOperationSectionInput,
} from '../operations.schema'
import { uploadOperationAsset } from '../operations.service'
import type { OperationGalleryItem } from '../types'
import { OperationGalleryItemCard } from './OperationGalleryItem'
import { OperationSectionPreview } from './OperationSectionPreview'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

function OperationEditorSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
      <Skeleton className="min-h-96 rounded-xl" />
    </div>
  )
}

function revokePreviewUrl(item: OperationGalleryItem): void {
  if (item.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl)
  }
}

export function OperationSectionEditor() {
  const operationQuery = useOperationSection()
  const hasSection: boolean = operationQuery.data !== null
  const saveMutation = useSaveOperationSection(hasSection)
  const deleteMutation = useDeleteOperationSection()
  const [items, setItems] = useState<OperationGalleryItem[]>([])
  const [baseline, setBaseline] = useState('[]')
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const currentSignature = JSON.stringify(
    items.map((item) => ({
      url: item.url,
      alt: item.alt,
      caption: item.caption,
      status: item.status,
    })),
  )
  const isDirty: boolean = currentSignature !== baseline
  const isBusy: boolean =
    saveMutation.isPending ||
    deleteMutation.isPending ||
    items.some((item) => item.status === 'uploading')

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas na seção Operações. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!operationQuery.isSuccess) return

    const nextItems = toOperationGalleryItems(operationQuery.data)
    setItems(nextItems)
    setBaseline(
      JSON.stringify(
        nextItems.map((item) => ({
          url: item.url,
          alt: item.alt,
          caption: item.caption,
          status: item.status,
        })),
      ),
    )
    setValidationMessage(null)
  }, [operationQuery.data, operationQuery.isSuccess])

  useEffect((): (() => void) => {
    return (): void => {
      for (const item of itemsRef.current) {
        revokePreviewUrl(item)
      }
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function updateItem(
    clientId: string,
    updater: (item: OperationGalleryItem) => OperationGalleryItem,
  ): void {
    setItems((current) =>
      current.map((item) => (item.clientId === clientId ? updater(item) : item)),
    )
  }

  async function uploadItemFile(
    clientId: string,
    file: File,
    index: number,
  ): Promise<void> {
    updateItem(clientId, (item) => {
      const next: OperationGalleryItem = {
        clientId: item.clientId,
        url: item.url,
        previewUrl: item.previewUrl,
        alt: item.alt,
        caption: item.caption,
        status: 'uploading',
        file,
      }
      return next
    })

    try {
      const uploaded = await uploadOperationAsset(file, index)
      updateItem(clientId, (item) => {
        if (item.previewUrl.startsWith('blob:') && item.previewUrl !== uploaded.url) {
          URL.revokeObjectURL(item.previewUrl)
        }
        return {
          clientId: item.clientId,
          url: uploaded.url,
          previewUrl: uploaded.url,
          alt: item.alt,
          caption: item.caption,
          status: 'ready',
          meta: {
            pathname: uploaded.pathname,
            mimeType: uploaded.mimeType,
            sizeBytes: uploaded.sizeBytes,
            originalFilename: uploaded.originalFilename,
          },
        }
      })
    } catch (error) {
      updateItem(clientId, (item) => ({
        ...item,
        status: 'error',
        errorMessage:
          error instanceof Error ? error.message : 'Falha no upload.',
      }))
    }
  }

  async function enqueueFiles(files: File[]): Promise<void> {
    const remainingSlots = MAX_OPERATION_SECTION_IMAGES - items.length
    if (remainingSlots <= 0) {
      toast.error('A galeria já atingiu o limite de 40 imagens.')
      return
    }

    const accepted: File[] = []
    for (const file of files.slice(0, remainingSlots)) {
      if (!isAcceptedOperationFile(file)) {
        toast.error(describeOperationFileRejection(file))
        continue
      }
      accepted.push(file)
    }

    if (accepted.length === 0) return

    if (files.length > remainingSlots) {
      toast.error(
        `Apenas ${String(remainingSlots)} imagem(ns) puderam ser adicionadas (limite 40).`,
      )
    }

    const startIndex = items.length
    const newItems: OperationGalleryItem[] = accepted.map((file) => ({
      clientId: createGalleryClientId(),
      url: '',
      previewUrl: URL.createObjectURL(file),
      alt: '',
      caption: '',
      status: 'uploading',
      file,
    }))

    setItems((current) => [...current, ...newItems])

    await mapPool(newItems, OPERATION_UPLOAD_CONCURRENCY, async (item, offset) => {
      const file = item.file
      if (!file) return
      await uploadItemFile(item.clientId, file, startIndex + offset)
    })
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.clientId === active.id)
      const newIndex = current.findIndex((item) => item.clientId === over.id)
      if (oldIndex < 0 || newIndex < 0) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  function handleMove(clientId: string, direction: -1 | 1): void {
    setItems((current) => {
      const index = current.findIndex((item) => item.clientId === clientId)
      if (index < 0) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.length) return current
      return arrayMove(current, index, nextIndex)
    })
  }

  function handleRemove(clientId: string): void {
    setItems((current) => {
      const target = current.find((item) => item.clientId === clientId)
      if (target) revokePreviewUrl(target)
      return current.filter((item) => item.clientId !== clientId)
    })
  }

  async function handleReplace(clientId: string, file: File): Promise<void> {
    if (!isAcceptedOperationFile(file)) {
      toast.error(describeOperationFileRejection(file))
      return
    }

    const index = items.findIndex((item) => item.clientId === clientId)
    if (index < 0) return

    updateItem(clientId, (item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return {
        ...item,
        previewUrl: URL.createObjectURL(file),
        file,
      }
    })

    await uploadItemFile(clientId, file, index)
  }

  async function handleRetry(clientId: string): Promise<void> {
    const index = items.findIndex((item) => item.clientId === clientId)
    const item = items[index]
    if (!item?.file) {
      toast.error('Selecione o arquivo novamente para tentar o upload.')
      return
    }
    await uploadItemFile(clientId, item.file, index)
  }

  function handleSave(): void {
    if (items.some((item) => item.status === 'uploading')) {
      toast.error('Aguarde o término dos uploads antes de salvar.')
      return
    }

    if (items.some((item) => item.status === 'error')) {
      toast.error('Há uploads com erro. Tente novamente ou remova esses itens.')
      return
    }

    const input = toOperationSectionInput(items)
    const parsed = operationSectionFormSchema.safeParse(input)
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? 'Revise os campos da galeria.'
      setValidationMessage(message)
      toast.error(message)
      return
    }

    setValidationMessage(null)
    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        const nextItems = toOperationGalleryItems(response.operationSection)
        for (const item of items) revokePreviewUrl(item)
        setItems(nextItems)
        setBaseline(
          JSON.stringify(
            nextItems.map((item) => ({
              url: item.url,
              alt: item.alt,
              caption: item.caption,
              status: item.status,
            })),
          ),
        )
        toast.success('Rascunho da seção Operações salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDeleteSection(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        for (const item of items) revokePreviewUrl(item)
        setItems([])
        setBaseline('[]')
        setValidationMessage(null)
        toast.success('Rascunho da seção Operações removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (operationQuery.isPending) {
    return <OperationEditorSkeleton />
  }

  if (operationQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar a seção Operações</AlertTitle>
        <AlertDescription>
          <p>{operationQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={(): void => {
              void operationQuery.refetch()
            }}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const canAddMore = items.length < MAX_OPERATION_SECTION_IMAGES
  const belowPublishMinimum =
    items.filter((item) => item.status === 'ready').length <
    MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Galeria de Operações</CardTitle>
              <CardDescription>
                Envie até 40 imagens (JPEG, PNG ou WebP, máximo 3 MB). A ordem
                salva é a ordem exibida na landing após a publicação.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={OPERATION_FILE_ACCEPT}
                multiple
                className="sr-only"
                disabled={isBusy || !canAddMore}
                onChange={(event): void => {
                  const selected = Array.from(event.target.files ?? [])
                  event.target.value = ''
                  void enqueueFiles(selected)
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isBusy || !canAddMore}
                onClick={(): void => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Adicionar imagens
              </Button>
              <Button
                type="button"
                disabled={isBusy || !isDirty}
                onClick={handleSave}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                Salvar rascunho
              </Button>
              {hasSection || items.length > 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isBusy}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remover seção
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remover a galeria de Operações?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        O rascunho será apagado. A landing voltará ao fallback
                        estático até uma nova publicação com conteúdo válido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSection}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {String(items.length)} / {String(MAX_OPERATION_SECTION_IMAGES)}{' '}
            imagens
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {belowPublishMinimum ? (
            <Alert>
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>Publicação bloqueada nesta galeria</AlertTitle>
              <AlertDescription>
                O rascunho pode ser salvo com menos de{' '}
                {String(MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH)} imagens, mas
                a publicação exige entre{' '}
                {String(MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH)} e{' '}
                {String(MAX_OPERATION_SECTION_IMAGES)} imagens.
              </AlertDescription>
            </Alert>
          ) : null}

          {validationMessage ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>Revise a galeria</AlertTitle>
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          ) : null}

          {items.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
              Nenhuma imagem no rascunho. Adicione arquivos para começar.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.clientId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <OperationGalleryItemCard
                      key={item.clientId}
                      item={item}
                      index={index}
                      total={items.length}
                      disabled={isBusy}
                      onChangeAlt={(clientId, alt): void => {
                        updateItem(clientId, (current) => ({ ...current, alt }))
                      }}
                      onChangeCaption={(clientId, caption): void => {
                        updateItem(clientId, (current) => ({
                          ...current,
                          caption,
                        }))
                      }}
                      onMove={handleMove}
                      onRemove={handleRemove}
                      onReplace={(clientId, file): void => {
                        void handleReplace(clientId, file)
                      }}
                      onRetry={(clientId): void => {
                        void handleRetry(clientId)
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <OperationSectionPreview items={items} />
    </div>
  )
}
