import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils'
import { useRepresentantSegments } from '../hooks/use-representant-segments'
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
  isPending: boolean
  onSubmit: (input: RepresentantInput) => void
}

export function RepresentantFormDialog({
  open,
  onOpenChange,
  representant,
  isPending,
  onSubmit,
}: RepresentantFormDialogProps) {
  const isEditing = representant !== undefined
  const segmentsQuery = useRepresentantSegments()
  const [createdSegments, setCreatedSegments] = useState<readonly string[]>([])

  const uniqueSegments = useMemo(() => {
    const source = [
      ...(segmentsQuery.data?.segments ?? []),
      ...createdSegments,
    ]
    const seen = new Set<string>()
    const result: string[] = []
    for (const segment of source) {
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
  }, [segmentsQuery.data?.segments, createdSegments])

  function handleCreateSegment(segment: string) {
    setCreatedSegments((prev) => {
      const trimmed = segment.trim()
      if (trimmed.length === 0) return prev
      const key = trimmed.toLocaleLowerCase('pt-BR')
      const exists = prev.some(
        (item) => item.toLocaleLowerCase('pt-BR') === key,
      )
      return exists ? prev : [...prev, trimmed]
    })
  }

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

    if (representant?.segment) {
      handleCreateSegment(representant.segment)
    }
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
                    <SegmentCombobox
                      value={field.value}
                      onChange={field.onChange}
                      onCreate={handleCreateSegment}
                      segments={uniqueSegments}
                      isLoading={segmentsQuery.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecione um segmento existente ou crie um novo. Novos
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

interface SegmentComboboxProps {
  value: string
  onChange: (value: string) => void
  onCreate: (value: string) => void
  segments: readonly string[]
  isLoading: boolean
}

function SegmentCombobox({
  value,
  onChange,
  onCreate,
  segments,
  isLoading,
}: SegmentComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const trimmedSearch = search.trim()
  const normalizedSearch = trimmedSearch.toLocaleLowerCase('pt-BR')
  const existingMatch = segments.some(
    (segment) => segment.toLocaleLowerCase('pt-BR') === normalizedSearch,
  )
  const canCreate = trimmedSearch.length > 0 && !existingMatch

  function handleCreate() {
    if (!canCreate) return
    onCreate(trimmedSearch)
    onChange(trimmedSearch)
    setOpen(false)
    setSearch('')
  }

  function handleSelect(segment: string) {
    onChange(segment)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal h-10',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {value || 'Selecione ou crie um segmento...'}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Buscar ou criar segmento..."
          />
          <CommandList>
            <CommandEmpty>
              {canCreate ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 size-4" />
                  {`Criar "${trimmedSearch}"`}
                </Button>
              ) : isLoading ? (
                <span className="text-sm text-muted-foreground">
                  Carregando segmentos...
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Nenhum segmento encontrado.
                </span>
              )}
            </CommandEmpty>
            {segments.length > 0 ? (
              <CommandGroup heading="Segmentos">
                {segments.map((segment) => (
                  <CommandItem
                    key={segment}
                    value={segment}
                    onSelect={() => handleSelect(segment)}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        value === segment ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {segment}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {canCreate && segments.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreate} value={`__create__${trimmedSearch}`}>
                    <Plus className="mr-2 size-4" />
                    {`Criar "${trimmedSearch}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
