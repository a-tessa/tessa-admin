import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ProfileAvatarFieldProps {
  name: string
  currentAvatarUrl?: string | null
  disabled?: boolean
  onFileChange: (file: File | null) => void
  onRemoveCurrent: () => void
  removeCurrent: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProfileAvatarField({
  name,
  currentAvatarUrl,
  disabled = false,
  onFileChange,
  onRemoveCurrent,
  removeCurrent,
}: ProfileAvatarFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const displayAvatarUrl = removeCurrent ? null : (previewUrl ?? currentAvatarUrl ?? null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Envie uma imagem JPG, PNG ou WebP.')
      onFileChange(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setFileError('A imagem precisa ter no máximo 5 MB.')
      onFileChange(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFileError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
    onFileChange(file)
  }

  function handleRemove() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (currentAvatarUrl) {
      onRemoveCurrent()
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Avatar className={cn('size-20', disabled && 'opacity-60')}>
        {displayAvatarUrl ? (
          <AvatarImage src={displayAvatarUrl} alt={`Foto de ${name}`} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
          {name ? getInitials(name) : <ImageIcon className="size-6" />}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            Alterar foto
          </Button>

          {(displayAvatarUrl || previewUrl) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              disabled={disabled}
              onClick={handleRemove}
            >
              <X className="size-4" />
              Remover
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WebP. Máximo 5 MB.
        </p>

        {fileError ? (
          <p className="text-xs text-destructive">{fileError}</p>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
