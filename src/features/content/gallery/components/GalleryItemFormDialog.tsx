import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { categoriesListQuery } from '@/features/content/categories/categories.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import {
  describeGalleryPhotoRejection,
  emptyToNull,
  GALLERY_PHOTO_ACCEPT,
  galleryPhotoFormSchema,
  galleryVideoFormSchema,
  getYouTubeVideoId,
  isAcceptedGalleryPhotoFile,
  MAX_GALLERY_ALT_LENGTH,
  MAX_GALLERY_CAPTION_LENGTH,
  type GalleryPhotoFormValues,
  type GalleryVideoFormValues,
} from '../gallery.schema'
import type { GalleryMediaItemAdmin, GalleryMediaKind } from '../types'

const NONE_CATEGORY = '__none__'

interface GalleryItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: GalleryMediaKind
  item?: GalleryMediaItemAdmin | undefined
  isPending: boolean
  onSubmitPhoto: (params: {
    file: File | null
    values: GalleryPhotoFormValues
  }) => void
  onSubmitVideo: (values: GalleryVideoFormValues) => void
}

export function GalleryItemFormDialog({
  open,
  onOpenChange,
  kind,
  item,
  isPending,
  onSubmitPhoto,
  onSubmitVideo,
}: GalleryItemFormDialogProps) {
  const isEditing = item !== undefined
  const isPhoto = kind === 'photo'
  const categoriesQuery = useQuery(categoriesListQuery())
  const categories = categoriesQuery.data?.categories ?? []
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const photoForm = useForm<GalleryPhotoFormValues>({
    resolver: zodResolver(galleryPhotoFormSchema),
    defaultValues: { alt: '', caption: '', categorySlug: NONE_CATEGORY },
  })

  const videoForm = useForm<GalleryVideoFormValues>({
    resolver: zodResolver(galleryVideoFormSchema),
    defaultValues: {
      youtubeUrl: '',
      alt: '',
      caption: '',
      categorySlug: NONE_CATEGORY,
    },
  })

  useEffect(() => {
    if (!open) return

    setPhotoFile(null)
    setPhotoError(null)

    if (isPhoto) {
      photoForm.reset({
        alt: item?.alt ?? '',
        caption: item?.caption ?? '',
        categorySlug: item?.categorySlug ?? NONE_CATEGORY,
      })
      return
    }

    videoForm.reset({
      youtubeUrl: item?.youtubeUrl ?? '',
      alt: item?.alt ?? '',
      caption: item?.caption ?? '',
      categorySlug: item?.categorySlug ?? NONE_CATEGORY,
    })
  }, [open, item, isPhoto, photoForm, videoForm])

  const youtubePreviewId = getYouTubeVideoId(videoForm.watch('youtubeUrl'))

  function handlePhotoSubmit(values: GalleryPhotoFormValues) {
    if (!isEditing && !photoFile) {
      setPhotoError('Selecione uma imagem.')
      return
    }
    if (photoFile && !isAcceptedGalleryPhotoFile(photoFile)) {
      setPhotoError(describeGalleryPhotoRejection(photoFile))
      return
    }
    onSubmitPhoto({
      file: photoFile,
      values: {
        ...values,
        caption: emptyToNull(values.caption) ?? undefined,
        categorySlug: emptyToNull(
          values.categorySlug === NONE_CATEGORY ? undefined : values.categorySlug,
        ) ?? undefined,
      },
    })
  }

  function handleVideoSubmit(values: GalleryVideoFormValues) {
    onSubmitVideo({
      ...values,
      caption: emptyToNull(values.caption) ?? undefined,
      categorySlug: emptyToNull(
        values.categorySlug === NONE_CATEGORY ? undefined : values.categorySlug,
      ) ?? undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isPhoto
                ? 'Editar foto'
                : 'Editar vídeo'
              : isPhoto
                ? 'Adicionar foto'
                : 'Adicionar vídeo'}
          </DialogTitle>
          <DialogDescription>
            {isPhoto
              ? 'JPEG, PNG ou WebP de até 3 MB. Alterações ficam públicas ao salvar.'
              : 'Informe uma URL do YouTube. Alterações ficam públicas ao salvar.'}
          </DialogDescription>
        </DialogHeader>

        {isPhoto ? (
          <Form {...photoForm}>
            <form
              className="space-y-4"
              onSubmit={photoForm.handleSubmit(handlePhotoSubmit)}
            >
              <div className="space-y-2">
                <FormLabel>{isEditing ? 'Substituir imagem (opcional)' : 'Imagem'}</FormLabel>
                <Input
                  type="file"
                  accept={GALLERY_PHOTO_ACCEPT}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setPhotoFile(file)
                    setPhotoError(
                      file && !isAcceptedGalleryPhotoFile(file)
                        ? describeGalleryPhotoRejection(file)
                        : null,
                    )
                  }}
                />
                {photoError ? (
                  <p className="text-sm text-destructive">{photoError}</p>
                ) : null}
              </div>

              <FormField
                control={photoForm.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto alternativo</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={MAX_GALLERY_ALT_LENGTH} />
                    </FormControl>
                    <FormDescription>
                      {String(field.value.length)}/{String(MAX_GALLERY_ALT_LENGTH)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={photoForm.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legenda (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        maxLength={MAX_GALLERY_CAPTION_LENGTH}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      {String((field.value ?? '').length)}/
                      {String(MAX_GALLERY_CAPTION_LENGTH)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={photoForm.control}
                name="categorySlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (opcional)</FormLabel>
                    <Select
                      value={field.value || NONE_CATEGORY}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sem categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_CATEGORY}>Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...videoForm}>
            <form
              className="space-y-4"
              onSubmit={videoForm.handleSubmit(handleVideoSubmit)}
            >
              <FormField
                control={videoForm.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do YouTube</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </FormControl>
                    <FormDescription>
                      Aceita links youtube.com e youtu.be.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {youtubePreviewId ? (
                <img
                  src={`https://i.ytimg.com/vi/${youtubePreviewId}/hqdefault.jpg`}
                  alt="Prévia do vídeo"
                  className="aspect-video w-full rounded-lg border object-cover"
                />
              ) : null}

              <FormField
                control={videoForm.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto alternativo</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={MAX_GALLERY_ALT_LENGTH} />
                    </FormControl>
                    <FormDescription>
                      {String(field.value.length)}/{String(MAX_GALLERY_ALT_LENGTH)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={videoForm.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legenda (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        maxLength={MAX_GALLERY_CAPTION_LENGTH}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      {String((field.value ?? '').length)}/
                      {String(MAX_GALLERY_CAPTION_LENGTH)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={videoForm.control}
                name="categorySlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (opcional)</FormLabel>
                    <Select
                      value={field.value || NONE_CATEGORY}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sem categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_CATEGORY}>Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
