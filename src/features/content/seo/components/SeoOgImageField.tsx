import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface SeoOgImageFieldProps {
  readonly label: string
  readonly url: string | undefined
  readonly disabled?: boolean
  readonly onUploaded: (url: string) => void
  readonly onRemoved: () => void
  readonly onUpload: (
    file: File,
    onProgress: (percentage: number) => void,
  ) => Promise<{ url: string }>
  readonly onDelete: () => Promise<void>
}

export function SeoOgImageField({
  label,
  url,
  disabled,
  onUploaded,
  onRemoved,
  onUpload,
  onDelete,
}: SeoOgImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const displayUrl = localPreview ?? url ?? null
  const isBusy = Boolean(disabled) || isUploading || isDeleting

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function clearLocalSelection(): void {
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(null)
    setSelectedFile(null)
    setUploadProgress(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const next = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!next) return

    const preview = URL.createObjectURL(next)
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(preview)
    setSelectedFile(next)
    setUploadProgress(null)
  }

  async function handleSave(): Promise<void> {
    if (!selectedFile) {
      toast.error('Selecione uma imagem antes de enviar.')
      return
    }

    setIsUploading(true)
    try {
      const result = await onUpload(selectedFile, setUploadProgress)
      onUploaded(result.url)
      clearLocalSelection()
      toast.success(`Imagem Open Graph de ${label} salva no rascunho.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no envio.')
      setUploadProgress(null)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemove(): Promise<void> {
    if (selectedFile) {
      clearLocalSelection()
      return
    }

    setIsDeleting(true)
    try {
      await onDelete()
      onRemoved()
      toast.success(`Imagem Open Graph de ${label} removida do rascunho.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao remover.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative flex aspect-[1.91/1] w-full max-w-md items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30',
          displayUrl && 'border-solid',
        )}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <ImagePlus className="size-8" />
            <span>1200 × 630 recomendado</span>
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
          disabled={isBusy}
          onClick={(): void => {
            fileInputRef.current?.click()
          }}
        >
          <Upload className="size-3.5" />
          {displayUrl ? 'Trocar imagem' : 'Enviar imagem'}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isBusy || !selectedFile}
          onClick={(): void => {
            void handleSave()
          }}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          Salvar imagem
        </Button>
        {displayUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            className="text-destructive hover:text-destructive"
            onClick={(): void => {
              void handleRemove()
            }}
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {selectedFile ? 'Cancelar seleção' : 'Remover'}
          </Button>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isBusy}
        onChange={handleFileChange}
      />
    </div>
  )
}
