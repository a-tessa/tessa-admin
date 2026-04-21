import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useId, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { BRAZILIAN_STATES } from '../constants'
import type { Representant, RepresentantInput } from '../types'

const representantFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120),
  companyName: z
    .string()
    .trim()
    .min(1, 'Nome da empresa é obrigatório.')
    .max(160),
  segment: z.string().trim().min(1, 'Segmento é obrigatório.').max(120),
  phone: z.string().trim().min(1, 'Telefone é obrigatório.').max(40),
  city: z.string().trim().min(1, 'Cidade é obrigatória.').max(120),
  state: z.string().trim().min(1, 'Estado é obrigatório.').max(120),
  email: z
    .email('Email inválido.')
    .trim()
    .min(1, 'Email é obrigatório.')
    .max(255),
})

type RepresentantFormValues = z.infer<typeof representantFormSchema>

const defaultValues: RepresentantFormValues = {
  name: '',
  companyName: '',
  segment: '',
  phone: '',
  city: '',
  state: '',
  email: '',
}

interface RepresentantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  representant?: Representant | undefined
  segments: readonly string[]
  isPending: boolean
  onSubmit: (input: RepresentantInput) => void
}

export function RepresentantFormDialog({
  open,
  onOpenChange,
  representant,
  segments,
  isPending,
  onSubmit,
}: RepresentantFormDialogProps) {
  const isEditing = representant !== undefined
  const segmentsListId = useId()

  const uniqueSegments = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const segment of segments) {
      const trimmed = segment.trim()
      if (trimmed.length === 0) continue
      const key = trimmed.toLocaleLowerCase('pt-BR')
      if (seen.has(key)) continue
      seen.add(key)
      result.push(trimmed)
    }
    return result.sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
    )
  }, [segments])

  const form = useForm<RepresentantFormValues>({
    resolver: zodResolver(representantFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      name: representant?.name ?? '',
      companyName: representant?.companyName ?? '',
      segment: representant?.segment ?? '',
      phone: representant?.phone ?? '',
      city: representant?.city ?? '',
      state: representant?.state ?? '',
      email: representant?.email ?? '',
    })
  }, [open, representant, form])

  function handleSubmit(values: RepresentantFormValues) {
    onSubmit({
      name: values.name,
      companyName: values.companyName,
      segment: values.segment,
      phone: values.phone,
      city: values.city,
      state: values.state,
      email: values.email,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar representante' : 'Novo representante'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados deste representante.'
              : 'Preencha os dados do novo representante.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Representações Silva"
                        autoComplete="organization"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="segment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segmento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Construção civil"
                      list={segmentsListId}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <datalist id={segmentsListId}>
                    {uniqueSegments.map((segment) => (
                      <option key={segment} value={segment} />
                    ))}
                  </datalist>
                  <FormDescription>
                    Selecione um segmento existente ou digite um novo. Novos
                    segmentos ficam disponíveis para os próximos cadastros.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: (11) 99999-9999"
                      inputMode="tel"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: São Paulo"
                        autoComplete="address-level2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.code} — {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do contato</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
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
