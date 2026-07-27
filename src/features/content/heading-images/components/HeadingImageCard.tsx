import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  useDeleteHeadingImage,
  useUpsertHeadingImage,
} from '../hooks/use-heading-images'
import type { HeadingImageEntry, HeadingImagePageKey } from '../types'
import { HEADING_IMAGE_PAGE_LABELS } from '../types'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

interface HeadingImageCardProps {
  pageKey: HeadingImagePageKey
  entry: HeadingImageEntry | undefined
  disabled?: boolean
}

export function HeadingImageCard({
  pageKey,
  entry,
  disabled,
}: HeadingImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const upsertMutation = useUpsertHeadingImage()
  const deleteMutation = useDeleteHeadingImage()

  const label = HEADING_IMAGE_PAGE_LABELS[pageKey]
  const isBusy =
    disabled || upsertMutation.isPending || deleteMutation.isPending

  const displayUrl = useMemo(() => {
    if (selectedFile && localPreview) return localPreview
    return entry?.url ?? null
  }, [selectedFile, localPreview, entry?.url])

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function clearLocalSelection() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
    setSelectedFile(null)
    setUploadProgress(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!next) return

    const url = URL.createObjectURL(next)
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(url)
    setSelectedFile(next)
    setUploadProgress(null)
  }

  function handleSave() {
    if (!selectedFile) {
      toast.error('Selecione uma imagem antes de salvar.')
      return
    }

    upsertMutation.mutate(
      {
        pageKey,
        file: selectedFile,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          toast.success(`Imagem de ${label} salva no rascunho.`)
          clearLocalSelection()
        },
        onError: (error) => {
          toast.error(error.message)
          setUploadProgress(null)
        },
      },
    )
  }

  function handleRemove() {
    deleteMutation.mutate(pageKey, {
      onSuccess: () => {
        toast.success(`Customização de ${label} removida do rascunho.`)
        clearLocalSelection()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription className="font-mono text-xs">/{pageKey}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30',
            displayUrl && 'border-solid',
            !displayUrl && 'bg-[oklch(0.8853_0_0)]',
          )}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt=""
              className="size-full object-cover object-center"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="size-8" />
              <span>Fallback cinza</span>
            </div>
          )}
        </div>

        {uploadProgress !== null ? (
          <p className="text-xs text-muted-foreground">
            Enviando… {String(uploadProgress)}%
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
          >
            <Upload className="size-3.5" />
            {displayUrl ? 'Trocar imagem' : 'Enviar imagem'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isBusy || !selectedFile}
          >
            {upsertMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Salvar rascunho
          </Button>

          {entry?.url || selectedFile ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedFile) {
                  clearLocalSelection()
                  return
                }
                handleRemove()
              }}
              disabled={isBusy || (!entry?.url && !selectedFile)}
              className="text-destructive hover:text-destructive"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {selectedFile ? 'Cancelar seleção' : 'Remover customização'}
            </Button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
      </CardContent>
    </Card>
  )
}
