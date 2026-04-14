import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
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
import type { Category, CategoryInput } from '../types'

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug é obrigatório.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use apenas letras minúsculas, números e hífens.',
    ),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | undefined
  isPending: boolean
  onSubmit: (input: CategoryInput) => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  isPending,
  onSubmit,
}: CategoryFormDialogProps) {
  const isEditing = category !== undefined
  const slugManuallyEditedRef = useRef(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  useEffect(() => {
    if (open) {
      slugManuallyEditedRef.current = false
      form.reset({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
      })
    }
  }, [open, category, form])

  function handleNameChange(value: string) {
    form.setValue('name', value, { shouldDirty: true, shouldValidate: true })

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

  function handleSubmit(values: CategoryFormValues) {
    onSubmit({ name: values.name, slug: values.slug })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados desta categoria.'
              : 'Preencha os dados da nova categoria.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Adesivos"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
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
                      placeholder="ex: adesivos"
                      {...field}
                      onChange={(e) =>
                        handleSlugChange(e.target.value, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Gerado do nome enquanto você digita. Edite aqui para um slug
                    personalizado.
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
