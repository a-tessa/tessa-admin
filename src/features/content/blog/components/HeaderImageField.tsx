import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface HeaderImageFieldProps {
  existingUrl: string | null
  existingAlt: string | null
  file: File | null
  removed: boolean
  disabled?: boolean
  onFileChange: (file: File | null) => void
  onRemoveExisting: (removed: boolean) => void
}

export function HeaderImageField({
  existingUrl,
  existingAlt,
  file,
  removed,
  disabled,
  onFileChange,
  onRemoveExisting,
}: HeaderImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const displayUrl = useMemo(() => {
    if (file && localPreview) return localPreview
    if (!removed && existingUrl) return existingUrl
    return null
  }, [file, localPreview, removed, existingUrl])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    event.target.value = ''
    if (next) {
      const url = URL.createObjectURL(next)
      if (localPreview) URL.revokeObjectURL(localPreview)
      setLocalPreview(url)
      onFileChange(next)
      onRemoveExisting(false)
    }
  }

  function handleClear() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
    onFileChange(null)
    if (existingUrl) {
      onRemoveExisting(true)
    }
  }

  function handlePick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30',
          displayUrl && 'border-solid',
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={existingAlt ?? 'Pré-visualização da imagem de capa'}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <ImagePlus className="size-8" />
            <span>Sem imagem de capa</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePick}
          disabled={disabled}
        >
          <Upload className="size-3.5" />
          {displayUrl ? 'Trocar imagem' : 'Enviar imagem'}
        </Button>

        {displayUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Remover
          </Button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  )
}
