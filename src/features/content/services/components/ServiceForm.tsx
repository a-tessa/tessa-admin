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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useCategories } from '../../categories'
import type { ServicePage, ServicePageFormData } from '../types'

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024

const serviceFormSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug é obrigatório.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use apenas letras minúsculas, números e hífens.',
    ),
  category: z.string().trim().min(1, 'Categoria é obrigatória.'),
  subtitle: z.string().trim().min(1, 'Subtítulo é obrigatório.'),
  exampleVideoUrl: z.string().trim().min(1, 'URL do vídeo é obrigatória.'),
  backgroundImageUrl: z.string().optional(),
  images: z
    .array(z.object({ imgUrl: z.string().optional() }))
    .min(1, 'Adicione ao menos uma imagem de galeria.'),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ImagePreview({ src }: { src: string | undefined }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Preview"
      className="size-full object-cover"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}

function SortableImageItem({
  id,
  index,
  previewSrc,
  canRemove,
  onReplace,
  onRemove,
}: {
  id: string
  index: number
  previewSrc: string | undefined
  canRemove: boolean
  onReplace: (file: File) => void
  onRemove: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onReplace(file)
    }
    e.target.value = ''
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card',
        isDragging && 'relative z-10 shadow-lg ring-2 ring-primary/20 opacity-90',
      )}
    >
      <div className="flex items-center gap-2.5 p-2">
        <button
          type="button"
          className="flex shrink-0 cursor-grab items-center self-stretch text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
          <ImagePreview src={previewSrc} />
        </div>

        <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
          {String(index + 1)}
        </Badge>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {previewSrc?.startsWith('blob:') ? 'Nova imagem (upload pendente)' : previewSrc ?? 'Sem imagem'}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
        >
          <RefreshCw className="size-3" />
          Substituir
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export interface ServiceFormProps {
  formId: string
  service?: ServicePage | undefined
  isPending: boolean
  submitLabel: string
  onSubmit: (data: ServicePageFormData) => void
  onCancel: () => void
  resetKey?: number | string
}

