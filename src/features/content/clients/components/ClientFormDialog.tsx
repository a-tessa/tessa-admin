import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import type { ClientFormData, ClientLogo } from '../types'

const MAX_LOGO_BYTES = 700 * 1024

const clientFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120),
  alt: z
    .string()
    .trim()
    .min(1, 'Texto alternativo é obrigatório.')
    .max(255),
  website: z
    .union([z.literal(''), z.url('Informe uma URL válida (inclua https://).').max(500)])
    .optional(),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: ClientLogo | undefined
  isPending: boolean
  onSubmit: (data: ClientFormData) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  isPending,
  onSubmit,
}: ClientFormDialogProps) {
  const isEditing = client !== undefined
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      alt: '',
      website: '',
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      name: client?.name ?? '',
      alt: client?.alt ?? '',
      website: client?.website ?? '',
    })

    setSelectedFile(null)
    setFileError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client])

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

    if (file.type !== 'image/png') {
      setFileError('O logo precisa estar em PNG.')
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_LOGO_BYTES) {
      setFileError(
        `Arquivo de ${formatBytes(file.size)}. Máximo permitido: 700 KB.`,
      )
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFileError(null)
    setSelectedFile(file)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function clearFile() {
    setSelectedFile(null)
    setFileError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(values: ClientFormValues) {
    if (!isEditing && !selectedFile) {
      setFileError('Envie o logo em PNG (máx. 700 KB).')
      return
    }

    const payload: ClientFormData['payload'] = {
      name: values.name,
      alt: values.alt,
      ...(values.website && values.website.trim().length > 0
        ? { website: values.website.trim() }
        : {}),
      ...(isEditing && !selectedFile ? { logoUrl: client.logoUrl } : {}),
    }

    onSubmit({
      payload,
      file: selectedFile ?? undefined,
    })
  }

  const displayImage = previewUrl ?? client?.logoUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[32dvw]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar cliente' : 'Novo cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize dados e, se quiser, substitua o logo.'
              : 'Envie o logo em PNG (fundo transparente recomendado, máx. 700 KB).'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">Logo</p>
              <div className="flex flex-col gap-3">
                <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="Preview do logo"
                        className="max-h-full max-w-full object-contain p-4"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={clearFile}
                        aria-label="Remover logo"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <ImageIcon className="size-10 text-muted-foreground" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    {displayImage ? 'Trocar logo' : 'Enviar logo'}
                  </Button>

                  {selectedFile ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="max-w-[200px] truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-muted-foreground/70">
                        ({formatBytes(selectedFile.size)})
                      </span>
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  PNG com transparência. Máx. 700 KB. Será convertido para
                  WebP e exibido em escala de cinza no site.
                </p>

                {fileError ? (
                  <p className="text-sm text-destructive">{fileError}</p>
                ) : null}
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Acme Corp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Usado internamente. Ajuda na organização.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto alternativo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Logo Acme Corp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Descrição acessível exibida para leitores de tela.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acme.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Se informado, o logo vira um link clicável no site.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
