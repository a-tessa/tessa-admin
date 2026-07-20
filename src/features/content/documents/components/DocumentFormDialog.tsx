import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import type { DocumentAdmin, DocumentFormInput } from '../types'

const documentFormSchema = z.object({
  title: z.string().trim().min(2, 'Título é obrigatório.').max(200),
  description: z.string().trim().max(2000).optional(),
  titleEn: z.string().trim().max(200).optional(),
  titleEs: z.string().trim().max(200).optional(),
  descriptionEn: z.string().trim().max(2000).optional(),
  descriptionEs: z.string().trim().max(2000).optional(),
  categorySlug: z.string().trim().min(1, 'Selecione uma categoria.'),
  order: z.number().int().min(0).max(9999),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

interface DocumentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: DocumentAdmin | undefined
  isPending: boolean
  onSubmit: (input: DocumentFormInput) => void
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

export function DocumentFormDialog({
  open,
  onOpenChange,
  document,
  isPending,
  onSubmit,
}: DocumentFormDialogProps) {
  const isEditing = document !== undefined
  const categoriesQuery = useQuery(categoriesListQuery())
  const categories = categoriesQuery.data?.categories ?? []

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      titleEn: '',
      titleEs: '',
      descriptionEn: '',
      descriptionEs: '',
      categorySlug: '',
      order: 0,
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      title: document?.title ?? '',
      description: document?.description ?? '',
      titleEn: document?.titleEn ?? '',
      titleEs: document?.titleEs ?? '',
      descriptionEn: document?.descriptionEn ?? '',
      descriptionEs: document?.descriptionEs ?? '',
      categorySlug: document?.categorySlug ?? '',
      order: document?.order ?? 0,
    })
  }, [open, document, form])

  function handleSubmit(values: DocumentFormValues) {
    onSubmit({
      title: values.title.trim(),
      description: emptyToNull(values.description),
      titleEn: emptyToNull(values.titleEn),
      titleEs: emptyToNull(values.titleEs),
      descriptionEn: emptyToNull(values.descriptionEn),
      descriptionEs: emptyToNull(values.descriptionEs),
      categorySlug: values.categorySlug,
      order: values.order,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar documento' : 'Novo documento'}
          </DialogTitle>
          <DialogDescription>
            O título em português é a fonte. Inglês e espanhol são traduzidos
            automaticamente; você pode sobrescrever abaixo. Envie os PDFs por
            idioma na listagem.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (pt-BR)</FormLabel>
                  <FormControl>
                    <Input placeholder="Manual de instalação: Carport" {...field} />
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Breve descrição do documento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="categorySlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Use categorias já publicadas na landing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={9999}
                        value={field.value}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) => {
                          const next = event.target.valueAsNumber
                          field.onChange(Number.isNaN(next) ? 0 : next)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Menor número aparece primeiro.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-lg border-2 border-border p-3">
              <p className="text-sm font-medium">Sobrescritas manuais (opcional)</p>
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título (en)</FormLabel>
                    <FormControl>
                      <Input placeholder="Deixe vazio para usar a tradução automática" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleEs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título (es)</FormLabel>
                    <FormControl>
                      <Input placeholder="Deixe vazio para usar a tradução automática" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (en)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionEs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (es)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
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
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando…
                  </>
                ) : isEditing ? (
                  'Salvar'
                ) : (
                  'Criar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