export function ServiceForm({
  formId,
  service,
  isPending,
  submitLabel,
  onSubmit,
  onCancel,
  resetKey,
}: ServiceFormProps) {
  const slugManuallyEditedRef = useRef(false)
  const bgFileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data?.categories ?? []

  const galleryFilesRef = useRef(new Map<string, File>())
  const [galleryPreviews, setGalleryPreviews] = useState(new Map<string, string>())
  const pendingFilesRef = useRef<File[]>([])

  const bgFileRef = useRef<File | undefined>(undefined)
  const [bgPreview, setBgPreview] = useState<string | undefined>(undefined)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title ?? '',
      slug: service?.slug ?? '',
      category: service?.category ?? '',
      subtitle: service?.subtitle ?? '',
      exampleVideoUrl: service?.exampleVideoUrl ?? '',
      backgroundImageUrl: service?.backgroundImageUrl ?? '',
      images: service?.images?.length
        ? service.images
        : [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'images',
  })

  const sortableIds = fields.map((f) => f.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const cleanupPreviews = useCallback(() => {
    for (const url of galleryPreviews.values()) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    if (bgPreview?.startsWith('blob:')) URL.revokeObjectURL(bgPreview)
  }, [galleryPreviews, bgPreview])

  useEffect(() => {
    cleanupPreviews()
    slugManuallyEditedRef.current = false
    galleryFilesRef.current = new Map()
    pendingFilesRef.current = []
    setGalleryPreviews(new Map())
    bgFileRef.current = undefined
    setBgPreview(undefined)
    form.reset({
      title: service?.title ?? '',
      slug: service?.slug ?? '',
      category: service?.category ?? '',
      subtitle: service?.subtitle ?? '',
      exampleVideoUrl: service?.exampleVideoUrl ?? '',
      backgroundImageUrl: service?.backgroundImageUrl ?? '',
      images: service?.images?.length
        ? service.images
        : [],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, service, form])

  useEffect(() => {
    if (pendingFilesRef.current.length === 0) return

    const pending = pendingFilesRef.current
    const unassignedFields = fields.filter((f) => !galleryFilesRef.current.has(f.id))
    const newFields = unassignedFields.slice(-pending.length)

    if (newFields.length === 0) return

    const filesToAssign = pending.splice(0, newFields.length)
    const nextPreviews = new Map(galleryPreviews)

    for (let i = 0; i < filesToAssign.length; i++) {
      const field = newFields[i]!
      const file = filesToAssign[i]!
      galleryFilesRef.current.set(field.id, file)
      nextPreviews.set(field.id, URL.createObjectURL(file))
    }

    setGalleryPreviews(nextPreviews)
  }, [fields, galleryPreviews])

  function getImagePreviewSrc(fieldId: string, index: number): string | undefined {
    const blobUrl = galleryPreviews.get(fieldId)
    if (blobUrl) return blobUrl
    const existingUrl = service?.images?.[index]?.imgUrl
    const currentUrl = form.getValues(`images.${index}.imgUrl`)
    return currentUrl ?? existingUrl
  }

  function getBgPreviewSrc(): string | undefined {
    if (bgPreview) return bgPreview
    return form.getValues('backgroundImageUrl') ?? undefined
  }

  function handleBgFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE_BYTES) {
      form.setError('backgroundImageUrl', { message: 'Arquivo excede o limite de 4 MB.' })
      e.target.value = ''
      return
    }
    bgFileRef.current = file
    if (bgPreview?.startsWith('blob:')) URL.revokeObjectURL(bgPreview)
    setBgPreview(URL.createObjectURL(file))
    form.clearErrors('backgroundImageUrl')
    form.setValue('backgroundImageUrl', '', { shouldDirty: true })
    e.target.value = ''
  }

  function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList) return

    const validFiles: File[] = []
    for (const file of Array.from(fileList)) {
      if (fields.length + validFiles.length >= 15) break
      if (file.size > MAX_FILE_SIZE_BYTES) continue
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    pendingFilesRef.current.push(...validFiles)
    for (const _ of validFiles) {
      append({ imgUrl: '' })
    }

    e.target.value = ''
  }

  function handleGalleryReplace(fieldId: string, file: File) {
    if (file.size > MAX_FILE_SIZE_BYTES) return
    galleryFilesRef.current.set(fieldId, file)
    const oldPreview = galleryPreviews.get(fieldId)
    if (oldPreview?.startsWith('blob:')) URL.revokeObjectURL(oldPreview)
    setGalleryPreviews((prev) => {
      const next = new Map(prev)
      next.set(fieldId, URL.createObjectURL(file))
      return next
    })
    const index = fields.findIndex((f) => f.id === fieldId)
    if (index !== -1) {
      form.setValue(`images.${index}.imgUrl`, '', { shouldDirty: true })
    }
  }

  function handleGalleryRemove(fieldId: string, index: number) {
    galleryFilesRef.current.delete(fieldId)
    const preview = galleryPreviews.get(fieldId)
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setGalleryPreviews((prev) => {
      const next = new Map(prev)
      next.delete(fieldId)
      return next
    })
    remove(index)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    move(oldIndex, newIndex)
  }

  function handleTitleChange(value: string) {
    form.setValue('title', value, { shouldDirty: true, shouldValidate: true })

    if (!slugManuallyEditedRef.current) {
      form.setValue('slug', slugify(value), {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  function handleSlugChange(value: string, fieldOnChange: (v: string) => void) {
    slugManuallyEditedRef.current = true
    fieldOnChange(value)
  }

  function handleFormSubmit(values: ServiceFormValues) {
    const hasBgFile = bgFileRef.current !== undefined
    const hasBgUrl = values.backgroundImageUrl && values.backgroundImageUrl.length > 0
    if (!hasBgFile && !hasBgUrl) {
      form.setError('backgroundImageUrl', { message: 'Envie uma imagem de fundo.' })
      return
    }

    let hasImageError = false
    const imagesPayload: Array<{ imgUrl?: string }> = []
    const galleryFiles = new Map<number, File>()

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]!
      const file = galleryFilesRef.current.get(field.id)
      const imgUrl = values.images[i]?.imgUrl

      if (!file && (!imgUrl || imgUrl.length === 0)) {
        form.setError(`images.${i}.imgUrl`, { message: 'Envie ou substitua esta imagem.' })
        hasImageError = true
        continue
      }

      if (file) {
        galleryFiles.set(i, file)
        imagesPayload.push({})
      } else {
        imagesPayload.push({ imgUrl })
      }
    }

    if (hasImageError) return

    onSubmit({
      payload: {
        slug: values.slug,
        title: values.title,
        category: values.category,
        subtitle: values.subtitle,
        exampleVideoUrl: values.exampleVideoUrl,
        backgroundImageUrl: hasBgFile ? undefined : values.backgroundImageUrl,
        images: imagesPayload,
      },
      backgroundImage: bgFileRef.current,
      galleryFiles: galleryFiles.size > 0 ? galleryFiles : undefined,
    })
  }

  const bgSrc = getBgPreviewSrc()

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Impressão Digital"
                    {...field}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: impressao-digital"
                    {...field}
                    onChange={(e) =>
                      handleSlugChange(e.target.value, field.onChange)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Gerado do título automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do serviço..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exampleVideoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do vídeo de exemplo</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="backgroundImageUrl"
          render={() => (
            <FormItem>
              <FormLabel>Imagem de fundo</FormLabel>
              <div className="space-y-2">
                {bgSrc ? (
                  <div className="relative h-36 w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                    <ImagePreview src={bgSrc} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="flex h-36 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted"
                  >
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Clique para enviar uma imagem
                    </span>
                  </button>
                )}

                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="hidden"
                  onChange={handleBgFileChange}
                />

                {bgSrc ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => bgFileInputRef.current?.click()}
                  >
                    <RefreshCw className="size-3.5" />
                    Substituir
                  </Button>
                ) : null}
              </div>
              <FormDescription>
                JPEG, PNG, WebP ou GIF. Máximo 4 MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Galeria de imagens</p>
              <p className="text-xs text-muted-foreground">
                De 1 a 15 imagens. Arraste para reorganizar.
              </p>
            </div>

            <input
              ref={galleryFileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              className="hidden"
              onChange={handleGalleryAdd}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => galleryFileInputRef.current?.click()}
              disabled={fields.length >= 15}
            >
              <Plus className="size-3.5" />
              Imagem
            </Button>
          </div>

          {fields.length === 0 ? (
            <button
              type="button"
              onClick={() => galleryFileInputRef.current?.click()}
              className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted"
            >
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Clique para adicionar imagens
              </span>
            </button>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <SortableImageItem
                      key={field.id}
                      id={field.id}
                      index={index}
                      previewSrc={getImagePreviewSrc(field.id, index)}
                      canRemove={fields.length > 1}
                      onReplace={(file) => handleGalleryReplace(field.id, file)}
                      onRemove={() => handleGalleryRemove(field.id, index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {form.formState.errors.images?.message ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.images.message}
            </p>
          ) : null}
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
