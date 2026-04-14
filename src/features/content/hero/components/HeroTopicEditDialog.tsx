import { zodResolver } from '@hookform/resolvers/zod'
import { Expand, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import type { HeroTopic } from '../types'

const heroTopicFormSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.'),
  description: z.string().trim().min(1, 'Descrição é obrigatória.'),
  buttonText: z.string().trim().min(1, 'Texto do botão é obrigatório.'),
  buttonUrl: z.string().trim().min(1, 'URL do botão é obrigatória.'),
})

type HeroTopicFormValues = z.infer<typeof heroTopicFormSchema>

export interface HeroTopicEditResult {
  title: string
  description: string
  button: { text: string; url: string }
  image?: string | undefined
  file?: File | undefined
}

interface HeroTopicEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: HeroTopic | undefined
  isPending: boolean
  onSubmit: (result: HeroTopicEditResult) => void
}

export function HeroTopicEditDialog({
  open,
  onOpenChange,
  topic,
  isPending,
  onSubmit,
}: HeroTopicEditDialogProps) {
  const isEditing = topic !== undefined
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const form = useForm<HeroTopicFormValues>({
    resolver: zodResolver(heroTopicFormSchema),
    values: {
      title: topic?.title ?? '',
      description: topic?.description ?? '',
      buttonText: topic?.button.text ?? '',
      buttonUrl: topic?.button.url ?? '',
    },
  })

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function clearFile() {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(values: HeroTopicFormValues) {
    onSubmit({
      title: values.title,
      description: values.description,
      button: { text: values.buttonText, url: values.buttonUrl },
      image: topic?.image,
      file: selectedFile ?? undefined,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      clearFile()
      form.reset()
    }
    onOpenChange(nextOpen)
  }

  const displayImage = previewUrl ?? topic?.image

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-[35dvw]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar tópico' : 'Novo tópico'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados deste tópico do hero.'
              : 'Preencha os dados do novo tópico do hero.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Imagem</p>
              <div className="flex flex-col gap-4">
                <div className="group/img relative h-auto w-full shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/img:bg-black/40"
                      >
                        <Expand className="size-5 text-white opacity-0 transition-opacity group-hover/img:opacity-100" />
                      </button>
                    </>
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <ImageIcon className="size-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    {displayImage ? 'Trocar imagem' : 'Enviar imagem'}
                  </Button>
                  {selectedFile ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="max-w-[160px] truncate">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="shrink-0 rounded-full p-0.5 hover:bg-accent"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG ou WebP. Máx 4 MB.
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Transforme seu negócio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Texto descritivo do tópico..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buttonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do botão</FormLabel>
                    <FormControl>
                      <Input placeholder="Saiba mais" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buttonUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do botão</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
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

      {displayImage ? (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl! border-none bg-transparent p-0 shadow-none [&>button]:text-white">
            <DialogHeader className="sr-only">
              <DialogTitle>Visualizar imagem</DialogTitle>
              <DialogDescription>Imagem ampliada do tópico hero.</DialogDescription>
            </DialogHeader>
            <img
              src={displayImage}
              alt="Imagem ampliada"
              className="h-auto w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </Dialog>
  )
}
